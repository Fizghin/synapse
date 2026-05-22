# SYNAPSE_OS Feature Masterlist (400 Features)

## Module: AI

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_045 | **AI anomaly detector** | Machine learning model trained on your normal CPU/RAM patterns — alerts you when something looks off. |
| IMPROVE_046 | **Smart module suggester** | Based on your usage patterns, the app suggests which modules you're likely to fire next. |
| IMPROVE_047 | **Natural language ADB commands** | Type 'disable all Samsung bloatware' and AI translates it into the right ADB pm disable commands. |
| IMPROVE_048 | **Auto bitrate optimizer** | AI continuously tunes scrcpy bitrate and FPS based on current WiFi interference patterns. |
| IMPROVE_049 | **Predictive disconnect prevention** | Detects early signs of ADB instability (rising latency, packet patterns) and pre-reconnects before it drops. |
| IMPROVE_050 | **Usage heatmap** | Visualize which modules you fire most as a color heatmap over the module grid. |
| IMPROVE_051 | **Session summary AI report** | At end of session, AI generates a plain-English summary: what was done, issues encountered, uptime. |
| IMPROVE_052 | **Smart clipboard filter** | AI detects when clipboard contains a password or sensitive data and blocks it from syncing to tablet. |
| IMPROVE_053 | **Ghost touch pattern learning** | AI learns the unique ghost touch signature of your broken digitizer and ignores only those exact patterns. |
| IMPROVE_054 | **Voice-to-ADB command** | Speak a full English sentence, AI converts it to an ADB shell command and executes it. |

## Module: Acoustic

| ID | Feature Name | Description |
|---|---|---|
| TOUCHLESS_025 | **Clap detection → play/pause** | Mic amplitude threshold crossing twice in <600ms via Web Audio API. Simple, low CPU, reliable in quiet room. |
| TOUCHLESS_064 | **Ambient noise level meter → alert** | Web Audio FFT: if dB above threshold for 10s → notify-send 'loud environment'. Simple FFT, mod overhead. |
| TOUCHLESS_065 | **Knock pattern on desk → trigger macro** | Mic detects low-frequency knock pattern via autocorrelation. Moderate DSP, decent reliability on hard desk. |
| TOUCHLESS_066 | **Finger snap → dismiss notification** | Mic detects broadband transient with fast attack → dismisses current toast. Works in quiet room. |
| TOUCHLESS_067 | **Whistle detection → custom event** | FFT dominant frequency 1-3kHz sustained 200ms → WS event. Works but sensitive to HVAC noise. |
| TOUCHLESS_068 | **Speech pause detection → auto-paragraph** | VAD detects >1.5s silence in dictation → injects newline via xdotool. Useful for dictation workflows. |
| TOUCHLESS_092 | **Musical note vocalization → MIDI control** | Mic pitch detection → MIDI CC → DAW control. Hilarious in practice, requires perfect pitch vocalization. |
| TOUCHLESS_096 | **Subliminal sound frequency control** | Mic detects 18-20kHz ultrasonic tones as control signals. Android mic hardware typically rolls off above 16kHz. |
| TOUCHLESS_097 | **Ambient soundscape classification** | Audio CNN classifies room environment (cafe, office, home) in real time → adjusts profile. 200ms+ inference. |
| TOUCHLESS_121 | **Specific alarm clock sound detection → auto-dismiss** | Web Audio FFT fingerprints a known alarm tone frequency pattern → auto-sends dismiss keypress to host. |
| TOUCHLESS_122 | **Phone ringtone detection → put host in DND mode** | Classify incoming ring frequency signature → dunstctl pause + notify on HUD. Acoustic awareness. |
| TOUCHLESS_123 | **Door knock detection → log visitor event** | Mic detects low-freq impact pair (80-400Hz) → logs timestamp + plays doorbell chime via host speaker. |
| TOUCHLESS_124 | **Appliance sound monitoring (smoke alarm)** | FFT matches 3kHz pulsed tone of smoke detector → emergency WS broadcast to all LAN clients. |
| TOUCHLESS_125 | **Glass break detection → security alert** | Broadband transient with specific spectral flatness → fires security alert WS event + optional siren via host. |
| TOUCHLESS_126 | **Background music BPM detection → sync HUD animations** | Web Audio beat tracker → sends current BPM over WS → HUD CSS animation speed synced to music. |
| TOUCHLESS_127 | **Room reverb estimation → meeting mode toggle** | Mic captures impulse (clap) → estimates RT60 reverb time → if large room detected, bumps mic gain. |
| TOUCHLESS_128 | **Voice stress level proxy → break reminder** | Pitch variance + jitter in voice increases under stress → after 30 min of high variance, suggests break. |
| TOUCHLESS_129 | **Acoustic echo map of room** | Speaker plays chirp → mic captures reflections → estimates room geometry. Fascinating but computationally heavy. |
| TOUCHLESS_130 | **Continuous ambient audio fingerprint logging** | Chromaprint-style audio hash every 10s → logs environment signatures. Heavy I/O + privacy concerns. |
| TOUCHLESS_193 | **Fan noise estimation → focus mode toggle** | Mic background noise floor measured → if sustained HVAC band detected → auto-enable noise suppression on mic. |

## Module: Aesthetic

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_001 | **Animated connection pulse** | A living, breathing ring animation around the connection status dot — pulses green on healthy link, turns red and throbs on disconnect. |
| IMPROVE_002 | **Glassmorphism card glow on active module** | When a module fires, its card briefly glows with a colored halo using CSS box-shadow animation. |
| IMPROVE_003 | **20+ professional UI themes** | Cyber Matrix, Stealth Dark, Sunset Fusion, Arctic White, Blood Orange, Deep Ocean, Vaporwave, Tokyo Night, and more — switchable live. |
| IMPROVE_004 | **Custom wallpaper engine for PC app** | Set an animated or static wallpaper behind the glassmorphic panels — syncs with theme selection. |
| IMPROVE_005 | **Particle network background** | A slow-moving particle mesh background that reacts to system CPU load — busier particles = higher CPU. |
| IMPROVE_006 | **Live color extraction from scrcpy feed** | Sample dominant color from the current tablet screen and shift the UI accent color to match in real time. |
| IMPROVE_007 | **Neon scan-line overlay mode** | Optional retro CRT scan-line overlay on the scrcpy mirror window for aesthetic. |
| IMPROVE_008 | **Module grid customizer** | Drag-and-drop rearrange the 100 module cards into your preferred layout. Saved per profile. |
| IMPROVE_009 | **Status LED strip simulator** | A horizontal LED strip UI element at the top of the app that shows device states in color-coded lights. |
| IMPROVE_010 | **Font selector (10 monospace options)** | Switch between fonts: JetBrains Mono, Fira Code, Cascadia, IBM Plex Mono, etc. Applied globally across the app. |
| IMPROVE_011 | **Holographic module card style** | Cards render with a subtle rainbow iridescent sheen on hover — like holographic trading cards. |
| IMPROVE_012 | **Custom icon pack system** | Replace module icons with curated Tabler, Lucide, or custom SVG icon packs per theme. |
| IMPROVE_013 | **Module fire ripple animation** | When any module executes, a ripple wave radiates outward from that card across the grid. |
| IMPROVE_014 | **Data stream waterfall visualization** | A Matrix-style character waterfall on the side panel when data is being transferred at high speed. |
| IMPROVE_015 | **Connection handshake animation** | On successful ADB link, an animated handshake sequence plays with device icons connecting. |
| IMPROVE_016 | **Telemetry graph with physics springs** | CPU/RAM graphs use spring physics — values bounce to their new position instead of jumping. |
| IMPROVE_017 | **Smooth theme transition morphing** | Switching themes cross-fades all colors simultaneously over 400ms instead of instant swap. |
| IMPROVE_018 | **File transfer particle burst** | When a file transfer completes, a burst of particles explodes from the transfer card. |
| IMPROVE_019 | **Keyboard shortcut ghost trail** | When a hotkey fires, ghost key labels float up and fade out at the top of the screen. |
| IMPROVE_020 | **Boot sequence cinematic intro** | On app launch, a 2-second cinematic boot sequence plays: SYNAPSE logo assembles from particles, then UI fades in. |
| IMPROVE_038 | **Network signal quality ring** | A circular signal strength indicator that fills/empties like a speedometer dial. |
| IMPROVE_086 | **DS4 lightbar status indicator** | DS4 lightbar color reflects rig status: blue=connected, green=all good, red=error/disconnect. |

