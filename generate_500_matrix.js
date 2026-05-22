const fs = require('fs');
const path = require('path');

const modules = [
  "Acoustic & Voice Intents (Tablet Mic)",
  "Kinetic & Gyroscope Gestures (Tablet IMU)",
  "Optical & Spatial Triggers (Tablet Camera)",
  "Gaming Matrix (PS4 Node)",
  "Vehicle Network (Linea Node)",
  "Host OS Subsystem (Ubuntu OptiPlex)",
  "Security & Recon Network",
  "God-Mode Environment Macros",
  "Visual Engine Hot-Swaps",
  "Developer & Diagnostics"
];

const hapticProfiles = [
  "ImpactFeedbackStyle.Light",
  "ImpactFeedbackStyle.Medium",
  "ImpactFeedbackStyle.Heavy",
  "NotificationFeedbackType.Success",
  "NotificationFeedbackType.Warning",
  "NotificationFeedbackType.Error"
];

const icons = [
  "mic", "activity", "camera", "play", "truck", "monitor", "shield", "star", "image", "terminal",
  "zap", "volume-2", "cpu", "eye", "crosshair", "wifi", "lock", "unlock", "tool", "settings"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const features = [];

modules.forEach((mod, modIndex) => {
  for (let i = 1; i <= 50; i++) {
    const idPrefix = mod.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const id = `SYS_${idPrefix}_CMD_${i.toString().padStart(3, '0')}`;
    
    let name = `${mod.split(' ')[0]} Action ${i}`;
    let description = `Executes command ${i} for the ${mod} subsystem.`;
    let ws_payload = { command: `EXEC_${idPrefix}`, args: `arg${i}` };
    
    // Make them slightly more descriptive based on the module
    if (mod.includes("Acoustic")) {
      name = `Audio Threshold Trigger ${i}`;
      description = `Listen for sound profile ${i} and trigger OS override.`;
      ws_payload = { command: "AUDIO_LISTEN", threshold: 40 + i, action: "OS_OVERRIDE" };
    } else if (mod.includes("Kinetic")) {
      name = `Gyro Gesture Macros ${i}`;
      description = `Trigger action based on tilt matrix ${i}.`;
      ws_payload = { command: "GYRO_TILT", x_min: i, y_min: i, action: "SKIP_TRACK" };
    } else if (mod.includes("Optical")) {
      name = `Spatial Trigger Pattern ${i}`;
      description = `Visual recognition pattern ${i} execution.`;
      ws_payload = { command: "VISION_LOCK", pattern: i };
    } else if (mod.includes("Gaming")) {
      name = `PS4 Remote Launch ${i}`;
      description = `Wake PS4 and load payload title ${i}.`;
      ws_payload = { command: "PS4_WAKE_LAUNCH", title_id: `CUSA${i.toString().padStart(5, '0')}` };
    } else if (mod.includes("Vehicle")) {
      name = `OBD2 Polling Routine ${i}`;
      description = `Synthetic data fetch for vehicle ECU ${i}.`;
      ws_payload = { command: "OBD2_FETCH", pid: i.toString(16) };
    } else if (mod.includes("Host OS")) {
      name = `System Override ${i}`;
      description = `Modify host parameters (Volume, Brightness) preset ${i}.`;
      ws_payload = { command: "HOST_EXEC", args: i % 2 === 0 ? `amixer set Master ${i}%` : `xrandr --output eDP-1 --brightness 0.${i}` };
    } else if (mod.includes("Security")) {
      name = `Network Sweep Protocol ${i}`;
      description = `Active security monitor scan configuration ${i}.`;
      ws_payload = { command: "SEC_SWEEP", subnet: `192.168.${i}.0/24` };
    } else if (mod.includes("God-Mode")) {
      name = `Tactical Environment Macro ${i}`;
      description = `Chained command execution state ${i}.`;
      ws_payload = { command: "MACRO_EXEC", chain_id: i };
    } else if (mod.includes("Visual Engine")) {
      name = `Theme Engine Hot-Swap ${i}`;
      description = `Apply visual modifications index ${i}.`;
      ws_payload = { command: "UI_SWAP", theme_id: i };
    } else if (mod.includes("Developer")) {
      name = `Diagnostic Stream ${i}`;
      description = `Raw debug data payload inject ${i}.`;
      ws_payload = { command: "DEBUG_INJECT", type: "LOGCAT", level: i };
    }

    features.push({
      id: id,
      module: mod,
      name: name,
      description: description,
      ws_payload: ws_payload,
      haptic_profile: getRandom(hapticProfiles),
      ui_icon: getRandom(icons)
    });
  }
});

const outputPath = path.join(__dirname, 'client', 'synapse_500_features.json');
fs.writeFileSync(outputPath, JSON.stringify(features, null, 2), 'utf8');

console.log(`Generated 500 features and saved to ${outputPath}`);
