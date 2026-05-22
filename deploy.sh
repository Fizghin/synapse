#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# SYNAPSE_OS — CI/CD Auto-Deploy Pipeline v5.1
# Smart USB/WiFi detection. Builds, pushes, and launches the client APK.
# Target: Samsung Galaxy Tab SM-T515
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── CONFIGURATION ───────────────────────────────────────────────────────────
TABLET_IP="192.168.1.99"
ADB_PORT="5555"
CLIENT_DIR="$(cd "$(dirname "$0")/client" && pwd)"
APK_PATH="$CLIENT_DIR/android/app/build/outputs/apk/release/app-release.apk"
PACKAGE_NAME="com.synapse.client"
OLD_PACKAGE="com.anonymous.synapsetablet"

# ─── COLORS ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${CYAN}[SYNAPSE]${NC} $1"; }
ok()   { echo -e "${GREEN}[  OK  ]${NC} $1"; }
warn() { echo -e "${YELLOW}[ WARN ]${NC} $1"; }
fail() { echo -e "${RED}[FAILED]${NC} $1"; exit 1; }

# ─── TRANSPORT STATE ─────────────────────────────────────────────────────────
ADB_TRANSPORT=""   # 'usb' or 'wifi'
ADB_SERIAL=""      # device serial or ip:port
DEVICE=""          # final -s argument

header() {
    echo ""
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║     SYNAPSE_OS — DEPLOY PIPELINE v5.1           ║${NC}"
    echo -e "${BOLD}${CYAN}║     Target: SM-T515 (USB/WiFi Auto-Detect)      ║${NC}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
}

# ─── PREFLIGHT CHECKS ───────────────────────────────────────────────────────
preflight() {
    log "Running preflight checks..."
    command -v adb >/dev/null 2>&1 || fail "adb not found. Install android-tools."
    ok "Preflight passed — adb present."
}

# ─── SMART ADB DETECTION (USB first, WiFi fallback) ─────────────────────────
detect_device() {
    log "Detecting tablet connection..."

    # Check for USB-connected device
    local USB_LINE
    USB_LINE=$(adb devices -l 2>/dev/null | grep -E "device\s+" | grep "usb:" | head -1 || true)
    if [ -n "$USB_LINE" ]; then
        ADB_SERIAL=$(echo "$USB_LINE" | awk '{print $1}')
        ADB_TRANSPORT="usb"
        DEVICE="$ADB_SERIAL"
        ok "USB device detected: $ADB_SERIAL"
        return 0
    fi

    # Check for existing WiFi connection
    local WIFI_LINE
    WIFI_LINE=$(adb devices -l 2>/dev/null | grep -E "device\s+" | grep ":5555" | head -1 || true)
    if [ -n "$WIFI_LINE" ]; then
        ADB_SERIAL=$(echo "$WIFI_LINE" | awk '{print $1}')
        ADB_TRANSPORT="wifi"
        DEVICE="$ADB_SERIAL"
        ok "WiFi device already connected: $ADB_SERIAL"
        return 0
    fi

    # Try WiFi connect
    log "No device found. Attempting WiFi ADB to $TABLET_IP:$ADB_PORT..."
    adb disconnect "$TABLET_IP:$ADB_PORT" 2>/dev/null || true

    local RETRY=0 MAX_RETRIES=3
    while [ $RETRY -lt $MAX_RETRIES ]; do
        if adb connect "$TABLET_IP:$ADB_PORT" 2>&1 | grep -q "connected"; then
            ADB_SERIAL="$TABLET_IP:$ADB_PORT"
            ADB_TRANSPORT="wifi"
            DEVICE="$ADB_SERIAL"
            ok "WiFi ADB connected to $ADB_SERIAL"
            break
        fi
        RETRY=$((RETRY + 1))
        warn "WiFi attempt $RETRY/$MAX_RETRIES failed. Retrying in 2s..."
        sleep 2
    done

    if [ -z "$ADB_TRANSPORT" ]; then
        fail "No tablet detected via USB or WiFi after $MAX_RETRIES attempts."
    fi

    # Detect host IP and write to client/host_ip.json
    local HOST_WIFI_IP
    HOST_WIFI_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' || hostname -I | awk '{print $1}')
    HOST_WIFI_IP=$(echo "$HOST_WIFI_IP" | xargs)
    log "Host LAN IP detected: $HOST_WIFI_IP"
    echo "{\"hostIp\":\"$HOST_WIFI_IP\"}" > "$CLIENT_DIR/host_ip.json"
}

