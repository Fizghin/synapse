const { exec, spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');
const { Device } = require('ps4-waker');

const ps4 = new Device({
  // Using default credentials/configs resolved automatically by ps4-waker
});

const WS_PORT = 8085;
const wss = new WebSocket.Server({ port: WS_PORT });

// Load the 500 features
const features = require('./synapse_500_features.json');

// Feature Map for O(1) lookup
const featureMap = new Map();
features.forEach(f => {
    featureMap.set(f.id, f);
});

console.log(`[SYNAPSE_OS] Automation Server Started. Loaded ${featureMap.size} features.`);
console.log(`[SYNAPSE_OS] Listening on ws://0.0.0.0:${WS_PORT}`);

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Touchless HUD Connected from ${ip}`);

    // Heartbeat logic
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (message) => {
        try {
            const payload = JSON.parse(message);
            if (payload.type === 'PS4_WAKE') {
                try {
                    await ps4.turnOn();
                    ws.send(JSON.stringify({ type: 'ACK_OK', id: 'PS4_WAKE' }));
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'PS4_ERROR', error: err.message }));
                }
            } else if (payload.type === 'PS4_SLEEP') {
                try {
                    await ps4.turnOff();
                    ws.send(JSON.stringify({ type: 'ACK_OK', id: 'PS4_SLEEP' }));
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'PS4_ERROR', error: err.message }));
                }
            } else if (payload.type === 'PS4_LAUNCH_GAME') {
                try {
                    await ps4.startTitle(payload.titleId);
                    ws.send(JSON.stringify({ type: 'ACK_OK', id: 'PS4_LAUNCH_GAME' }));
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'PS4_ERROR', error: err.message }));
                }
            } else if (payload.type === 'PS4_SEND_KEY') {
                try {
                    await ps4.sendKeys([payload.key]);
                    ws.send(JSON.stringify({ type: 'ACK_OK', id: 'PS4_SEND_KEY' }));
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'PS4_ERROR', error: err.message }));
                }
            } else if (payload.type === 'PS4_CINEMA_MODE') {
                try {
                    await ps4.turnOn();
                    // Wait for the system to boot up, then start Netflix (CUSA00129 is common Netflix ID)
                    setTimeout(async () => {
                        try { await ps4.startTitle('CUSA00129'); } catch (e) {}
                    }, 15000); 
                    ws.send(JSON.stringify({ type: 'ACK_OK', id: 'PS4_CINEMA_MODE' }));
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'PS4_ERROR', error: err.message }));
                }
            } else if (payload.type === 'START_SCRCPY') {
                exec('adb devices', (error, stdout) => {
                    const devices = stdout.split('\n').slice(1).filter(l => l.includes('\tdevice')).map(l => l.split('\t')[0]);
                    const targetDevice = payload.deviceId || devices[0];
                    if (!targetDevice || !devices.includes(targetDevice)) {
                        return ws.send(JSON.stringify({ type: 'STREAM_FAILED', error: 'Device not found' }));
                    }
                    const scrcpyProcess = spawn('scrcpy', ['-s', targetDevice, '--bit-rate', '8M', '--max-fps', '60', '--window-title', 'SYNAPSE_OS | NODE LINK']);
                    ws.send(JSON.stringify({ type: 'STREAM_ACTIVE' }));
                    scrcpyProcess.on('error', (err) => {
                        console.error(`[SCRCPY] Error: ${err.message}`);
                    });
                });
            } else if (payload && payload.feature) {
                handleFeature(payload.feature, payload, ws);
            } else {
                 console.log(`[WS] Unmapped Payload: ${message}`);
            }
        } catch (e) {
            console.error(`[WS] Payload Parse Error: ${e.message}`);
        }
    });

    ws.on('close', () => {
        console.log(`[WS] Touchless HUD Disconnected.`);
    });
});

// PS4 Status Polling
let lastPs4Status = null;
setInterval(async () => {
    try {
        const status = await ps4.getDeviceStatus();
        if (!lastPs4Status || lastPs4Status.status !== status.status || lastPs4Status.runningAppTitleId !== status.runningAppTitleId) {
            lastPs4Status = status;
            wss.clients.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'PS4_STATUS', status: status.status, titleName: status.runningAppTitleName }));
                }
            });
        }
    } catch (err) {
        if (!lastPs4Status || lastPs4Status.status !== 'Offline') {
            lastPs4Status = { status: 'Offline' };
            wss.clients.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'PS4_STATUS', status: 'Offline' }));
                }
            });
        }
    }
}, 5000);

const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

// Massive Asynchronous Routing Function
function handleFeature(featureId, rawPayload, ws) {
    const featureDef = featureMap.get(featureId);

    if (!featureDef) {
         console.warn(`[ROUTER] Received unknown feature ID: ${featureId}`);
         return;
    }

    console.log(`[ROUTER] Executing #${featureId}: ${featureDef.name}`);
    
    // Execute Native Command mapped to the feature
    if (featureDef.command) {
        
        // --- Special Subsystem Overrides ---
        if (featureDef.command.includes('/sys/class/leds/')) {
             // DS4 Ambilight Direct Write Override
             try {
                 // Example dynamic glob resolution for DS4
                 exec(`for f in /sys/class/leds/*054C*/blue/brightness; do echo 255 > "$f" 2>/dev/null; done`, (err) => {
                     if(err) console.error(`[DS4_SYSFS] Error writing to LED: ${err.message}`);
                 });
             } catch(e) { console.error(e) }
             return;
        }

        // Standard Execution
        exec(featureDef.command, (error, stdout, stderr) => {
            if (error) {
                console.error(`[EXEC_ERR] Feature #${featureId}: ${error.message}`);
                // Optional: Send error back to tablet
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ACK_ERR", id: featureId, error: error.message }));
                }
                return;
            }
            if (stdout) console.log(`[EXEC_OUT] ${stdout.trim()}`);
            if (stderr) console.error(`[EXEC_STDERR] ${stderr.trim()}`);
            
            // Acknowledge execution to HUD
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ACK_OK", id: featureId }));
            }
        });
    }
}
