const fs = require('fs');
const path = require('path');

function parseFile(filename, prefix) {
  const content = fs.readFileSync(filename, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const features = [];
  let currentFeature = null;
  let lineIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#') && !isNaN(parseInt(lines[i].replace('#', '')))) {
      if (currentFeature) {
        features.push(currentFeature);
      }
      const num = parseInt(lines[i].replace('#', ''));
      const id = `${prefix}_${num.toString().padStart(3, '0')}`;
      currentFeature = { id };
      lineIndex = 0;
    } else if (currentFeature) {
      lineIndex++;
      if (lineIndex === 1) {
        currentFeature.name = lines[i];
      } else if (lineIndex === 2) {
        currentFeature.description = lines[i];
      } else if (lineIndex === 3) {
        currentFeature.module = lines[i];
      }
    }
  }
  if (currentFeature) {
    features.push(currentFeature);
  }
  return features;
}

const icons = [
  "mic", "activity", "camera", "play", "truck", "monitor", "shield", "star", "image", "terminal",
  "zap", "volume-2", "cpu", "eye", "crosshair", "wifi", "lock", "unlock", "tool", "settings"
];
function getRandomIcon() {
  return icons[Math.floor(Math.random() * icons.length)];
}

const features1 = parseFile('raw_features_1.txt', 'TOUCHLESS');
const features2 = parseFile('raw_features_2.txt', 'IMPROVE');
const features3 = parseFile('raw_features_3.txt', 'RIG');

const allFeatures = [...features1, ...features2, ...features3];

// Add payload and haptics
allFeatures.forEach(f => {
  f.ws_payload = { command: `EXEC_${f.id}`, args: f.name };
  
  const lowerDesc = (f.description || '').toLowerCase();
  if (lowerDesc.includes('error') || lowerDesc.includes('alert') || lowerDesc.includes('warning')) {
    f.haptic_profile = 'NotificationFeedbackType.Warning';
  } else if (lowerDesc.includes('success') || lowerDesc.includes('save') || lowerDesc.includes('connect')) {
    f.haptic_profile = 'NotificationFeedbackType.Success';
  } else if (lowerDesc.includes('shake') || lowerDesc.includes('heavy') || lowerDesc.includes('rumble')) {
    f.haptic_profile = 'ImpactFeedbackStyle.Heavy';
  } else {
    f.haptic_profile = 'ImpactFeedbackStyle.Light';
  }
  
  if (lowerDesc.includes('audio') || lowerDesc.includes('mic')) f.ui_icon = 'mic';
  else if (lowerDesc.includes('camera') || lowerDesc.includes('vision') || lowerDesc.includes('face')) f.ui_icon = 'camera';
  else if (lowerDesc.includes('wifi') || lowerDesc.includes('network') || lowerDesc.includes('ws')) f.ui_icon = 'wifi';
  else if (lowerDesc.includes('lock') || lowerDesc.includes('security')) f.ui_icon = 'lock';
  else if (lowerDesc.includes('theme') || lowerDesc.includes('color')) f.ui_icon = 'image';
  else f.ui_icon = getRandomIcon();
});

const jsonPath = path.join(__dirname, 'client', 'synapse_500_features.json');
fs.writeFileSync(jsonPath, JSON.stringify(allFeatures, null, 2));
console.log(`Saved ${allFeatures.length} features to JSON.`);

// Generate Markdown
let md = `# SYNAPSE_OS Feature Masterlist (400 Features)\n\n`;

function generateTable(moduleName, items) {
  let table = `## Module: ${moduleName}\n\n`;
  table += `| ID | Feature Name | Description |\n`;
  table += `|---|---|---|\n`;
  items.forEach(item => {
    table += `| ${item.id} | **${item.name}** | ${item.description} |\n`;
  });
  table += `\n`;
  return table;
}

const modules = {};
allFeatures.forEach(f => {
  if (!modules[f.module]) modules[f.module] = [];
  modules[f.module].push(f);
});

Object.keys(modules).sort().forEach(mod => {
  md += generateTable(mod, modules[mod]);
});

fs.writeFileSync(path.join(__dirname, 'synapse_500_features.md'), md);
console.log(`Saved Markdown to synapse_500_features.md`);
