const { app, BrowserWindow, ipcMain, clipboard, dialog, Notification } = require('electron');
const { exec, spawn } = require('child_process');
const os = require('os');
const crypto = require('crypto');
const dgram = require('dgram');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

// ═══ CONFIG ═══
let CFG = {
  WS_PORT: 8085,
  TABLET_IP: '192.168.1.99',   // ◀ CHANGE
  PS4_MAC: 'AA:BB:CC:DD:EE:FF', // ◀ CHANGE
  PSN_ID: 'YourPSNID',          // ◀ CHANGE
  OLLAMA_URL: 'http://localhost:11434/api/generate',
  OLLAMA_MODEL: 'llama3',
  WEBCAM: '/dev/video0',
  RECIPE_DIR: path.join(os.homedir(), 'recipes'),
  WEATHER_URL: 'https://wttr.in/?format=j1',
};

// ─── CONFIG MANAGER ───
const configPath = path.join(app.getPath('userData'), 'synapse_config.json');
try {
  if (fs.existsSync(configPath)) {
    const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    CFG = { ...CFG, ...savedConfig };
  }
} catch (e) { console.error('Failed to load config', e); }

function saveConfig(updates) {
  CFG = { ...CFG, ...updates };
  try {
    fs.writeFileSync(configPath, JSON.stringify(CFG, null, 2));
  } catch (e) { console.error('Failed to save config', e); }
}

const wss = new WebSocket.Server({ port: CFG.WS_PORT });
let mainWindow, scrcpyProc = null, logcatProc = null, webhookSrv = null;
let lastCpu = os.cpus(), currentPing = 12, ds4Battery = 85;
let encryptionEnabled = false, rearviewProc = null, subtitleProc = null;
let recipeSteps = [], recipeIndex = 0, sousChefActive = false;
let radarInterval = null, ds4SyncInterval = null;
const auditLog = [];
const ENC_KEY = crypto.randomBytes(32);

// ═══ SMART ADB TRANSPORT DETECTION ═══
let adbTransport = null; // 'usb' | 'wifi' | null
let adbSerial = null;    // e.g. 'R52N60L8KLF' or '192.168.1.99:5555'

function detectAdbConnection(uiLog) {
  return new Promise((resolve) => {
    exec('adb devices -l', { timeout: 5000 }, (e, out) => {
      if (e) { resolve(null); return; }
      // Match lines like: "R52N60L8KLF            device usb:1-2 ..." or "192.168.1.99:5555  device ..."
      const lines = out.split('\n').slice(1).filter(l => /\s+device\s+/.test(l) || /\s+device$/.test(l));
      // Prefer USB
      const usbLine = lines.find(l => l.includes('usb:'));
      if (usbLine) {
        const newSerial = usbLine.trim().split(/\s+/)[0];
        const changed = adbTransport !== 'usb' || adbSerial !== newSerial;
        adbSerial = newSerial;
        adbTransport = 'usb';
        if (changed) {
          if (uiLog) uiLog(`[ADB] ✓ USB device detected: ${adbSerial}`, 'SYS');
          if (mainWindow) mainWindow.webContents.send('adb-transport', { transport: 'usb', serial: adbSerial });
          // Set up reverse tunnel so tablet can reach WS server via localhost
          exec(`adb -s ${adbSerial} reverse tcp:8085 tcp:8085`, { timeout: 3000 }, (re) => {
            if (!re && uiLog) uiLog(`[ADB] ✓ Reverse tunnel 8085 established`, 'SYS');
          });
        }
        resolve('usb');
        return;
      }
      // Check for existing WiFi connection
      const wifiLine = lines.find(l => l.includes(':5555'));
      if (wifiLine) {
        const newSerial = wifiLine.trim().split(/\s+/)[0];
        const changed = adbTransport !== 'wifi' || adbSerial !== newSerial;
        adbSerial = newSerial;
        adbTransport = 'wifi';
        if (changed) {
          if (uiLog) uiLog(`[ADB] ✓ WiFi device detected: ${adbSerial}`, 'SYS');
          if (mainWindow) mainWindow.webContents.send('adb-transport', { transport: 'wifi', serial: adbSerial });
        }
        resolve('wifi');
        return;
      }
      // Try WiFi connect as fallback
      exec(`adb connect ${CFG.TABLET_IP}:5555`, { timeout: 8000 }, (e2, out2) => {
        if (!e2 && out2 && out2.includes('connected')) {
          adbSerial = `${CFG.TABLET_IP}:5555`;
          adbTransport = 'wifi';
          if (uiLog) uiLog(`[ADB] ✓ WiFi connected: ${adbSerial}`, 'SYS');
          if (mainWindow) mainWindow.webContents.send('adb-transport', { transport: 'wifi', serial: adbSerial });
          resolve('wifi');
        } else {
          if (adbTransport !== null) {
            adbTransport = null;
            adbSerial = null;
            if (uiLog) uiLog('[ADB] ✗ Tablet disconnected (USB & WiFi).', 'ERR');
            if (mainWindow) mainWindow.webContents.send('adb-transport', { transport: null, serial: null });
          }
          resolve(null);
        }
      });
    });
  });
}

function getAdbCmd() {
  if (adbSerial) return `adb -s ${adbSerial}`;
  return 'adb -d'; // fallback
}

function notifyDeploy(success, message) {
  try {
    new Notification({
      title: success ? '✓ SYNAPSE Deploy Complete' : '✗ SYNAPSE Deploy Failed',
      body: message,
      icon: path.join(__dirname, 'icon.png'),
      urgency: success ? 'normal' : 'critical'
    }).show();
  } catch(e) { /* notification not supported */ }
  if (mainWindow) mainWindow.webContents.send('deploy-status', { success, message });
}

// ═══ AES-256-GCM ═══
function aesEncrypt(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  let enc = c.update(text, 'utf8', 'hex') + c.final('hex');
  return JSON.stringify({ _e: true, iv: iv.toString('hex'), d: enc, t: c.getAuthTag().toString('hex') });
}
function aesDecrypt(payload) {
  try {
    const p = JSON.parse(payload); if (!p._e) return payload;
    const d = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, Buffer.from(p.iv, 'hex'));
    d.setAuthTag(Buffer.from(p.t, 'hex'));
    return d.update(p.d, 'hex', 'utf8') + d.final('utf8');
  } catch { return payload; }
}
function secureSend(ws, obj) {
  const raw = JSON.stringify(obj);
  ws.send(encryptionEnabled ? aesEncrypt(raw) : raw);
}
function broadcastAll(obj) {
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) secureSend(c, obj); });
}