## Module: Audio/Visual

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_023 | **UI sound design pack** | Every button click, module fire, and alert has a distinct, satisfying sound effect. 3 sound packs: Cyber, Minimal, Retro. |
| IMPROVE_024 | **Connection success chime** | A clean 3-note ascending chime plays when ADB handshake completes. |
| IMPROVE_025 | **Alert siren with custom pitch** | Disconnect or ghost-touch re-detection triggers a rising siren — pitch and volume configurable. |
| IMPROVE_026 | **Bidirectional audio stream** | Stream tablet audio to PC speakers AND PC audio back to tablet — full duplex over ADB. |
| IMPROVE_027 | **Audio spectrum visualizer panel** | Real-time FFT spectrum visualizer for the audio stream — bars react to frequencies. |
| IMPROVE_028 | **Voice command activation** | Say 'Synapse, fire module 47' and the app executes it via Web Speech API on the PC. |
| IMPROVE_029 | **Volume crossfader** | A DJ-style crossfader slider to blend PC and tablet audio levels in real time. |
| IMPROVE_030 | **Sound pack creator** | Record your own UI sounds and save them as a custom sound pack. |
| IMPROVE_031 | **Beat-reactive UI mode** | UI accent colors pulse in sync with the beat of whatever audio is playing on the system. |
| IMPROVE_032 | **Mute all hotkey with visual confirmation** | Single hotkey mutes both devices simultaneously — a large MUTED badge overlays the screen briefly. |

## Module: Core

| ID | Feature Name | Description |
|---|---|---|
| RIG_001 | **Wireless screen mirror (tab→PC)** | Stream the tablet display to your PC over WiFi using scrcpy or custom H.265 pipeline. |
| RIG_002 | **Wireless screen mirror (PC→tab)** | Mirror your PC desktop onto the tablet screen as a second monitor. |
| RIG_013 | **Universal mouse sharing** | Move your PC mouse off-screen edge to seamlessly control the tablet. |
| RIG_014 | **Universal keyboard sharing** | Type on your PC keyboard and have input routed to whichever device is focused. |
| RIG_016 | **Touch event injection from PC** | Click on the tablet mirror window on PC and inject a real touch event on the tablet. |
| RIG_025 | **Universal clipboard sync** | Copy on PC, paste on tablet (and vice versa) automatically in real time. |
| RIG_045 | **Mirror tab notifications to PC** | All Android notifications from the tablet appear as desktop notifications on PC. |
| RIG_055 | **One-click rig startup** | Single button that connects ADB, starts dd silencer, and launches scrcpy. |
| RIG_057 | **Auto-reconnect on disconnect** | App automatically re-establishes ADB and restarts all services after a drop. |
| RIG_073 | **Device pairing with PIN** | First-time connection requires confirming a PIN on both devices. |
| RIG_079 | **No-cloud architecture** | All data stays on LAN — no external servers, no cloud relay. |
| RIG_081 | **Live localhost tunnel to tablet** | Automatically expose PC localhost:3000 to the tablet browser on the same URL. |

## Module: Dev Tool

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_065 | **Built-in ADB shell terminal** | A full interactive ADB shell terminal inside the app with syntax highlighting and command history. |
| IMPROVE_066 | **Live logcat stream with color filters** | Stream Android logcat with color-coded log levels and regex filter support. |
| IMPROVE_067 | **React DevTools auto-bridge** | Automatically detect and bridge the standalone React DevTools to the tablet's Expo app. |
| IMPROVE_068 | **Next.js HMR health panel** | Show HMR connection status, last update time, and module hot-swap speed. |
| IMPROVE_069 | **APK drag-and-drop installer** | Drop an APK file onto the Synapse window and it auto-installs on the tablet via adb install. |
| IMPROVE_070 | **Port forward manager GUI** | Visual GUI for all active adb forward and reverse tunnels — add/remove without CLI. |
| IMPROVE_071 | **Network request inspector** | Intercept and display HTTP requests made by apps on the tablet — like Charles Proxy built-in. |
| IMPROVE_072 | **Crash log auto-collector** | Automatically capture tombstone crash logs from the tablet and display them formatted in the app. |
| IMPROVE_073 | **Gamepad API visualizer** | Real-time visual of all DS4 axis values and button states — essential for debugging Gamepad API code. |
| IMPROVE_074 | **Multi-device Chrome DevTools** | Open remote debugging Chrome DevTools from PC connected to the tablet browser over ADB. |
| IMPROVE_075 | **Scrcpy flag builder GUI** | Visual GUI to construct scrcpy launch flags — sliders for FPS, bitrate, size with live preview of the command. |
| IMPROVE_076 | **ADB command library** | Searchable database of 200+ useful ADB commands — click to execute instantly. |
| IMPROVE_093 | **If-this-then-that rule engine** | Build conditional logic: 'If RAM < 200MB then fire module 41 and notify me'. |
| IMPROVE_096 | **Webhook integration** | Trigger any module externally via HTTP webhook — lets you automate from other tools. |
| IMPROVE_097 | **CLI mode** | Run Synapse headlessly from terminal with full module control: synapse fire 47 --device tab |
| IMPROVE_098 | **GitHub Actions integration** | Fire Synapse modules as steps in a GitHub Actions CI/CD workflow — e.g. auto-install APK on push. |
| IMPROVE_099 | **Config version control** | Every config change is versioned internally — roll back to any previous rig configuration. |

## Module: Device Physics

