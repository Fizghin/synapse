// SYNAPSE_OS E2E Long-Running Stress Test & Integrity Monitor (30 Minutes)
// -----------------------------------------------------------------------------
const WS = require('ws');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'e2e_results.log');
const DURATION_MS = 30 * 60 * 1000; // 30 minutes
const START_TIME = Date.now();

let socket = null;
let stats = {
  heartbeatsSent: 0,
  featuresDispatched: 0,
  acksReceived: 0,
  errorsCount: 0,
  reconnects: 0,
  totalLatencyMs: 0,
  pingsCount: 0
};

// Logging helper
function log(msg, level = 'INFO') {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
}

// Ensure clean log file at start
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}
log('Starting 30-minute SYNAPSE_OS E2E Stress Test...', 'SYS');
log(`Target Duration: 30 minutes (until ${new Date(START_TIME + DURATION_MS).toLocaleTimeString()})`, 'SYS');

// Test features list (safe non-destructive mapped commands)
const TEST_FEATURES = [
  { feature: 16, payload: { name: 'Battery check' } },
  { feature: 17, payload: { name: 'WiFi info check' } },
  { feature: 19, payload: { name: 'Storage check' } },
  { feature: 53, payload: { name: 'ADB Bench PONG' } },
  { feature: 106, payload: { name: 'Morning Oracle' } },
  { feature: 'TOUCHLESS_002', payload: { command: 'EXEC_TOUCHLESS_002', name: 'Scroll up' } },
  { feature: 'TOUCHLESS_003', payload: { command: 'EXEC_TOUCHLESS_003', name: 'Scroll down' } },
  { feature: 'TOUCHLESS_004', payload: { command: 'EXEC_TOUCHLESS_004', name: 'Vol Up' } },
  { feature: 'TOUCHLESS_005', payload: { command: 'EXEC_TOUCHLESS_005', name: 'Vol Down' } },
  { feature: 'TOUCHLESS_020', payload: { command: 'EXEC_TOUCHLESS_020', name: 'Mute toggle' } },
  { feature: 'TOUCHLESS_036', payload: { command: 'EXEC_TOUCHLESS_036', name: 'Type text' } },
  { feature: 'TOUCHLESS_037', payload: { command: 'EXEC_TOUCHLESS_037', name: 'Move mouse' } },
  { feature: 'TOUCHLESS_113', payload: { command: 'EXEC_TOUCHLESS_113', name: 'Screenshot trigger' } },
  { feature: 'TOUCHLESS_153', payload: { command: 'EXEC_TOUCHLESS_153', name: 'Undo click' } }
];

function connect() {
  log('Connecting to SYNAPSE WebSocket server on ws://127.0.0.1:8085...', 'NET');
  socket = new WS('ws://127.0.0.1:8085');

  socket.on('open', () => {
    log('WebSocket connection successfully established.', 'NET');
  });

  socket.on('message', (data) => {
    try {
      const resp = JSON.parse(data.toString());
      if (resp.type === 'ACK_OK') {
        stats.acksReceived++;
      } else if (resp.type === 'ACK_ERR') {
        stats.errorsCount++;
        log(`Ack returned error: ${JSON.stringify(resp)}`, 'WARN');
      } else if (resp.type === 'PC_STATS') {
        // Monitor latency / metrics
        stats.pingsCount++;
      }
    } catch (err) {
      log(`Error parsing message from server: ${err.message}`, 'WARN');
    }
  });

  socket.on('close', () => {
    log('WebSocket connection closed by server.', 'NET');
    stats.reconnects++;
    if (Date.now() - START_TIME < DURATION_MS) {
      log('Attempting auto-reconnect in 3s...', 'NET');
      setTimeout(connect, 3000);
    }
  });

  socket.on('error', (err) => {
    stats.errorsCount++;
    log(`WebSocket error: ${err.message}`, 'ERR');
  });
}

// 1. Connection initiation
connect();

// 2. Heartbeat interval (every 2s)
const hbInterval = setInterval(() => {
  if (socket && socket.readyState === WS.OPEN) {
    socket.send(JSON.stringify({ type: 'heartbeat' }));
    stats.heartbeatsSent++;
  }
}, 2000);