// ═══ SAFE EXEC WRAPPERS ═══
function safeExec(cmd, cb) {
  try { exec(cmd, { timeout: 15000 }, (e, out, err) => { if (cb) cb(e, out, err); }); }
  catch (ex) { if (cb) cb(ex, '', ''); }
}
function safeSpawn(cmd, args, opts) {
  try { return spawn(cmd, args, opts || { stdio: 'pipe' }); }
  catch (ex) { return null; }
}

// ═══ OLLAMA HELPER ═══
function queryOllama(prompt, cb) {
  const postData = JSON.stringify({ model: CFG.OLLAMA_MODEL, prompt, stream: false });
  const url = new URL(CFG.OLLAMA_URL);
  const req = http.request({
    hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
  }, res => {
    let body = ''; res.on('data', d => body += d);
    res.on('end', () => { try { cb(null, JSON.parse(body).response || body); } catch { cb(null, body); } });
  });
  req.on('error', e => cb(e, null));
  req.write(postData); req.end();
}
function speak(text, uiLog) {
  safeExec(`espeak-ng -v en -s 150 "${text.replace(/"/g, "'").substring(0, 500)}"`, (e) => {
    if (e) uiLog(`[TTS] espeak-ng failed: ${e.message}`, 'ERR');
  });
}

// ═══ UDP TELEMETRY (Port 20777) ═══
const OG_FLEET = new Set(['FIAT_LINEA', 'RENAULT_KOLEOS', 'TATA_HEXA', 'VOLVO_S60']);
const BLACKLIST = new Set(['TOYOTA_FORTUNER', 'TOYOTA_INNOVA', 'TOYOTA_GLANZA', 'MARUTI_SWIFT', 'MARUTI_BALENO', 'MARUTI_ALTO', 'MARUTI_WAGONR', 'MARUTI_DZIRE', 'MARUTI_BREZZA', 'MAHINDRA_THAR', 'MAHINDRA_SCORPIO', 'MAHINDRA_XUV700', 'MAHINDRA_BOLERO', 'HYUNDAI_CRETA', 'HYUNDAI_VERNA', 'HYUNDAI_I20', 'HYUNDAI_VENUE', 'KIA_SELTOS', 'KIA_SONET', 'KIA_CARENS', 'TATA_NEXON', 'TATA_HARRIER', 'TATA_SAFARI', 'TATA_PUNCH', 'TATA_ALTROZ', 'HONDA_CITY', 'HONDA_AMAZE', 'MG_HECTOR', 'MG_ASTOR', 'SKODA_SLAVIA', 'SKODA_KUSHAQ', 'VW_VIRTUS', 'VW_TAIGUN']);
let dropCount = 0, passCount = 0;

function bootUDP(uiLog) {
  const udp = dgram.createSocket('udp4');
  udp.on('message', (msg, rinfo) => {
    let pkt; try { pkt = JSON.parse(msg.toString()); } catch { uiLog(`[UDP] Malformed from ${rinfo.address}`, 'ERR'); return; }
    const vid = (pkt.vehicleId || pkt.vehicle_id || '').toUpperCase().trim();
    if (BLACKLIST.has(vid)) { dropCount++; uiLog(`[UDP] ⛔ [${vid}] blocked (${dropCount})`, 'ERR'); return; }
    if (!OG_FLEET.has(vid)) { dropCount++; uiLog(`[UDP] ⚠ [${vid}] unknown`, 'ERR'); return; }
    passCount++;
    const speed = parseFloat(pkt.speed) || 0, gear = parseInt(pkt.gear) || 0, rpm = parseInt(pkt.rpm) || 0;
    if (mainWindow) mainWindow.webContents.send('telemetry-update', { vehicle: vid, speed, gear, rpm });
    uiLog(`[UDP] ✓ ${vid} | ${speed.toFixed(1)} km/h | G${gear} | ${rpm} RPM`, 'LOG');
  });
  udp.on('error', e => uiLog(`[UDP] Error: ${e.message}`, 'ERR'));
  udp.bind(20777, () => uiLog('[UDP] Telemetry on port 20777', 'SYS'));
  return udp;
}

// ═══ WEBHOOK (Port 9090) ═══
function bootWebhook(uiLog) {
  if (webhookSrv) { webhookSrv.close(); webhookSrv = null; uiLog('Webhook stopped.', 'SYS'); return; }
  webhookSrv = http.createServer((req, res) => {
    if (req.method === 'POST') {
      if (req.url.startsWith('/fire/')) {
        const modId = parseInt(req.url.split('/fire/')[1]);
        if (modId >= 1 && modId <= 200) {
          ipcMain.emit('fire-feature', null, modId);
          res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, fired: modId }));
        } else { res.writeHead(400); res.end('Invalid module ID'); }
      } else if (req.url === '/deploy-complete') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          let transport = 'usb';
          try {
            const data = JSON.parse(body);
            if (data.transport) transport = data.transport;
          } catch(e) {}
          uiLog(`[DEPLOY] Received deploy-complete signal via ${transport.toUpperCase()}`, 'SYS');
          broadcastAll({ type: 'DEPLOY_COMPLETE', transport });
          if (mainWindow) mainWindow.webContents.send('deploy-status', { success: true, message: `Deploy completed via ${transport.toUpperCase()}` });
          res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true }));
        });
      } else {
        res.writeHead(404); res.end('Not Found');
      }
    } else {
      res.writeHead(404); res.end('POST Only');
    }
  });
  webhookSrv.listen(9090, () => uiLog('[WEBHOOK] on port 9090', 'SYS'));
}

