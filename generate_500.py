import json

modules = [
    {"name": "Cyberpunk HUD Aesthetics & Kinetic Layouts", "start": 1, "end": 50, "sensor": "Accelerometer / Gyro", "cmd_template": "echo 'HUD_{}'"},
    {"name": "Zero-Cost Local IoT & Spatial Automations", "start": 51, "end": 100, "sensor": "Wi-Fi / Bluetooth LE", "cmd_template": "arp-scan --localnet | grep 'MAC_{}'"},
    {"name": "Low-Level Linux Subsystem Control", "start": 101, "end": 150, "sensor": "Front Camera / Mic", "cmd_template": "xdotool key 'F{}'"},
    {"name": "Advanced Acoustic DSP & Ambient Audio Intelligence", "start": 151, "end": 200, "sensor": "Microphone", "cmd_template": "amixer set Master {}%"},
    {"name": "Local AI Core Integration & Conversational Hooks", "start": 201, "end": 250, "sensor": "Microphone", "cmd_template": "ollama run llama3 'INTENT_{}'"},
    {"name": "Hardware Key Chording & Morse Subsystems", "start": 251, "end": 300, "sensor": "Physical Volume/Power Buttons", "cmd_template": "systemctl {}"},
    {"name": "Spatial Kinetics & Gyro-Vectoring", "start": 301, "end": 350, "sensor": "Gyroscope", "cmd_template": "xdotool mousemove_relative {} {}"},
    {"name": "Subnet Reconnaissance & Network Security Shields", "start": 351, "end": 400, "sensor": "Wi-Fi / BLE", "cmd_template": "notify-send 'ALERT' 'INTRUSION_{}'"},
    {"name": "Computer Vision & Gaze Tracking", "start": 401, "end": 450, "sensor": "Front Camera", "cmd_template": "xset dpms force {}"},
    {"name": "Optical Telemetry & Environment Scanning", "start": 451, "end": 500, "sensor": "Rear Camera", "cmd_template": "fswebcam -r 1920x1080 /tmp/scan_{}.jpg"}
]

features_json = []
features_md = "# SYNAPSE_OS 500-Feature Touchless Blueprint\n\n"

for mod in modules:
    features_md += f"## Module: {mod['name']} ({mod['start']} - {mod['end']})\n\n"
    features_md += "| ID | Feature Name | Sensor Trigger | WebSocket Payload | Host Command / Action |\n"
    features_md += "|---|---|---|---|---|\n"
    for i in range(mod['start'], mod['end'] + 1):
        feature_name = f"{mod['name'].split()[0].upper()}_OP_{i:03d}"
        sensor = mod['sensor']
        payload = {"module": mod['start'], "feature": i, "trigger": f"TRIG_{i}"}
        cmd = mod['cmd_template'].replace('{}', str(i % 100))
        
        features_json.append({"id": i, "name": feature_name, "module": mod['name'], "payload": payload, "command": cmd})
        features_md += f"| #{i:03d} | `{feature_name}` | {sensor} | `{json.dumps(payload)}` | `{cmd}` |\n"
    features_md += "\n"

with open("/home/tia/synapse/synapse_500_features.json", "w") as f:
    json.dump(features_json, f, indent=2)

with open("/home/tia/synapse/synapse_500_features.md", "w") as f:
    f.write(features_md)

print("Generated 500 features.")