| ID | Feature Name | Description |
|---|---|---|
| TOUCHLESS_019 | **Orientation-based screen rotation** | Gyroscope on tablet → if pitch > 80° → send WS command → host runs xrandr --rotate. Instant, reliable. |
| TOUCHLESS_020 | **Shake gesture → mute toggle** | Accelerometer detects >3g burst across 200ms → amixer set Master toggle. Very low false positive on a desk. |
| TOUCHLESS_021 | **Tilt left → previous workspace** | Roll angle < -25° sustained 400ms → wmctrl -n + wmctrl -s (prev desktop). Clean, low CPU. |
| TOUCHLESS_022 | **Tilt right → next workspace** | Roll angle > 25° sustained 400ms → wmctrl -s (next desktop). Mirror of tilt-left. |
| TOUCHLESS_023 | **Lay flat → screen dim** | Pitch near 0° for 5s → xrandr --brightness 0.2. Saves burn-in when user walks away. |
| TOUCHLESS_024 | **Stand upright → screen restore** | Pitch returns to 60-90° → xrandr --brightness 1.0. Paired with lay-flat dim. |
| TOUCHLESS_078 | **Gyro tap-tap detection → enter key** | Accelerometer detects double-tap physical surface event via high-pass filter → xdotool key Return. |
| TOUCHLESS_079 | **Rotation rate threshold → undo** | Gyro detects rapid twist (>200°/s) → xdotool key ctrl+z. Hard to distinguish accidental bumps. |
| TOUCHLESS_080 | **Free-fall detection → emergency lock** | Accelerometer magnitude < 0.5g for 100ms → instant xset dpms force off + lock. Device safety feature. |
| TOUCHLESS_151 | **Tap surface once → keyboard shortcut 1** | Accelerometer 1 impact (15-30ms) → xdotool key ctrl+c. Single tap = copy. Tactile desk interaction. |
| TOUCHLESS_152 | **Tap surface twice → keyboard shortcut 2** | Two impacts < 300ms apart → xdotool key ctrl+v. Double tap = paste. |
| TOUCHLESS_153 | **Three taps → keyboard shortcut 3** | Triple impact burst → xdotool key ctrl+z. Three taps = undo. |
| TOUCHLESS_154 | **Long hold tap → right-click context menu** | Single impact held vibration (pressure proxy via sustained z-variance) → xdotool click 3. |
| TOUCHLESS_155 | **Spinning tablet on surface → app carousel** | Gyro Z-axis sustained rotation → cycles through running app list via wmctrl. Fun, low false positives. |
| TOUCHLESS_156 | **Vigorous shake → panic kill all terminals** | High-magnitude sustained shake (>4g, >500ms) → killall gnome-terminal xterm. Emergency quit. |
| TOUCHLESS_157 | **Tilt forward (toward user) → scroll to top** | Pitch angle drops below -15° sustained 300ms → xdotool key ctrl+Home. |
| TOUCHLESS_158 | **Tilt back → scroll to bottom** | Pitch > +15° sustained → xdotool key ctrl+End. Paired with tilt-forward. |
| TOUCHLESS_159 | **Circular tilt motion → window resize** | Gyro traces circular path → maps radius to window size delta → wmctrl resize. Experimental. |
| TOUCHLESS_160 | **Micro-vibration pattern logger** | Accelerometer logs vibration signature of desk (fans, HDD spin) → anomaly detection if pattern changes. |
| TOUCHLESS_172 | **HUD widget layout saved per orientation** | Gyro detects landscape vs portrait → loads different widget layout JSON from localStorage. Adaptive HUD. |
| TOUCHLESS_184 | **Inactivity auto-lock with grace countdown** | xprintidle > 300000ms → HUD shows 10s countdown → if no button press → xset dpms force off + lock. |

## Module: Hardware Keys

| ID | Feature Name | Description |
|---|---|---|
| TOUCHLESS_001 | **Physical button wake/sleep cycle** | Map power button long-press to xdotool key super+l for screen lock. Zero latency, 100% reliable. |
| TOUCHLESS_002 | **Volume-up single press → scroll up** | Use evdev/udev rules to intercept volume key events and pipe to xdotool key Page_Up. Native Linux, <5ms latency. |
| TOUCHLESS_003 | **Volume-down single press → scroll down** | Mirror of scroll up. xdotool key Page_Down on volume- event. Solid tactile feedback loop. |
| TOUCHLESS_004 | **Volume-up hold → master volume raise** | evdev hold detection + amixer set Master 5%+ via systemd oneshot. Instant, no vision overhead. |
| TOUCHLESS_005 | **Volume-down hold → master volume lower** | amixer set Master 5%- on sustained keydown. Pure shell, zero CPU cost. |
| TOUCHLESS_006 | **Double volume-up → next track** | Debounce two rapid presses in Node.js event buffer → playerctl next. Reliable, <10ms. |
| TOUCHLESS_007 | **Double volume-down → previous track** | Same debounce logic → playerctl previous. Clean and battle-tested. |
| TOUCHLESS_008 | **Power + volume-up chord → brightness up** | Chord detection in evdev listener → xrandr --brightness increment. Hardware-native. |
| TOUCHLESS_009 | **Power + volume-down chord → brightness down** | xrandr --brightness decrement on chord. Works fully offline, no camera. |
| TOUCHLESS_010 | **Triple volume-up → play/pause toggle** | Three-press burst → playerctl play-pause. Tactile, deterministic, zero false positives. |
| TOUCHLESS_101 | **Vol-up triple hold → emergency SOS WS broadcast** | 3s hold on vol-up → Node.js broadcasts SOS JSON to all WS clients on LAN. Instant hardware-based alert. |
| TOUCHLESS_102 | **Vol-down triple hold → start screen recorder** | ffmpeg -f x11grab launched via WS command on 3s vol-down hold. Zero camera, pure hardware trigger. |
| TOUCHLESS_103 | **Power double-tap → toggle do-not-disturb** | Rapid power presses → dunstctl set-paused toggle. Silences all Ubuntu notifications instantly. |
| TOUCHLESS_104 | **Vol-up then vol-down rapid sequence → toggle Wi-Fi** | Alternating button pattern → nmcli radio wifi toggle on host. Morse-code-like physical input. |
| TOUCHLESS_105 | **Vol-down then vol-up → toggle Bluetooth on host** | Paired alternate press → rfkill toggle bluetooth. Pure hardware, zero camera. |
| TOUCHLESS_106 | **Power 5-tap → safe shutdown sequence** | Five rapid power taps → sends shutdown -h +1 with cancelable WS confirmation window on HUD. |
| TOUCHLESS_107 | **Vol chord held 10s → factory reset confirmation UI** | Sustained chord triggers HUD overlay asking for second physical confirmation before wipe. Safety interlock. |
| TOUCHLESS_108 | **Vol-up hold at boot → recovery mode menu** | Physical key state read at app startup → displays HUD recovery menu (clear cache, reset prefs, etc.). |
| TOUCHLESS_109 | **Button sequence as morse code input** | Vol-up = dot, vol-down = dash, power = space. Buffer decoded to ASCII → WS types to host. Slow but 100% offline. |
| TOUCHLESS_110 | **Button rhythm pattern → scene activation** | Custom tap rhythm (long-short-long) → maps to scene ID → WS activates KDE/GNOME activity. Rhythmic macro. |
| TOUCHLESS_178 | **Pomodoro timer driven by HUD + physical keys** | Vol-up starts 25min timer, vol-down pauses, power skip. Piper TTS announces breaks. Full Pomodoro cycle. |
| TOUCHLESS_185 | **Microphone always-off mode with LED indicator** | HUD toggle (via vol buttons) → amixer set Capture nocap → HUD shows red mic icon. Privacy assurance. |
| TOUCHLESS_186 | **Camera hardware disable flag** | Vol chord → sets camera: false in app config → getUserMedia returns null. Software camera kill switch. |

## Module: High