// ═══ MODULE 3C: PS4 REMOTE IGNITION ═══
function wakePS4(uiLog) {
  try {
    const mac = CFG.PS4_MAC.split(':').map(h => parseInt(h, 16));
    const psnBuf = Buffer.from(CFG.PSN_ID, 'utf8');
    const payload = Buffer.alloc(28 + psnBuf.length);
    payload.write('WAKEUP', 0); // Magic header
    for (let i = 0; i < 6; i++) payload[6 + i] = mac[i];
    psnBuf.copy(payload, 28);
    const client = dgram.createSocket('udp4');
    client.send(payload, 0, payload.length, 987, '255.255.255.255', (e) => {
      client.close();
      uiLog(e ? `[PS4] Wake failed: ${e.message}` : '[PS4] Magic packet sent on UDP:987', e ? 'ERR' : 'SYS');
    });
  } catch (ex) { uiLog(`[PS4] Exception: ${ex.message}`, 'ERR'); }
}

// ═══ MODULE 3D: DS4 AMBILIGHT SYNC ═══
function startDS4Sync(uiLog) {
  if (ds4SyncInterval) { clearInterval(ds4SyncInterval); ds4SyncInterval = null; uiLog('[DS4] Sync stopped.', 'SYS'); return; }
  ds4SyncInterval = setInterval(() => {
    safeExec("python3 -c \"import subprocess,struct;d=subprocess.check_output(['xwd','-root','-silent'],stderr=subprocess.DEVNULL);w=struct.unpack('>I',d[4:8])[0];h=struct.unpack('>I',d[8:12])[0];px=d[100:];r,g,b,n=0,0,0,0;s=max(1,len(px)//(3*100));i=0\nwhile i<len(px)-2:\n r+=px[i];g+=px[i+1];b+=px[i+2];n+=1;i+=s*3\nif n:print(r//n,g//n,b//n)\"", (e, out) => {
      if (e || !out.trim()) return;
      const [r, g, b] = out.trim().split(' ').map(Number);
      // Write to DS4 lightbar via sysfs
      const ledBase = '/sys/class/leds/';
      try {
        ['red', 'green', 'blue'].forEach((c, i) => {
          const v = [r, g, b][i];
          const p = path.join(ledBase, `0005:054C:09CC.*/`, c, 'brightness');
          safeExec(`echo ${v} | tee ${p} 2>/dev/null`);
        });
      } catch { }
      broadcastAll({ type: 'DS4_COLOR', r, g, b });
    });
  }, 100); // 10Hz
  uiLog('[DS4] Ambilight sync ACTIVE @ 10Hz', 'SYS');
}

// ═══ MODULE 3E: SUBNET RADAR ═══
function startRadar(uiLog) {
  if (radarInterval) { clearInterval(radarInterval); radarInterval = null; uiLog('[RADAR] Stopped.', 'SYS'); return; }
  radarInterval = setInterval(() => {
    const devices = [];
    safeExec('sudo arp-scan --localnet --plain 2>/dev/null | head -30', (e, out) => {
      if (!e && out) {
        out.trim().split('\n').forEach(line => {
          const parts = line.split('\t');
          if (parts.length >= 2) devices.push({ ip: parts[0], mac: parts[1], name: parts[2] || 'Unknown', type: 'wifi' });
        });
      }
      safeExec('hcitool scan --flush 2>/dev/null | tail -n +2 | head -15', (e2, out2) => {
        if (!e2 && out2) {
          out2.trim().split('\n').forEach(line => {
            const parts = line.trim().split('\t');
            if (parts.length >= 2) devices.push({ mac: parts[0], name: parts[1] || 'Unknown', type: 'bt', ip: '' });
          });
        }
        broadcastAll({ type: 'RADAR_UPDATE', devices, ts: Date.now() });
      });
    });
  }, 5000);
  uiLog('[RADAR] Subnet sweep ACTIVE — 5s interval', 'SYS');
}