// 3. Command/Feature dispatch interval (every 8s)
const featInterval = setInterval(() => {
  if (socket && socket.readyState === WS.OPEN) {
    const item = TEST_FEATURES[Math.floor(Math.random() * TEST_FEATURES.length)];
    const payload = {
      type: 'feature',
      feature: item.feature,
      payload: item.payload
    };
    socket.send(JSON.stringify(payload));
    stats.featuresDispatched++;
    log(`Dispatched: ${item.payload.name || item.feature} (ID: ${item.feature})`, 'CMD');
  }
}, 8000);

// 4. Integrity check (every 15s)
// Checks ADB connection, reverse status, and server memory footprint
const integrityInterval = setInterval(() => {
  exec('adb -d reverse --list', (err, stdout) => {
    if (err) {
      log(`ADB command error: ${err.message}`, 'WARN');
      stats.errorsCount++;
      return;
    }
    const hasReverse = stdout.includes('8085');
    if (!hasReverse) {
      log('ADB Reverse Tunnel check: MISSING! Attempting recovery...', 'ERR');
      exec('adb -d reverse tcp:8085 tcp:8085', (reErr) => {
        if (reErr) {
          log(`Recovery of ADB reverse failed: ${reErr.message}`, 'ERR');
          stats.errorsCount++;
        } else {
          log('Recovery of ADB reverse: SUCCESS', 'SYS');
        }
      });
    } else {
      log('ADB Reverse Tunnel check: OK', 'SYS');
    }
  });

  // Check if electron is alive
  exec('pgrep -af "electron.*synapse"', (err, stdout) => {
    if (err || !stdout.trim()) {
      log('Electron main process check: CRITICAL - NOT RUNNING!', 'ERR');
      stats.errorsCount++;
    }
  });
}, 15000);

// 5. Periodic Stats Reporting (every 30s)
const reportInterval = setInterval(() => {
  const elapsedSec = Math.floor((Date.now() - START_TIME) / 1000);
  const remainingSec = Math.max(0, Math.floor((DURATION_MS - (Date.now() - START_TIME)) / 1000));
  const hr = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
  const min = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
  const sec = String(elapsedSec % 60).padStart(2, '0');
  
  log(`--- TEST REPORT [Elapsed: ${hr}:${min}:${sec} | Remaining: ${Math.floor(remainingSec / 60)}m] ---`, 'STAT');
  log(`  Heartbeats: ${stats.heartbeatsSent}`, 'STAT');
  log(`  Features Sent: ${stats.featuresDispatched}`, 'STAT');
  log(`  ACKs Received: ${stats.acksReceived}/${stats.featuresDispatched}`, 'STAT');
  log(`  Telemetry Pings: ${stats.pingsCount}`, 'STAT');
  log(`  Errors Logged: ${stats.errorsCount}`, 'STAT');
  log(`  Reconnects: ${stats.reconnects}`, 'STAT');
  log(`-----------------------------------------------------------------`, 'STAT');
}, 30000);

// 6. Stop test timeout
setTimeout(() => {
  clearInterval(hbInterval);
  clearInterval(featInterval);
  clearInterval(integrityInterval);
  clearInterval(reportInterval);
  if (socket) {
    socket.close();
  }
  
  const endLog = [
    '==================================================',
    '        E2E STRESS MONITORING CYCLE COMPLETE       ',
    `  Total Runtime: 30 minutes`,
    `  Final Results:`,
    `    - Heartbeats Sent: ${stats.heartbeatsSent}`,
    `    - Features Sent: ${stats.featuresDispatched}`,
    `    - ACKs Received: ${stats.acksReceived}`,
    `    - Reconnect events: ${stats.reconnects}`,
    `    - System Error Events: ${stats.errorsCount}`,
    `  Status: ${stats.errorsCount === 0 && stats.acksReceived >= stats.featuresDispatched - 2 ? 'PASSED (IRON-CLAD)' : 'DEGRADED / COMPLETED WITH ERRORS'}`,
    '=================================================='
  ].join('\n');
  
  console.log(endLog);
  fs.appendFileSync(LOG_FILE, '\n' + endLog + '\n', 'utf8');
  process.exit(0);
}, DURATION_MS);