| ID | Feature Name | Description |
|---|---|---|
| RIG_003 | **Dual-display layout manager** | Drag windows to snap between PC and tablet displays from one UI. |
| RIG_004 | **Adaptive bitrate streaming** | Auto-adjust video bitrate based on current WiFi signal strength. |
| RIG_006 | **Always-on-top window mode** | Pin the tablet mirror window above all other PC windows. |
| RIG_008 | **Screenshot from either device** | Capture a screenshot of the tablet or PC screen from the other device. |
| RIG_015 | **Gamepad/controller passthrough** | Forward DS4 or Xbox controller input from PC to tablet apps or vice versa. |
| RIG_018 | **Keyboard shortcut remapper** | Map PC hotkeys to tablet app actions (e.g. Ctrl+1 = switch chat room in Orbit). |
| RIG_019 | **Touch blocker toggle** | Instantly disable/enable the tablet touchscreen via a PC hotkey. |
| RIG_021 | **Multi-device focus switcher** | Click a device indicator on the taskbar to direct all keyboard/mouse input there. |
| RIG_024 | **Scroll wheel on tablet scroller** | Use PC mouse scroll wheel to scroll content on the mirrored tablet screen. |
| RIG_026 | **Drag-and-drop file transfer** | Drag a file from PC desktop onto the tablet mirror window to transfer it. |
| RIG_027 | **Shared file drop zone** | A folder visible on both devices — drop files in from either side. |
| RIG_028 | **Transfer progress indicator** | Show a progress bar and speed readout for file transfers between devices. |
| RIG_034 | **Live CPU/RAM dashboard** | Real-time CPU and RAM usage for both devices shown side-by-side. |
| RIG_035 | **Battery level monitor (tab)** | Show tablet battery % and charging status on the PC app at all times. |
| RIG_036 | **Controller battery monitor** | Show DS4/controller battery level with low-battery desktop notification. |
| RIG_041 | **Connection health score** | A single 0-100 score summarizing ADB stability, latency, and packet loss. |
| RIG_044 | **Auto-kill RAM hog on tab** | Automatically kill the highest RAM-consuming app on the tablet when free RAM is low. |
| RIG_046 | **Reply to messages from PC** | Click a notification on PC and type a reply that sends from the tablet. |
| RIG_048 | **Battery low alert** | Pop-up on PC when tablet battery drops below a set threshold. |
| RIG_049 | **ADB disconnect alert** | Instant desktop notification when the ADB connection drops. |
| RIG_051 | **Ghost touch re-detection warning** | Alert if touch events are detected despite the dd silencer being active. |
| RIG_054 | **Remote app launcher** | Browse and launch any installed app on the tablet from the PC app. |
| RIG_056 | **Saved session profiles** | Save different rig configurations (dev mode, media mode, etc.) and switch instantly. |
| RIG_060 | **ADB command console** | A built-in ADB shell terminal in the app for running custom commands. |
| RIG_061 | **Package manager (tab)** | Install, uninstall, and disable APKs on the tablet from the PC app. |
| RIG_066 | **Stream tablet audio to PC speakers** | Forward all audio output from the tablet and play it on PC speakers. |
| RIG_071 | **Mute tablet remotely** | Instantly mute/unmute the tablet from a PC hotkey. |
| RIG_074 | **Encrypted data channel** | All transferred files and clipboard data encrypted in transit with AES-256. |
| RIG_075 | **Screen privacy mode** | Blur or black out the tablet stream on PC with a hotkey when needed. |
| RIG_076 | **Connection allowlist** | Only allow specific PC IP addresses to connect to the tablet. |
| RIG_082 | **HMR health indicator** | Show whether Next.js hot module replacement is active and delivering updates. |
| RIG_083 | **Remote browser DevTools** | Open Chrome DevTools on PC connected to the browser running on the tablet. |
| RIG_084 | **ADB logcat viewer** | Stream and filter Android logcat output in a panel inside the app. |
| RIG_085 | **React DevTools bridge** | Automatically bridge the standalone React DevTools to the tablet's browser. |
| RIG_087 | **Crash log collector** | Automatically capture and display crash logs from the tablet app. |
| RIG_089 | **APK sideload from PC** | Drag-drop an APK onto the app to instantly install it on the tablet. |
| RIG_092 | **Dark / light theme** | Full dark and light mode for the app UI itself. |
| RIG_095 | **Hotkey customizer** | Rebind every app hotkey from a settings panel. |
| RIG_096 | **System tray / menu bar mode** | Minimize the app to system tray with quick-access menu for common actions. |
| RIG_098 | **Startup behavior config** | Choose whether the app auto-starts with the OS and auto-connects on launch. |
| RIG_099 | **Connection indicator LED** | Color-coded status dot (green/yellow/red) for connection health always visible. |

## Module: Medium

| ID | Feature Name | Description |
|---|---|---|
| RIG_005 | **Display resolution profiles** | Save and switch between resolution/FPS presets (performance vs quality). |
| RIG_007 | **Rotate display remotely** | Change the tablet screen orientation from the PC app. |
| RIG_009 | **Screen recording with sync** | Record the streamed display with audio and save to PC. |
| RIG_012 | **Stream latency monitor** | Overlay showing current round-trip latency of the video stream in ms. |
| RIG_017 | **Swipe gesture macros** | Define custom swipe patterns on the PC that get injected as gestures on the tablet. |
| RIG_020 | **Mouse pointer speed sync** | Match pointer speed on both devices from one settings slider. |
| RIG_022 | **Macro recorder** | Record a sequence of actions on one device and replay them on demand. |
| RIG_029 | **Image clipboard preview** | When an image is copied, show a thumbnail preview in the app panel. |
| RIG_030 | **Clipboard history** | Keep a scrollable history of the last 20 clipboard entries from both devices. |
| RIG_031 | **Auto photo sync** | Any new photo taken on the tablet auto-syncs to a folder on the PC. |
| RIG_033 | **Transfer queue manager** | Queue multiple file transfers and manage them with pause/resume/cancel. |
| RIG_037 | **WiFi signal strength meter** | Show current WiFi RSSI for both devices to diagnose streaming issues. |
| RIG_038 | **Network throughput graph** | Live graph of MB/s being used by the rig stream and transfers. |
| RIG_039 | **Tablet storage overview** | Show used/free storage on the tablet's internal and SD card. |
| RIG_040 | **Running processes list (tab)** | List of apps currently running on the tablet with RAM usage per app. |
| RIG_043 | **Temperature monitor (tab)** | Show tablet CPU temperature to detect thermal throttling risk. |
| RIG_047 | **Notification filter rules** | Whitelist or blacklist apps whose notifications get mirrored to PC. |
| RIG_050 | **Stream quality degradation alert** | Notify when video bitrate drops significantly due to WiFi congestion. |
| RIG_052 | **App crash alert (tab)** | Get a PC notification if an app on the tablet crashes. |
| RIG_058 | **Wake-on-LAN for tablet** | Send a magic packet to wake the tablet from sleep mode remotely. |
| RIG_059 | **Remote reboot / shutdown (tab)** | Reboot or power off the tablet from the PC app. |
| RIG_062 | **Workflow automation scripts** | Write and run bash scripts that affect both devices from one place. |
| RIG_064 | **Session log / activity history** | Keep a log of every action, connection event, and transfer in the session. |
| RIG_065 | **Quick-launch bookmarks** | Pin frequently used ADB commands or app launches to a quick-access bar. |
| RIG_067 | **Stream PC audio to tablet** | Route PC audio to the tablet's speaker for a wireless speaker setup. |
| RIG_068 | **Mic passthrough (PC→tab)** | Use the PC microphone as the active input for tablet apps like voice chat. |
| RIG_069 | **Volume sync** | Changing volume on one device mirrors the change on the other. |
| RIG_072 | **Audio codec selector** | Choose between Opus, AAC, or raw PCM for the audio stream depending on latency needs. |
| RIG_077 | **Auto-lock on disconnect** | Lock the tablet screen automatically when the PC app disconnects. |
| RIG_078 | **Session timeout** | Auto-disconnect after a configurable idle period. |
| RIG_080 | **Access log** | Full log of every device that connected, when, and what was transferred. |
| RIG_086 | **Port forwarding manager** | GUI for managing ADB forward and reverse port mappings between devices. |
| RIG_088 | **Network request inspector** | Inspect HTTP requests made by apps on the tablet (like Charles Proxy, on-device). |
| RIG_090 | **Performance profiler** | Measure frame rate, jank, and CPU time for apps running on the tablet. |
| RIG_091 | **Gamepad API test panel** | Visualize DS4 button presses and axis values in real time for debugging. |
| RIG_094 | **Compact / expanded layout modes** | Switch between a minimal tray-style UI and a full dashboard view. |
| RIG_097 | **Widget dashboard** | Drag-and-drop panel of widgets: battery, CPU, connection status, clipboard. |
| RIG_100 | **Export config to file** | Export your entire rig config (IPs, profiles, hotkeys) to a JSON file to restore later. |