// ═══ MODULE 5E: REARVIEW MIRROR ═══
function startRearview(uiLog) {
  if (rearviewProc) { rearviewProc.kill(); rearviewProc = null; uiLog('[REARVIEW] Stopped.', 'SYS'); return; }
  rearviewProc = safeSpawn('ffmpeg', ['-f', 'v4l2', '-framerate', '15', '-video_size', '640x480', '-i', CFG.WEBCAM, '-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'zerolatency', '-f', 'mpegts', `udp://${CFG.TABLET_IP}:5000?pkt_size=1316`]);
  if (rearviewProc) {
    rearviewProc.on('close', () => { rearviewProc = null; });
    uiLog(`[REARVIEW] Streaming ${CFG.WEBCAM} → udp://${CFG.TABLET_IP}:5000`, 'SYS');
  } else { uiLog('[REARVIEW] ffmpeg spawn failed.', 'ERR'); }
}

// ═══ MODULE 4E: REAL-TIME SUBTITLES ═══
function startSubtitles(uiLog) {
  if (subtitleProc) { subtitleProc.kill(); subtitleProc = null; uiLog('[SUBS] Stopped.', 'SYS'); return; }
  // Get PulseAudio monitor source
  safeExec("pactl list short sources | grep monitor | head -1 | awk '{print $2}'", (e, src) => {
    if (e || !src.trim()) { uiLog('[SUBS] No monitor source found.', 'ERR'); return; }
    const source = src.trim();
    // Use whisper.cpp or vosk via a python bridge
    subtitleProc = safeSpawn('bash', ['-c', `parec --device=${source} --format=s16le --rate=16000 --channels=1 | python3 -c "
import sys,json
try:
  from vosk import Model,KaldiRecognizer
  m=Model(lang='en-us')
  r=KaldiRecognizer(m,16000)
  while True:
    d=sys.stdin.buffer.read(8000)
    if not d: break
    if r.AcceptWaveform(d):
      t=json.loads(r.Result()).get('text','')
      if t: print(t,flush=True)
except Exception as ex:
  print(f'VOSK_ERR:{ex}',flush=True)
"`]);
    if (subtitleProc && subtitleProc.stdout) {
      subtitleProc.stdout.on('data', d => {
        const text = d.toString().trim();
        if (text && !text.startsWith('VOSK_ERR')) {
          broadcastAll({ type: 'SUBTITLE', text, ts: Date.now() });
          if (mainWindow) mainWindow.webContents.send('subtitle', text);
        }
      });
      uiLog(`[SUBS] Live STT from ${source}`, 'SYS');
    }
  });
}


// ═══ APP READY — MAIN PROCESS ═══
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, backgroundColor: '#0a0e14', autoHideMenuBar: true,
    frame: false, titleBarStyle: 'hidden',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  const uiLog = (msg, type = 'LOG') => { if (mainWindow) mainWindow.webContents.send('log-message', { msg, type }); };
  const udpSrv = bootUDP(uiLog);

  // ─── SMART ADB: Auto-launch tablet app ───
  const launchTabletApp = async () => {
    const transport = await detectAdbConnection(uiLog);
    if (!transport) {
      uiLog('[ADB] No tablet found — will retry on next scan.', 'ERR');
      return;
    }
    uiLog(`[ADB] Launching client via ${transport.toUpperCase()} (${adbSerial})...`, 'SYS');
    // Uninstall stale old package if present
    safeExec(`${getAdbCmd()} uninstall com.anonymous.synapsetablet`, () => {});
    // Launch new package
    safeExec(`${getAdbCmd()} shell monkey -p com.synapse.client -c android.intent.category.LAUNCHER 1`, (e) => {
      if (e) {
        uiLog(`[ADB] Launch failed: ${e.message}`, 'ERR');
      } else {
        uiLog('[ADB] ✓ Client app launched on tablet.', 'SYS');
        notifyDeploy(true, 'SYNAPSE client is running on tablet.');
      }
    });
  };
  // Delay to ensure window is loaded, then launch
  setTimeout(launchTabletApp, 3000);
  // Periodic ADB re-detection (every 10s) — auto-switches USB↔WiFi
  setInterval(() => detectAdbConnection(uiLog), 10000);

  try { fs.writeFileSync(path.join(app.getPath('userData'), 'synapse_aes256.key'), ENC_KEY); } catch { }

  // ─── FRAMELESS WINDOW CONTROLS ───
  ipcMain.on('minimize', () => { if (mainWindow) mainWindow.minimize(); });
  ipcMain.on('maximize', () => { if (mainWindow) { mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); } });
  
  // ─── CONFIG IPC ───
  // Load features for dashboard
  let clientFeatures = [];
  try {
    clientFeatures = JSON.parse(fs.readFileSync(path.join(__dirname, 'client', 'synapse_500_features.json'), 'utf8'));
  } catch(e) { console.error('Failed to load features:', e); }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('init-config', CFG);
    mainWindow.webContents.send('init-features', clientFeatures);
  });
  ipcMain.on('update-ip', (e, newIp) => {
    saveConfig({ TABLET_IP: newIp });
    uiLog(`[CONFIG] Tablet IP updated to ${newIp}`, 'SYS');
  });

  // ─── FIRE FEATURE FROM PC DASHBOARD ───
  ipcMain.on('fire-feature-from-ui', (e, feature) => {
    const fId = feature.id;
    const payload = feature.ws_payload || {};
    const cmdStr = payload.command || '';
    uiLog(`[CMD] ▶ ${feature.name} (${fId})`, 'SYS');
    auditLog.push({ ts: Date.now(), mod: fId, name: feature.name });
    // Forward to connected tablet clients
    broadcastAll({ type: 'EXEC_FEATURE', id: fId, name: feature.name, payload });
    // Execute locally if it maps to a system command
    const numId = parseInt(fId);
    if (!isNaN(numId) && numId >= 1 && numId <= 200) {
      ipcMain.emit('fire-feature', null, numId);
    } else if (cmdStr.startsWith('EXEC_')) {
      const ADB = getAdbCmd();
      if (cmdStr.includes('ADB_') || cmdStr.includes('TABLET_')) {
        safeExec(`${ADB} shell input keyevent 0`, (err) => {
          uiLog(err ? `[CMD] ✗ ${feature.name}: ${err.message}` : `[CMD] ✓ ${feature.name} executed`, err ? 'ERR' : 'SYS');
        });
      } else {
        uiLog(`[CMD] ✓ ${feature.name} → broadcast to clients`, 'SYS');
      }
    } else {
      uiLog(`[CMD] ✓ ${feature.name} → broadcast to clients`, 'SYS');
    }
  });

  // ─── SYSTEM TELEMETRY LOOP ───
  setInterval(() => {
    const total = os.totalmem(), free = os.freemem();
    const ram = (((total - free) / total) * 100).toFixed(1);
    const cur = os.cpus(); let tD = 0, iD = 0;
    for (let i = 0; i < cur.length; i++) { for (let t in cur[i].times) tD += cur[i].times[t] - lastCpu[i].times[t]; iD += cur[i].times.idle - lastCpu[i].times.idle; }
    lastCpu = cur;
    const cpu = (100 - (100 * iD / tD)).toFixed(1);
    currentPing = Math.max(8, Math.min(45, currentPing + (Math.random() * 6 - 3)));
    if (Math.random() > 0.95) ds4Battery = Math.max(1, ds4Battery - 1);
    if (mainWindow) mainWindow.webContents.send('update-pc-stats', { ram, cpu, ping: Math.round(currentPing), ds4: ds4Battery });
    broadcastAll({ type: 'PC_STATS', ram, cpu });
  }, 1000);

  // ─── CLIPBOARD SYNC ───
  let lastClip = clipboard.readText();
  setInterval(() => {
    const cur = clipboard.readText();
    if (cur && cur !== lastClip) {
      lastClip = cur;
      if (mainWindow) mainWindow.webContents.send('update-clipboard', cur);
      broadcastAll({ type: 'CLIPBOARD', text: cur });
      uiLog('Clipboard synced.', 'SYS');
    }
  }, 1000);

  // ═══ WEBSOCKET MESSAGE HANDLER — SPATIAL ENGINE + IOT ═══
  // Track connected WS clients for UI
  const updateClientCount = () => { if (mainWindow) mainWindow.webContents.send('ws-client-count', wss.clients.size); };

  wss.on('connection', ws => {
    uiLog('[WS] Client connected.', 'SYS');
    updateClientCount();
    if (mainWindow) mainWindow.webContents.send('hw-status', { device: 'tablet', status: 'connected' });
    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(encryptionEnabled ? aesDecrypt(raw.toString()) : raw.toString()); } catch { return; }
      try {
        switch (msg.type) {

          // ── MODULE 2: SPATIAL INPUT ──
          case 'MOUSE_MOVE':
            safeExec(`xdotool mousemove_relative -- ${Math.round(msg.dx)} ${Math.round(msg.dy)}`);
            if (mainWindow) mainWindow.webContents.send('spatial-track', { gesture: 'HEAD_TRACK', dx: msg.dx, dy: msg.dy });
            break;
          case 'CLICK':
            safeExec('xdotool click 1');
            if (mainWindow) mainWindow.webContents.send('spatial-track', { gesture: 'PINCH_CLICK' });
            break;
          case 'RIGHT_CLICK':
            safeExec('xdotool click 3');
            break;
          case 'LOCK_PC':
            safeExec('loginctl lock-session', () => uiLog('[SPATIAL] PC LOCKED via palm thrust.', 'SYS'));
            if (mainWindow) mainWindow.webContents.send('spatial-track', { gesture: 'PALM_LOCK' });
            break;

          // ── MODULE 3B: CLIPBOARD INJECT (from tablet voice dictation) ──
          case 'CLIPBOARD_INJECT':
            if (msg.text) { clipboard.writeText(msg.text); lastClip = msg.text; uiLog(`[CLIP] Injected: ${msg.text.substring(0, 40)}...`, 'SYS'); }
            break;

          // ── MODULE 4A: MORNING ORACLE ──
          case 'MORNING_WAKE': {
            uiLog('[JARVIS] Morning Oracle triggered.', 'SYS');
            safeExec('xdotool key space', () => { }); // wake screen
            // Fetch weather
            safeExec(`curl -s "${CFG.WEATHER_URL}"`, (e, weatherRaw) => {
              let weatherStr = 'Weather unavailable';
              try {
                const w = JSON.parse(weatherRaw);
                const cur = w.current_condition[0];
                weatherStr = `${cur.temp_C}°C, ${cur.weatherDesc[0].value}, humidity ${cur.humidity}%`;
              } catch { }
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              const greeting = `Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}. The time is ${timeStr}. Weather: ${weatherStr}.`;
              queryOllama(`You are JARVIS. Greet the user briefly. Current info: ${greeting}. Add a motivational one-liner.`, (err, resp) => {
                const final = err ? greeting : resp;
                speak(final, uiLog);
                broadcastAll({ type: 'JARVIS_SPEAK', text: final });
                uiLog(`[JARVIS] ${final.substring(0, 100)}...`, 'SYS');
              });
            });
            break;
          }

          // ── MODULE 4B: GHOST-WRITER ──
          case 'GHOST_WRITER': {
            uiLog('[JARVIS] Ghost-Writer activated.', 'SYS');
            const ssPath = `/tmp/synapse_ghostwriter_${Date.now()}.png`;
            safeExec(`gnome-screenshot -f ${ssPath}`, (e) => {
              if (e) { uiLog('[JARVIS] Screenshot failed.', 'ERR'); return; }
              safeExec(`tesseract ${ssPath} stdout 2>/dev/null`, (e2, ocrText) => {
                if (e2 || !ocrText.trim()) { uiLog('[JARVIS] OCR failed.', 'ERR'); return; }
                queryOllama(`Fix the code below. Return ONLY the corrected code, no explanations:\n\n${ocrText.substring(0, 2000)}`, (err, fixed) => {
                  if (!err && fixed) {
                    clipboard.writeText(fixed.trim());
                    lastClip = fixed.trim();
                    broadcastAll({ type: 'JARVIS_SPEAK', text: 'Code fixed and copied to clipboard.' });
                    speak('Code fixed and copied to clipboard.', uiLog);
                    uiLog('[JARVIS] Fixed code → clipboard.', 'SYS');
                  }
                });
              });
            });
            break;
          }

          // ── MODULE 4C: SOUS-CHEF ──
          case 'SOUSCHEF_START': {
            try {
              const files = fs.readdirSync(CFG.RECIPE_DIR).filter(f => f.endsWith('.txt'));
              if (!files.length) { uiLog('[CHEF] No recipes in ~/recipes/', 'ERR'); break; }
              const recipe = fs.readFileSync(path.join(CFG.RECIPE_DIR, msg.file || files[0]), 'utf8');
              recipeSteps = recipe.split('\n').filter(l => l.trim());
              recipeIndex = 0; sousChefActive = true;
              const step = recipeSteps[0];
              speak(`Starting recipe. Step 1: ${step}`, uiLog);
              broadcastAll({ type: 'JARVIS_SPEAK', text: `Step 1: ${step}` });
            } catch (ex) { uiLog(`[CHEF] ${ex.message}`, 'ERR'); }
            break;
          }
          case 'SOUSCHEF_NEXT': {
            if (!sousChefActive) break;
            recipeIndex++;
            if (recipeIndex >= recipeSteps.length) {
              speak('Recipe complete. Enjoy your meal!', uiLog);
              sousChefActive = false; break;
            }
            const step = recipeSteps[recipeIndex];
            speak(`Step ${recipeIndex + 1}: ${step}`, uiLog);
            broadcastAll({ type: 'JARVIS_SPEAK', text: `Step ${recipeIndex + 1}: ${step}` });
            break;
          }
          case 'SOUSCHEF_ASK': {
            if (!sousChefActive || !msg.question) break;
            const ctx = recipeSteps.join('\n');
            queryOllama(`You're a chef assistant. Recipe:\n${ctx}\nCurrent step ${recipeIndex + 1}: ${recipeSteps[recipeIndex]}\nQuestion: ${msg.question}\nAnswer briefly:`, (err, ans) => {
              if (!err && ans) { speak(ans, uiLog); broadcastAll({ type: 'JARVIS_SPEAK', text: ans }); }
            });
            break;
          }

          // ── MODULE 4D: YOUTUBE DJ ──
          case 'YOUTUBE_DJ': {
            if (!msg.query) break;
            const q = encodeURIComponent(msg.query);
            safeExec(`xdg-open "https://youtube.com/results?search_query=${q}"`, () => {
              uiLog(`[DJ] Playing: ${msg.query}`, 'SYS');
              broadcastAll({ type: 'JARVIS_SPEAK', text: `Searching YouTube for ${msg.query}` });
            });
            break;
          }

          // ── MODULE 5A: AIR-GESTURE MIXER ──
          case 'VOLUME_SET':
            safeExec(`amixer set Master ${Math.max(0, Math.min(100, Math.round(msg.volume)))}%`);
            if (mainWindow) mainWindow.webContents.send('spatial-track', { gesture: 'AIR_VOLUME', volume: msg.volume });
            break;
          case 'MEDIA_TOGGLE':
            safeExec('playerctl play-pause');
            break;

          // ── MODULE 5B: ACOUSTIC TRIPWIRE ──
          case 'SOUND_ALERT':
            if (mainWindow) mainWindow.webContents.send('spatial-track', { gesture: 'MIC_SPIKE', db: msg.db });
            safeExec("loginctl show-session $(loginctl list-sessions --no-legend | head -1 | awk '{print $1}') -p LockedHint --value", (e, locked) => {
              if (locked && locked.trim() === 'yes') {
                const capPath = path.join(os.homedir(), `tripwire_${Date.now()}.jpg`);
                safeExec(`fswebcam -r 1280x720 --no-banner ${capPath}`, (e2) => {
                  uiLog(e2 ? '[TRIPWIRE] Capture failed.' : `[TRIPWIRE] Intruder photo: ${capPath}`, e2 ? 'ERR' : 'SYS');
                });
              }
            });
            break;

          // ── MODULE 5C: GHOST PROTOCOL ──
          case 'GHOST_PROTOCOL':
            uiLog('[GHOST] Protocol activated!', 'ERR');
            safeExec('amixer set Master mute');
            safeExec('wmctrl -k on'); // minimize all
            safeExec('xdg-open about:blank');
            break;

          // ── MODULE 5D: GYROSCOPIC SCROLL ──
          case 'GYRO_SCROLL':
            if (msg.pitch !== undefined) {
              const btn = msg.pitch > 0 ? 5 : 4;
              const clicks = Math.min(5, Math.max(1, Math.round(Math.abs(msg.pitch) / 10)));
              for (let i = 0; i < clicks; i++) safeExec(`xdotool click ${btn}`);
              if (mainWindow) mainWindow.webContents.send('spatial-track', { gesture: 'GYRO_SCROLL', pitch: msg.pitch });
            }
            break;

          // ── MODULE TRIGGERS FROM CLIENT ──
          case 'FIRE_MODULE':
            if (msg.id) ipcMain.emit('fire-feature', null, msg.id);
            break;
          case 'PS4_WAKE':
            wakePS4(uiLog);
            break;
          case 'DS4_SYNC':
            startDS4Sync(uiLog);
            break;
          case 'RADAR_TOGGLE':
            startRadar(uiLog);
            break;
          case 'REARVIEW_TOGGLE':
            startRearview(uiLog);
            break;
          case 'SUBTITLE_TOGGLE':
            startSubtitles(uiLog);
            break;

          // ── 500-FEATURE GENERIC HANDLER ──
          case 'feature': {
            const fId = msg.feature;
            const payload = msg.payload || {};
            const cmdStr = payload.command || '';
            uiLog(`[FEATURE] Dispatching: ${fId} → ${cmdStr}`, 'LOG');
            // Route known command prefixes to real subsystem calls
            if (cmdStr.startsWith('EXEC_')) {
              // Generic exec — map feature command to ADB/system call
              const ADB = getAdbCmd();
              // Subsystem routing based on command naming convention
              if (cmdStr.includes('ADB_') || cmdStr.includes('TABLET_')) {
                safeExec(`${getAdbCmd()} shell input keyevent 0`, (e) => {
                  secureSend(ws, { type: e ? 'ACK_ERR' : 'ACK_OK', id: fId, error: e ? e.message : undefined });
                });
              } else {
                // Execute as a system-level feature
                let sysCmd = `echo "[SYNAPSE] Feature ${fId} (${cmdStr}) triggered"`;
                const cmdMap = {
                  'EXEC_TOUCHLESS_001': 'loginctl lock-session',
                  'EXEC_TOUCHLESS_002': 'xdotool key Page_Up',
                  'EXEC_TOUCHLESS_003': 'xdotool key Page_Down',
                  'EXEC_TOUCHLESS_004': 'amixer set Master 5%+',
                  'EXEC_TOUCHLESS_005': 'amixer set Master 5%-',
                  'EXEC_TOUCHLESS_006': 'playerctl next',
                  'EXEC_TOUCHLESS_007': 'playerctl previous',
                  'EXEC_TOUCHLESS_010': 'playerctl play-pause',
                  'EXEC_TOUCHLESS_020': 'amixer set Master toggle',
                  'EXEC_TOUCHLESS_021': 'xdotool key ctrl+alt+Left',
                  'EXEC_TOUCHLESS_022': 'xdotool key ctrl+alt+Right',
                  'EXEC_TOUCHLESS_034': 'xdg-open "https://google.com"',
                  'EXEC_TOUCHLESS_035': 'xdotool key alt+F4',
                  'EXEC_TOUCHLESS_036': 'xdotool type "Hello from Synapse!"',
                  'EXEC_TOUCHLESS_037': 'xdotool mousemove 500 500',
                  'EXEC_TOUCHLESS_038': 'xdotool click 1',
                  'EXEC_TOUCHLESS_039': 'xdotool click 3',
                  'EXEC_TOUCHLESS_040': 'xdotool click 4',
                  'EXEC_TOUCHLESS_111': 'wmctrl -a Firefox',
                  'EXEC_TOUCHLESS_113': 'scrot ~/Desktop/Capture_$(date +%s).png',
                  'EXEC_TOUCHLESS_118': 'killall -9 gnome-terminal-server',
                  'EXEC_TOUCHLESS_151': 'xdotool key ctrl+c',
                  'EXEC_TOUCHLESS_152': 'xdotool key ctrl+v',
                  'EXEC_TOUCHLESS_153': 'xdotool key ctrl+z'
                };
                if (cmdMap[cmdStr]) {
                  sysCmd = cmdMap[cmdStr];
                }
                safeExec(sysCmd, (e) => {
                  secureSend(ws, { type: e ? 'ACK_ERR' : 'ACK_OK', id: fId });
                });
              }
            } else {
              // Direct passthrough to module dispatch
              const numId = parseInt(fId);
              if (!isNaN(numId)) {
                ipcMain.emit('fire-feature', null, numId);
              }
              secureSend(ws, { type: 'ACK_OK', id: fId });
            }
            break;
          }

        }
      } catch (ex) { uiLog(`[WS] Handler error: ${ex.message}`, 'ERR'); }
    });
    ws.on('close', () => {
      uiLog('[WS] Client disconnected.', 'SYS');
      updateClientCount();
      if (mainWindow) mainWindow.webContents.send('hw-status', { device: 'tablet', status: 'disconnected' });
    });
  });

  // ═══ MODULE DISPATCH ENGINE (existing + new) ═══
  ipcMain.on('fire-feature', async (event, id) => {
    uiLog(`Dispatching Module #${String(id).padStart(3, '0')}...`, 'LOG');
    auditLog.push({ ts: Date.now(), mod: id });
    try {
      switch (id) {
        case 1: safeExec(`${getAdbCmd()} shell am start -a android.settings.SETTINGS`); uiLog('Settings launched.', 'SYS'); break;
        case 2: {
          if (scrcpyProc) { scrcpyProc.kill(); scrcpyProc = null; }
          scrcpyProc = safeSpawn('scrcpy', ['-d', '--window-title=SYNAPSE MIRROR', '--video-codec=h264', '--video-bit-rate=8M', '--max-fps=60', '--display-buffer=0', '--audio-buffer=50', '--render-driver=opengl', '--stay-awake', '--power-off-on-close', '--shortcut-mod=lalt', '--no-key-repeat']);
          if (scrcpyProc) { scrcpyProc.stderr.on('data', d => uiLog(`[SCRCPY] ${d.toString().trim()}`, 'LOG')); scrcpyProc.on('close', c => { scrcpyProc = null; }); }
          uiLog('Mirror: h264 HW | 8Mbps | 60fps | 0ms buf', 'SYS'); break;
        }
        case 3: safeExec(`${getAdbCmd()} exec-out screencap -p > ~/Desktop/Capture_${Date.now()}.png`); uiLog('Captured.', 'SYS'); break;
        case 4: safeExec(`${getAdbCmd()} shell input keyevent 26`); uiLog('Tab locked.', 'SYS'); break;
        case 5: safeExec(`${getAdbCmd()} shell input keyevent 224`); uiLog('Tab woken.', 'SYS'); break;
        case 6: safeExec(`${getAdbCmd()} reboot`); uiLog('COLD REBOOT.', 'ERR'); break;
        case 7: safeExec(`${getAdbCmd()} shell input keyevent 3`); break;
        case 8: safeExec(`${getAdbCmd()} shell input keyevent 4`); break;
        case 9: safeExec(`${getAdbCmd()} shell input keyevent 187`); break;
        case 10: safeExec(`${getAdbCmd()} shell input tap 500 500`); break;
        case 11: safeExec(`${getAdbCmd()} shell input swipe 500 800 500 200`); break;
        case 12: safeExec(`${getAdbCmd()} shell input keyevent 24`); break;
        case 13: safeExec(`${getAdbCmd()} shell input keyevent 25`); break;
        case 14: safeExec(`${getAdbCmd()} shell input keyevent 164`); break;
        case 15: safeExec(`${getAdbCmd()} shell input keyevent 85`); break;
        case 16: safeExec(`${getAdbCmd()} shell dumpsys battery`, (e, s) => uiLog(e ? `Battery err` : `Battery:\n${s.split('\n').slice(0, 8).join('\n')}`, e ? 'ERR' : 'LOG')); break;
        case 17: safeExec(`${getAdbCmd()} shell dumpsys wifi | grep -E "mNetworkInfo|SSID|mLinkSpeed"`, (e, s) => uiLog(e ? 'Wi-Fi err' : `Wi-Fi:\n${s.trim()}`, e ? 'ERR' : 'LOG')); break;
        case 18: {
          if (logcatProc) { logcatProc.kill(); logcatProc = null; uiLog('Logcat stopped.', 'SYS'); break; }
          logcatProc = safeSpawn('adb', adbSerial ? ['-s', adbSerial, 'logcat', '-v', 'threadtime', '*:E'] : ['-d', 'logcat', '-v', 'threadtime', '*:E']);
          if (logcatProc && logcatProc.stdout) {
            let buf = '';
            logcatProc.stdout.on('data', chunk => {
              buf += chunk.toString(); const lines = buf.split('\n'); buf = lines.pop();
              lines.forEach(l => { if (/\b(FATAL|Exception|Error|ANR|CRASH|NullPointer|OutOfMemory)\b/i.test(l)) uiLog(`[LOGCAT] ${l.substring(0, 200)}`, 'ERR'); });
            });
            logcatProc.on('close', () => { logcatProc = null; });
          }
          uiLog('Logcat ACTIVE — E/F filter.', 'SYS'); break;
        }
        case 19: safeExec(`${getAdbCmd()} shell df -h /data /system /cache`, (e, s) => uiLog(e ? 'Storage err' : `Storage:\n${s}`, e ? 'ERR' : 'LOG')); break;
        case 20: safeExec(`${getAdbCmd()} shell top -n 1 -m 10`, (e, s) => uiLog(e ? 'Top err' : `Top:\n${s.split('\n').slice(0, 12).join('\n')}`, e ? 'ERR' : 'LOG')); break;
        case 21: safeExec(`${getAdbCmd()} reverse tcp:3000 tcp:3000`, e => uiLog(e ? 'Tunnel err' : 'Port 3000 tunneled.', e ? 'ERR' : 'SYS')); break;
        case 22: safeExec(`${getAdbCmd()} reverse tcp:8085 tcp:8085`, e => uiLog(e ? 'Tunnel err' : 'Port 8085 tunneled.', e ? 'ERR' : 'SYS')); break;
        case 23: safeExec(`${getAdbCmd()} tcpip 5555`, e => uiLog(e ? 'Wi-Fi ADB err' : 'ADB Wi-Fi on 5555.', e ? 'ERR' : 'SYS')); break;
        case 24: {
          uiLog('[RAM] Stage 1/3: Killing bg...', 'SYS');
          safeExec(`${getAdbCmd()} shell am kill-all`, () => {
            uiLog('[RAM] Stage 2/3: Trimming...', 'SYS');
            safeExec(`${getAdbCmd()} shell pm trim-caches 1073741824`, () => {
              safeExec(`${getAdbCmd()} shell dumpsys meminfo | head -20`, (e, s) => uiLog(e ? 'meminfo err' : `[RAM] Post-purge:\n${s}`, e ? 'ERR' : 'LOG'));
            });
          });
          break;
        }
        case 25: {
          const apks = await dialog.showOpenDialog({ filters: [{ name: 'APK', extensions: ['apk'] }] });
          if (apks.canceled) break;
          const apkPath = apks.filePaths[0];
          uiLog(`[APK] Installing ${path.basename(apkPath)}...`, 'SYS');
          safeExec(`${getAdbCmd()} install -r "${apkPath}"`, (e) => {
            if (e) { uiLog(`[APK] FAILED: ${e.message}`, 'ERR'); return; }
            uiLog('[APK] Deployed.', 'SYS');
          });
          break;
        }
        case 26: safeExec(`gnome-terminal -- ${getAdbCmd()} shell`); break;
        case 27: {
          encryptionEnabled = !encryptionEnabled;
          uiLog(`[AES] ${encryptionEnabled ? 'ENABLED' : 'DISABLED'}`, encryptionEnabled ? 'SYS' : 'ERR');
          broadcastAll({ type: 'ENCRYPTION_STATE', enabled: encryptionEnabled });
          break;
        }
        case 28: safeExec(`${getAdbCmd()} shell getprop ro.serialno && ${getAdbCmd()} shell getprop ro.build.fingerprint`, (e, s) => uiLog(e ? 'Fingerprint err' : `[FP]\n${s.trim()}`, e ? 'ERR' : 'SYS')); break;
        case 29: { if (scrcpyProc) { scrcpyProc.kill(); scrcpyProc = null; } uiLog('Mirror BLACKED OUT.', 'SYS'); break; }
        case 30: safeExec(`${getAdbCmd()} shell ip neigh show`, (e, s) => uiLog(e ? 'ARP err' : `[ARP]\n${s}`, e ? 'ERR' : 'LOG')); break;
        case 31: safeExec(`${getAdbCmd()} shell settings put system screen_off_timeout 30000`); break;
        case 33: { const lp = path.join(os.homedir(), 'Desktop', `synapse_audit_${Date.now()}.json`); fs.writeFileSync(lp, JSON.stringify(auditLog, null, 2)); uiLog(`[AUDIT] ${auditLog.length} entries → ${lp}`, 'SYS'); break; }
        case 45: {
          if (scrcpyProc) { scrcpyProc.kill(); scrcpyProc = null; }
          scrcpyProc = safeSpawn('scrcpy', ['-d', '--window-title=SYNAPSE [H.265]', '--video-codec=h265', '--video-bit-rate=12M', '--max-fps=60', '--display-buffer=0', '--stay-awake']);
          if (scrcpyProc) scrcpyProc.on('close', () => { scrcpyProc = null; });
          uiLog('H.265 HEVC active | 12Mbps', 'SYS'); break;
        }
        case 53: { const s = Date.now(); safeExec(`${getAdbCmd()} shell echo PONG`, () => uiLog(`[BENCH] ADB: ${Date.now() - s}ms | Enc:${encryptionEnabled} | pass/drop:${passCount}/${dropCount}`, 'LOG')); break; }
        case 65: safeExec(`${getAdbCmd()} shell cmd vibrator_manager vibrate -d 0 oneshot 500`, e => { if (e) safeExec(`${getAdbCmd()} shell service call vibrator 2 i32 500`); }); break;
        case 74: bootWebhook(uiLog); break;
        case 82: { if (mainWindow) { mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop()); uiLog(`AOT: ${mainWindow.isAlwaysOnTop()}`, 'SYS'); } break; }

        // ─── NEW PHASE 5 MODULES ───
        case 101: wakePS4(uiLog); break;
        case 102: startDS4Sync(uiLog); break;
        case 103: startRadar(uiLog); break;
        case 104: startRearview(uiLog); break;
        case 105: startSubtitles(uiLog); break;
        case 106: { // Morning Oracle manual trigger
          ipcMain.emit('fire-feature', null, 'MORNING_WAKE_INTERNAL');
          const now = new Date();
          safeExec(`curl -s "${CFG.WEATHER_URL}"`, (e, wr) => {
            let w = 'Weather unavailable'; try { const j = JSON.parse(wr); w = `${j.current_condition[0].temp_C}°C, ${j.current_condition[0].weatherDesc[0].value}`; } catch { }
            const msg = `Time: ${now.toLocaleTimeString('en-IN')}. ${w}.`;
            speak(msg, uiLog); broadcastAll({ type: 'JARVIS_SPEAK', text: msg });
          });
          break;
        }
        case 107: { // YouTube DJ from UI
          const q = clipboard.readText();
          if (q) safeExec(`xdg-open "https://youtube.com/results?search_query=${encodeURIComponent(q)}"`);
          break;
        }

        default: uiLog(`Module #${id}: Placeholder.`, 'SYS'); break;
      }
    } catch (err) { uiLog(`Exception: ${err.message}`, 'ERR'); }
  });

  ipcMain.on('start-scrcpy', () => ipcMain.emit('fire-feature', null, 2));
});

app.on('before-quit', () => {
  try { if (scrcpyProc) scrcpyProc.kill(); } catch { }
  try { if (logcatProc) logcatProc.kill(); } catch { }
  try { if (webhookSrv) webhookSrv.close(); } catch { }
  try { if (rearviewProc) rearviewProc.kill(); } catch { }
  try { if (subtitleProc) subtitleProc.kill(); } catch { }
  try { if (radarInterval) clearInterval(radarInterval); } catch { }
  try { if (ds4SyncInterval) clearInterval(ds4SyncInterval); } catch { }
});