# ─── STAGE 1: BUILD APK (skip if already built) ─────────────────────────────
build_apk() {
    if [ "${FORCE_REBUILD:-false}" = false ] && [ -f "$APK_PATH" ]; then
        local AGE_HOURS
        AGE_HOURS=$(( ($(date +%s) - $(stat -c %Y "$APK_PATH")) / 3600 ))
        if [ "$AGE_HOURS" -lt 24 ]; then
            local SIZE
            SIZE=$(du -h "$APK_PATH" | cut -f1)
            ok "Using existing APK ($SIZE, ${AGE_HOURS}h old). Use --rebuild to force."
            return 0
        fi
    fi

    log "Stage 1/4: Building release APK..."
    cd "$CLIENT_DIR/android" || fail "Cannot enter android directory."
    chmod +x ./gradlew 2>/dev/null || true
    ./gradlew clean 2>/dev/null || warn "Clean failed (non-fatal)."

    if ./gradlew assembleRelease --no-daemon --console=plain; then
        ok "APK built successfully."
    else
        fail "Gradle assembleRelease FAILED."
    fi

    cd - >/dev/null

    if [ ! -f "$APK_PATH" ]; then
        APK_PATH="$CLIENT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
        [ -f "$APK_PATH" ] || fail "APK not found."
    fi
    local SIZE
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    ok "APK size: $SIZE"
}

# ─── STAGE 2: CLEAN OLD PACKAGES ────────────────────────────────────────────
clean_old() {
    log "Stage 2/4: Cleaning stale packages..."
    adb -s "$DEVICE" uninstall "$OLD_PACKAGE" 2>/dev/null && ok "Removed old $OLD_PACKAGE" || true
}

# ─── STAGE 3: INSTALL APK ───────────────────────────────────────────────────
install_apk() {
    log "Stage 3/4: Installing APK on tablet via ${ADB_TRANSPORT^^}..."
    if adb -s "$DEVICE" install -r -g "$APK_PATH"; then
        ok "APK installed on $DEVICE"
    else
        fail "APK installation FAILED."
    fi
}

# ─── STAGE 4: LAUNCH APP ────────────────────────────────────────────────────
launch_app() {
    log "Stage 4/4: Launching SYNAPSE client..."
    adb -s "$DEVICE" shell am force-stop "$PACKAGE_NAME" 2>/dev/null || true

    if adb -s "$DEVICE" shell monkey -p "$PACKAGE_NAME" -c android.intent.category.LAUNCHER 1 2>/dev/null; then
        ok "SYNAPSE client is LIVE on tablet."
    else
        adb -s "$DEVICE" shell am start -n "$PACKAGE_NAME/.MainActivity" 2>/dev/null || warn "Auto-launch failed."
    fi

    # Keep screen awake
    adb -s "$DEVICE" shell svc power stayon true 2>/dev/null || true
    adb -s "$DEVICE" shell settings put system screen_off_timeout 2147483647 2>/dev/null || true
    ok "Screen stay-awake enabled."
}

# ─── NOTIFICATION ────────────────────────────────────────────────────────────
notify_complete() {
    local ICON="/home/tia/synapse/icon.png"
    if command -v notify-send >/dev/null 2>&1; then
        notify-send -i "$ICON" "SYNAPSE Deploy Complete" "Client running on SM-T515 via ${ADB_TRANSPORT^^}" 2>/dev/null || true
    fi
    # Send deploy-complete event to Electron webhook server
    log "Notifying Electron server of deployment completion..."
    curl -X POST -H "Content-Type: application/json" -d "{\"transport\":\"${ADB_TRANSPORT}\"}" http://localhost:9090/deploy-complete >/dev/null 2>&1 || true
    # Completion sound
    if command -v paplay >/dev/null 2>&1; then
        paplay /usr/share/sounds/freedesktop/stereo/complete.oga 2>/dev/null || true
    fi
}

# ─── MAIN ────────────────────────────────────────────────────────────────────
main() {
    header
    preflight
    detect_device

    FORCE_REBUILD=false
    if [[ "${1:-}" == "--rebuild" ]]; then
        FORCE_REBUILD=true
    fi

    build_apk
    clean_old
    install_apk
    launch_app
    notify_complete

    echo ""
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║  ✓ DEPLOYMENT COMPLETE                          ║${NC}"
    echo -e "${BOLD}${GREEN}║  Transport: ${ADB_TRANSPORT^^} | Device: ${DEVICE}${NC}"
    echo -e "${BOLD}${GREEN}║  SYNAPSE client running on SM-T515              ║${NC}"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
}

main "$@"