## Module: Network/WS

| ID | Feature Name | Description |
|---|---|---|
| TOUCHLESS_011 | **WebSocket heartbeat ping** | Node.js server sends a JSON ping every 2s. Client JS ACKs. Detects disconnect in <4s. Foundation for all WS features. |
| TOUCHLESS_012 | **Push notification overlay** | Ubuntu sends notify-send; Node.js mirrors payload over WS → client renders a toast div. Dead simple, instant. |
| TOUCHLESS_013 | **Clipboard sync** | xclip -selection clipboard piped over WS to Android clipboard API. Bidirectional text sharing. |
| TOUCHLESS_014 | **Active window title display** | wmctrl -l polled every 500ms, diff detected, pushed over WS. Client shows current active app in HUD bar. |
| TOUCHLESS_015 | **System CPU/RAM meter HUD** | /proc/stat and /proc/meminfo read every 2s, JSON-pushed to client. Renders a live gauge on tablet. |
| TOUCHLESS_016 | **Media metadata display** | playerctl metadata piped over WS every second. Shows track name, artist, album on HUD. |
| TOUCHLESS_017 | **Battery level display** | upower -i /org/freedesktop/UPower/devices/battery polled, pushed as JSON. Simple HUD widget. |
| TOUCHLESS_018 | **Network speed meter** | Parse /proc/net/dev at 1s intervals, compute delta bytes/s, push to tablet HUD. Zero overhead. |
| TOUCHLESS_034 | **WS command: open application** | Tablet sends {cmd:'launch', app:'firefox'} → server runs xdg-open or direct binary. Clean RPC. |
| TOUCHLESS_035 | **WS command: close active window** | Tablet sends close_active → server runs wmctrl -c :ACTIVE:. Simple. |
| TOUCHLESS_036 | **WS command: type text** | Tablet sends {cmd:'type', text:'...'} → xdotool type --delay 20 -- "text". Universal input injection. |
| TOUCHLESS_037 | **WS command: move mouse to coords** | Tablet sends {cmd:'mouse', x:400, y:300} → xdotool mousemove. Foundation for all pointer control. |
| TOUCHLESS_038 | **WS command: left click** | xdotool click 1 on server side. Pairs with mouse move for full pointer control. |
| TOUCHLESS_039 | **WS command: right click** | xdotool click 3. Menu access without touch. |
| TOUCHLESS_040 | **WS command: scroll wheel** | xdotool click 4/5 for scroll up/down. Infinite scroll without touch input. |
| TOUCHLESS_073 | **BLE device proximity → lock/unlock** | Bluetooth LE RSSI of paired device (phone/watch) → if RSSI < -85dBm, lock host. Solid BLE concept. |
| TOUCHLESS_074 | **BLE device appears → auto-launch app** | bluetoothctl monitor detects known MAC → triggers app launch. Reliable with known devices. |
| TOUCHLESS_075 | **Wi-Fi SSID change → environment mode** | iwgetid polls SSID → 'office' SSID triggers work profile, 'home' triggers home profile. |
| TOUCHLESS_076 | **Local LAN device count → occupancy indicator** | nmap -sn sweep counts active IPs → displays room occupancy estimate on HUD. |
| TOUCHLESS_077 | **Port scan script trigger over WS** | Tablet sends scan request → server runs nmap → returns open services JSON to HUD. |
| TOUCHLESS_111 | **WS command: focus window by partial title** | Tablet sends {cmd:'focus', title:'Firefox'} → wmctrl -a. Lets HUD act as window switcher. |
| TOUCHLESS_112 | **WS command: move window to coordinates** | wmctrl -r :ACTIVE: -e 0,x,y,w,h piped from WS payload. Full remote window manager. |
| TOUCHLESS_113 | **WS command: take named screenshot + push to HUD** | scrot /tmp/snap.png → base64 → WS → HUD img element. Live screen preview on tablet. |
| TOUCHLESS_114 | **WS file transfer: host → tablet** | Host reads file → base64 chunks over WS → tablet reassembles Blob → offers download. LAN file share. |
| TOUCHLESS_115 | **WS file transfer: tablet → host** | Reverse direction. Tablet sends FileReader chunks → host Node.js writes to ~/Downloads/. Bidirectional. |
| TOUCHLESS_116 | **LAN mDNS service discovery display** | avahi-browse -a on host → JSON over WS → HUD shows all LAN services (Plex, printers, NAS). Network map. |
| TOUCHLESS_117 | **Running process list on HUD** | ps aux --sort=-%cpu | head -20 → JSON over WS every 5s → live process table on tablet. |
| TOUCHLESS_118 | **Kill process by WS command** | Tablet sends {cmd:'kill', pid:1234} → server runs kill -9 PID. Remote task manager from HUD. |
| TOUCHLESS_119 | **Disk usage tree pushed to HUD** | du -sh /* → JSON → rendered as treemap on tablet. Storage overview without touching host. |
| TOUCHLESS_120 | **WS-based alarm scheduler** | Tablet sends {cmd:'alarm', time:'09:30', msg:'standup'} → host cron job → plays TTS + notify at scheduled time. |
| TOUCHLESS_173 | **WS-pushed calendar event overlay** | Host cron checks gcalcli or calcurse → upcoming events JSON over WS → HUD shows next 3 events. |
| TOUCHLESS_174 | **Live terminal output widget** | tail -f /var/log/syslog | WS stream → HUD renders live log tail. System monitoring at a glance. |
| TOUCHLESS_175 | **Git status widget** | git status --short in watched repo → JSON over WS → HUD shows modified/untracked file count. |
| TOUCHLESS_176 | **Docker container status HUD** | docker ps --format json polled every 10s → WS → HUD shows running containers, uptime, port map. |
| TOUCHLESS_177 | **Weather widget via curl wttr.in** | curl wttr.in/?format=j1 on server every 30min → JSON cached → WS pushed to HUD weather card. |
| TOUCHLESS_179 | **Focus mode: dims non-primary windows on HUD** | wmctrl lists windows → all except active get 0.4 opacity via xprop → snaps back on switch. |
| TOUCHLESS_180 | **Idle time tracker pushed to HUD** | xprintidle polled every minute → accumulated idle vs active time → daily productivity bar on HUD. |
| TOUCHLESS_182 | **WS session encryption (WSS)** | Node.js upgraded to wss:// with self-signed cert → all WS traffic TLS-encrypted on LAN. Security baseline. |
| TOUCHLESS_183 | **MAC address allowlist for WS connections** | Server checks client IP → arp-scan maps to MAC → rejects unknown devices. LAN access control. |
| TOUCHLESS_187 | **WS command audit log** | Every command received logged with timestamp, source IP, payload to ~/synapse_audit.log. Security trail. |
| TOUCHLESS_188 | **Anomalous command rate limiter** | Node.js: if >20 WS commands in 5s from one IP → auto-disconnect + notify-send. Anti-replay protection. |
| TOUCHLESS_190 | **Network traffic anomaly HUD alert** | Monitor /proc/net/dev for sudden bandwidth spike → alert if > 10MB/s unexpected → WS warning. |
| TOUCHLESS_191 | **Time-of-day adaptive HUD theme** | Node.js compares current hour → morning/afternoon/evening/night JSON config → HUD re-themes automatically. |
| TOUCHLESS_192 | **Sunrise/sunset screen color temp shift** | curl sunrise-sunset.org API → at sunset xrandr --gamma 1.0:0.85:0.7. Blue light reduction. |
| TOUCHLESS_194 | **Power outage detection → graceful shutdown** | UPS or battery event via upower → if discharging and < 10% → saves all open docs + initiates shutdown. |
| TOUCHLESS_198 | **Multi-HUD mesh: two tablets as extended display** | Two SM-T515 units both on WS server → each receives different widget region → extended HUD dashboard. |
| TOUCHLESS_199 | **Self-diagnostics report on WS connect** | On new WS connection, server auto-sends: CPU load, free RAM, disk %, open ports, git hash of server app. |
| TOUCHLESS_200 | **SYNAPSE_OS watchdog process** | systemd service monitors Node.js server + MediaPipe loop PIDs → auto-restarts crashed components. OS-level reliability. |

## Module: Nice

| ID | Feature Name | Description |
|---|---|---|
| RIG_010 | **Picture-in-picture mode** | Float a small tablet preview in the corner of your PC screen. |
| RIG_011 | **Night mode / color filter sync** | Sync blue-light filter settings between both devices simultaneously. |
| RIG_023 | **Voice command passthrough** | Speak into PC mic and have voice commands execute on the tablet. |
| RIG_032 | **Pastebin-style quick share** | Paste text on PC and instantly have a shareable temp link for the tablet browser. |
| RIG_042 | **Rig uptime counter** | Show how long the current session has been running without a disconnect. |
| RIG_053 | **Scheduled reminder push** | Set a reminder on PC that fires as a notification on the tablet. |
| RIG_063 | **Multi-device task queue** | Queue a list of actions across both devices and run them sequentially. |
| RIG_070 | **Audio visualizer overlay** | Lightweight spectrum visualizer overlay on the streaming window. |
| RIG_093 | **Custom accent color** | Choose your app accent color to match your rig aesthetic. |

## Module: Performance

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_034 | **Streaming latency counter overlay** | ms latency counter overlaid directly on the scrcpy mirror window like a game FPS counter. |
| IMPROVE_055 | **Zero-copy clipboard pipeline** | Clipboard sync uses shared memory instead of WebSocket serialization — microsecond latency. |
| IMPROVE_056 | **H.265 hardware encoder selection** | Automatically select the fastest hardware H.265 encoder available (VAAPI, NVENC, etc.). |
| IMPROVE_057 | **USB 3.0 throughput mode** | Detect USB 3.0 connection and unlock higher ADB transfer speed caps automatically. |
| IMPROVE_058 | **Parallel module execution** | Fire up to 5 modules simultaneously via multi-threaded child_process workers instead of sequential queuing. |
| IMPROVE_059 | **Pre-warmed ADB command cache** | Common ADB commands are pre-executed and cached — module response time drops to near-zero. |
| IMPROVE_060 | **RAM usage optimizer (PC side)** | Electron memory profiler that auto-garbage-collects when PC app RAM exceeds a set threshold. |
| IMPROVE_061 | **Differential screen update streaming** | Only transmit pixels that changed between frames — drastically cuts bandwidth on static screens. |
| IMPROVE_062 | **Network QoS tagging** | Mark Synapse traffic with DSCP QoS tags so your router prioritizes it over other traffic. |
| IMPROVE_063 | **Startup time under 2 seconds** | Aggressive lazy-loading and pre-fork worker pool to get from cold launch to connected in under 2s. |
| IMPROVE_064 | **Benchmark mode** | Run a full performance benchmark of the rig — measures stream latency, transfer speed, input lag — and generates a score. |

## Module: Security

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_077 | **End-to-end AES-256 channel** | All WebSocket traffic encrypted with AES-256-GCM — clipboard, files, commands, everything. |
| IMPROVE_078 | **Device fingerprint pairing** | First connection requires matching a cryptographic device fingerprint on both screens simultaneously. |
| IMPROVE_079 | **Screen privacy blur hotkey** | One hotkey instantly blurs the scrcpy mirror — for when someone walks behind you. |
| IMPROVE_080 | **IP allowlist with live editor** | Only whitelisted IPs can connect. Edit the list live from the app without restarting. |
| IMPROVE_081 | **Auto-lock on idle** | After configurable idle time, lock both devices and require PIN to resume the session. |
| IMPROVE_082 | **Clipboard encryption in transit** | Clipboard contents are AES-encrypted before going over the WebSocket — decrypted only on receipt. |
| IMPROVE_083 | **Stealth mode** | Hide the Synapse app from the taskbar and Alt+Tab switcher — accessible only via system tray or hotkey. |
| IMPROVE_084 | **Full audit trail export** | Export a cryptographically signed log of every action, connection, and file transfer to a JSON file. |

## Module: UX

| ID | Feature Name | Description |
|---|---|---|
| IMPROVE_021 | **Module cooldown radial timer** | After firing a module, a radial progress ring shows the cooldown before it can fire again. |
| IMPROVE_022 | **Disconnect earthquake shake** | When ADB drops, the entire UI briefly shakes like an earthquake — impossible to miss. |
| IMPROVE_033 | **Persistent mini HUD overlay** | A always-on-top translucent strip at screen edge showing: connection status, CPU%, RAM%, battery, latency. Never goes away. |
| IMPROVE_035 | **Touch coordinate crosshair** | When tablet touch coordinates are sent to PC, a crosshair appears on the PC screen showing exactly where the click lands. |
| IMPROVE_036 | **Ghost touch detector HUD** | A live event counter overlay showing how many ghost touch events are being silenced per second. |
| IMPROVE_037 | **Dual device battery bar** | Side-by-side battery indicators for PC (if laptop), tablet, and DS4 controller — always visible. |
| IMPROVE_039 | **Clipboard preview toast** | When clipboard syncs, a toast popup shows a preview of what just synced — text snippet or image thumbnail. |
| IMPROVE_040 | **Active module indicator ribbon** | A horizontal ribbon at the bottom listing the last 5 modules fired with timestamps. |
| IMPROVE_041 | **Fullscreen takeover alert mode** | Critical alerts (disconnect, ghost touch return) trigger a full-screen red overlay that demands acknowledgment. |
| IMPROVE_042 | **PiP tablet mirror anywhere** | Float a small live tablet mirror as a Picture-in-Picture window over any app on the PC. |
| IMPROVE_043 | **DS4 button map HUD** | An overlay showing the current DS4 button → action mapping so you never forget your hotkeys. |
| IMPROVE_044 | **Session timeline scrubber** | A visual timeline of everything that happened in the session — scroll back through events like a git log. |
| IMPROVE_085 | **DS4 rumble on module fire** | Trigger left/right motor rumble on the DS4 controller when a module executes successfully. |
| IMPROVE_087 | **Tablet vibration on PC alert** | When PC fires a critical alert, the tablet vibrates via adb shell cmd vibrator_manager. |
| IMPROVE_088 | **Haptic pattern library** | Choose from 10 rumble patterns for different event types — short tap, double pulse, long buzz, etc. |
| IMPROVE_089 | **DS4 touchpad gesture library** | Map DS4 touchpad swipes (up/down/left/right/tap) to custom Synapse actions. |
| IMPROVE_090 | **Battery critical vibration pattern** | When tablet battery hits critical level, DS4 fires a distinct urgent rumble pattern. |
| IMPROVE_091 | **Macro recorder & replayer** | Record any sequence of module fires, delays, and commands — save and replay with one click. |
| IMPROVE_092 | **Scheduled automation tasks** | Schedule any module to fire at a specific time — e.g. auto-clear RAM every 30 mins. |
| IMPROVE_094 | **Session profile hot-swap** | Save the full rig state as a named profile (Dev Mode, Media Mode, Presentation Mode) and switch in one click. |
| IMPROVE_095 | **Morning startup sequence** | A configurable boot sequence that fires a chain of modules automatically when Synapse launches. |
| IMPROVE_100 | **Synapse Cloud Sync (LAN only)** | Sync your profiles, macros, and configs between multiple PC workstations over LAN — zero cloud dependency. |

## Module: Vision

| ID | Feature Name | Description |
|---|---|---|
| TOUCHLESS_028 | **Presence detection → screen on** | Front camera luma average rises above threshold → host exits screensaver. Simple frame diff, low overhead. |
| TOUCHLESS_029 | **Absence detection → screen off** | No face detected for 30s → xset dpms force off. Companion to presence detection. |
| TOUCHLESS_030 | **QR code scan → open URL on host** | Rear camera + jsQR library → decoded URL sent over WS → host runs xdg-open. Zero extra model overhead. |
| TOUCHLESS_031 | **Barcode scan → clipboard paste** | jsQR/zxing-js detects 1D barcode on rear cam → pushes string over WS → xdotool type on host. |
| TOUCHLESS_032 | **Flashlight mode → rear LED on** | Host sends torch command → tablet JS enables rear camera torch track constraint. Useful HUD utility. |
| TOUCHLESS_033 | **Ambient light reading → auto-brightness** | Front camera average brightness sampled every 5s → xrandr --brightness scaled linearly. |
| TOUCHLESS_041 | **Hand wave → next slide** | MediaPipe Hands detects leftward swipe velocity > threshold → WS → xdotool key Right. 200-400ms latency. |
| TOUCHLESS_042 | **Thumbs up gesture → confirm action** | MediaPipe Hands thumbs-up classifier → sends confirm signal over WS. Moderate CPU on MediaPipe loop. |
| TOUCHLESS_043 | **Thumbs down gesture → cancel action** | MediaPipe Hands thumbs-down classifier → cancel WS event. Same overhead as thumbs-up. |
| TOUCHLESS_044 | **Open palm → pause all media** | MediaPipe Hands: all 5 fingers extended → playerctl pause. Good semantics, moderate CPU. |
| TOUCHLESS_045 | **Fist gesture → stop script** | MediaPipe Hands: 0 fingers extended → sends kill signal over WS. Needs reliable fist classifier. |
| TOUCHLESS_046 | **Two-finger point → mouse warp** | MediaPipe Hands index+middle extended, tracks normalized tip position → maps to xdotool mousemove. Requires calibration. |
| TOUCHLESS_047 | **Head nod → confirm** | MediaPipe Face Mesh: Y-delta of nose tip landmark across 3 frames → confirm WS event. |
| TOUCHLESS_048 | **Head shake → cancel** | MediaPipe Face Mesh: X-delta oscillation across 4 frames → cancel event. False positives on normal head movement. |
| TOUCHLESS_049 | **Gaze left zone → focus left monitor** | MediaPipe iris tracking: gaze vector points left of center → wmctrl move window to left display. |
| TOUCHLESS_050 | **Gaze right zone → focus right monitor** | Mirror of gaze-left. Requires proper iris model, moderate CPU. |
| TOUCHLESS_051 | **Gaze up → scroll up** | Iris Y-offset above neutral band → continuous xdotool scroll. Needs per-user calibration. |
| TOUCHLESS_052 | **Gaze down → scroll down** | Iris Y-offset below neutral → xdotool scroll down. Paired with gaze-up. |
| TOUCHLESS_053 | **Eye blink left → back** | MediaPipe left-eye EAR drops below 0.2 for 80-200ms → xdotool key alt+Left browser back. |
| TOUCHLESS_054 | **Eye blink right → forward** | Right-eye EAR metric → xdotool key alt+Right. Hard to distinguish from natural blink without calibration. |
| TOUCHLESS_055 | **Double blink → screenshot** | Two rapid blinks <600ms apart → scrot ~/screenshot.png + notify. Timing window is tricky. |
| TOUCHLESS_056 | **Pose: arms raised → fullscreen toggle** | MediaPipe Pose: both wrists above shoulder Y → xdotool key F11. Dramatic but semantically clear. |
| TOUCHLESS_057 | **Pose: lean forward → zoom in** | Face bounding box area increases 15%+ → xdotool key ctrl+plus. Requires stable distance baseline. |
| TOUCHLESS_058 | **Pose: lean back → zoom out** | Face bbox area decreases 15%+ → xdotool key ctrl+minus. Mirror of lean-forward. |
| TOUCHLESS_069 | **Face recognition → user profile switch** | dlib face_recognition lib: identifies user → loads profile-specific keybinds and layouts. CPU-heavy setup. |
| TOUCHLESS_070 | **Face distance monitor → posture alert** | Face bbox width exceeds threshold (too close) → notify-send posture warning. Useful, needs calibration. |
| TOUCHLESS_071 | **Color card detection → macro trigger** | Rear cam detects dominant HSV color of held card → maps to preset action. Fun, moderate precision. |
| TOUCHLESS_072 | **Object presence trigger** | YOLO-nano rear cam: detects specific object (coffee mug, book) → triggers corresponding macro. |
| TOUCHLESS_081 | **Full air mouse pointer via hand tracking** | MediaPipe Hands: index tip 3D coords → normalized to screen → continuous xdotool mousemove. CPU-saturating loop, high jitter. |
| TOUCHLESS_082 | **Air typing keyboard via finger tracking** | 10-finger position tracking → virtual keyboard collision detection. Extreme CPU, sub-50% accuracy realistically. |
| TOUCHLESS_083 | **Lip reading → text input** | MediaPipe Face Mesh lip landmarks → phoneme classifier → text. State-of-the-art models still <80% accuracy. |
| TOUCHLESS_084 | **Emotion detection → adaptive UI** | Facial AU classifier → detects stress/focus/boredom → adjusts HUD theme. High CPU, ethically complex. |
| TOUCHLESS_085 | **Full-body skeleton macro control** | MediaPipe Pose 33-landmark full skeleton → pose library matching. 300ms+ latency, heavy CPU. |
| TOUCHLESS_086 | **Eye-only mouse cursor (no calibration)** | Iris tracking for fine mouse control without calibration is extremely inaccurate without eye tracker hardware. |
| TOUCHLESS_087 | **Real-time OCR of real-world documents** | Rear cam → tesseract OCR in real time → parse structured data. CPU-heavy, highly sensitive to lighting. |
| TOUCHLESS_088 | **Depth estimation from monocular camera** | MiDaS monocular depth → used for gesture depth gating. Requires GPU-class inference, unusable on Tab CPU. |
| TOUCHLESS_089 | **3D room mapping via camera sweep** | ORB-SLAM or similar via rear cam → map room layout. Computationally absurd for this hardware. |
| TOUCHLESS_093 | **Heartbeat detection via front camera** | rPPG (remote PPG) from face color micro-variations. Requires ideal lighting, prone to noise. |
| TOUCHLESS_094 | **Stress level biometric HUD** | Combines rPPG + facial AU + voice tone into stress score. Three unreliable inputs compounded. |
| TOUCHLESS_095 | **Hand geometry biometric unlock** | Rear cam hand silhouette ratio comparison → authentication. Too many false positives for security use. |
| TOUCHLESS_098 | **Crowd density estimation via rear cam** | YOLO person detection → density map. Only useful in unusual HUD deployments, heavy CPU. |
| TOUCHLESS_099 | **Gait recognition for user ID** | MediaPipe Pose gait cycle analysis → person identity from walk pattern. Computationally extreme. |
| TOUCHLESS_100 | **Neural style transfer for UI theming** | Apply artistic style transfer to UI screenshots in real-time. GPU-only, completely impractical on Tab. |
| TOUCHLESS_131 | **Face count → meeting HUD mode** | MediaPipe Face Detection count > 1 → switches HUD to presentation mode (bigger text, hides private info). |
| TOUCHLESS_132 | **Face center tracking → mouse nudge** | Face centroid X normalized to screen width → nudges mouse cursor toward gaze region. Soft attractor. |
| TOUCHLESS_133 | **Hat/cap detection → casual mode** | Person landmark: head region crop → binary hat classifier → switches to casual notification profile. |
| TOUCHLESS_134 | **Micro-expression rapid blink rate monitor** | EAR calculated per-frame → if blink rate drops <8/min for 20min → eye strain alert with break prompt. |
| TOUCHLESS_135 | **Attention zone heatmap → focus score** | Gaze zone sampling over 5 min → generates focus score (% time on screen) → displayed on HUD. |
| TOUCHLESS_136 | **Look-away timer → Pomodoro assist** | Face not detected for 20s during focus session → pauses Pomodoro timer. Keeps honest time tracking. |
| TOUCHLESS_137 | **Head turn left → tab switch left** | MediaPipe Face Mesh yaw angle < -20° → xdotool key ctrl+shift+Tab. Natural browsing gesture. |
| TOUCHLESS_138 | **Head turn right → tab switch right** | Yaw > +20° → xdotool key ctrl+Tab. Paired with head-turn-left. |
| TOUCHLESS_139 | **Eyebrow raise → open spotlight/launcher** | MediaPipe: AU1+AU2 (inner+outer brow raise) → xdotool key super. Launcher trigger without hands. |
| TOUCHLESS_140 | **Sustained frown detection → ambient music trigger** | AU4 corrugator activation sustained 3s → playerctl play ambient playlist. Stress-responsive automation. |
| TOUCHLESS_141 | **Document scan → OCR → paste to host** | Rear cam captures flat document → perspective correct → tesseract → xdotool type result. Powerful scan-to-type. |
| TOUCHLESS_142 | **Plant health monitor** | Rear cam crops plant region → hue histogram → yellowing detection → sends care reminder over WS. |
| TOUCHLESS_143 | **Item counter on surface** | YOLO-nano counts specific objects on desk (books, cups) → logs inventory over time to HUD. |
| TOUCHLESS_144 | **Color temperature of room light → warm/cool alert** | Rear cam white balance estimation → if below 3000K push warm-light alert (good for eyes). |
| TOUCHLESS_145 | **Printout QR code as macro trigger** | Rear cam scans printed QR code at desk → maps QR payload to macro. Physical macro buttons from paper. |
| TOUCHLESS_146 | **ArUco marker detection → AR overlay trigger** | Rear cam detects ArUco marker → sends marker ID + pose over WS → host overlays info on HUD. |
| TOUCHLESS_147 | **Book spine OCR → Goodreads lookup** | Rear cam captures bookshelf → tesseract extracts title → host fetches Goodreads rating via curl. |
| TOUCHLESS_148 | **Whiteboard capture → clean image push** | Rear cam captures whiteboard → adaptive threshold + perspective correct → pushes PNG to host ~/Desktop. |
| TOUCHLESS_149 | **Light on/off detection → automate workflow** | Rear cam luma mean crosses dark/bright threshold → triggers 'lights on' or 'lights off' WS event. |
| TOUCHLESS_150 | **Motion zone alarm via rear cam** | Frame differencing in defined ROI → if object moves in 'restricted zone' → alert WS event. Security mode. |
| TOUCHLESS_171 | **Auto-hide sensitive info on face absence** | MediaPipe: face not detected → HUD blurs/hides password fields and private data. Privacy screen. |
| TOUCHLESS_181 | **Luma-based screen privacy filter** | Front cam detects second face → instantly enables xrandr privacy mode (reduced brightness + angle simulation). |
| TOUCHLESS_189 | **Face-spoofing liveness check** | Front cam: requires blink + head turn before unlocking. Liveness = anti-photo-spoof. |
| TOUCHLESS_195 | **Screen content categorizer → break enforcement** | scrot thumbnail every 5min → host-side tflite category inference → if 'social media' label → 10min block. |
| TOUCHLESS_196 | **Periodic posture photo + log** | Front cam captures frame every 30min → saves to ~/posture_log/ for manual review. Low-tech, effective. |
| TOUCHLESS_197 | **Desk temperature estimate from camera drift** | Long-exposure luma drift in front cam → correlates with ambient temp change. Highly experimental proxy. |

## Module: Voice

| ID | Feature Name | Description |
|---|---|---|
| TOUCHLESS_026 | **Voice keyword → run script** | Browser SpeechRecognition API detects keyword (e.g. 'synapse run') → sends WS command. No offline model needed. |
| TOUCHLESS_027 | **Voice keyword → mute mic** | 'Synapse mute' → amixer set Capture nocap. Instant via SpeechRecognition. |
| TOUCHLESS_059 | **Voice command: open named app** | Whisper tiny model offline inference → parsed command → exec. 400-800ms per utterance on host CPU. |
| TOUCHLESS_060 | **Voice command: navigate URL** | Whisper parses 'go to [site]' → constructs URL → xdg-open. Needs good transcription accuracy. |
| TOUCHLESS_061 | **Voice dictation mode** | Whisper streaming → accumulated buffer → xdotool type result. Latency makes real-time use hard. |
| TOUCHLESS_062 | **Voice command: window layout** | 'Synapse tile left' → wmctrl reposition current window. Requires reliable parse. |
| TOUCHLESS_063 | **Voice trigger: run bash script by name** | Whisper transcribes script name → server maps to /scripts/ dir → executes. Powerful but needs lexicon. |
| TOUCHLESS_090 | **Speaker diarization → per-person commands** | Real-time speaker ID + command routing. pyannote.audio requires significant RAM and compute. |
| TOUCHLESS_091 | **Continuous emotion from voice tone** | Prosody analysis every 500ms → maps to mood → adapts interface. Latency + accuracy make it impractical. |
| TOUCHLESS_161 | **TTS readback of active window title** | wmctrl active title → Piper TTS → aplay. Auditory feedback when window changes. |
| TOUCHLESS_162 | **TTS clock announcement every hour** | Cron job → date string → Piper TTS → aplay. Time awareness without looking. |
| TOUCHLESS_163 | **Voice macro recording mode** | Say 'synapse record' → every subsequent voice command is stored as a named macro sequence. Meta-command. |
| TOUCHLESS_164 | **Voice-controlled SSH session** | 'Synapse ssh pi' → Whisper parses host name → xterm -e ssh [host] launched on Ubuntu. Hands-free remote. |
| TOUCHLESS_165 | **Voice-triggered file search** | 'Synapse find invoice' → locate invoice → results JSON over WS → HUD file list. Instant lookup. |
| TOUCHLESS_166 | **Voice note → append to daily journal** | Whisper transcription → appended with timestamp to ~/journal/YYYY-MM-DD.md. Frictionless logging. |
| TOUCHLESS_167 | **Hotword confidence threshold tuning HUD** | HUD slider (sent via hardware buttons) adjusts SpeechRecognition confidence threshold live. Self-calibrating. |
| TOUCHLESS_168 | **Per-app voice command profiles** | wmctrl active window → switches Whisper command grammar → 'synapse compile' in VS Code vs 'synapse send' in email. |
| TOUCHLESS_169 | **Voice to shell pipeline** | 'Synapse run: ls -la /home' → Whisper → Electron executes trusted shell command → result displayed on HUD. |
| TOUCHLESS_170 | **Multilingual hotword switching** | Detect spoken language via Whisper language ID → switches interface language + TTS voice. Complex config. |

