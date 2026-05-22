// SYNAPSE_OS Google Stitch HUD Client
// --------------------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { Canvas, Rect, LinearGradient, vec, Blur } from '@shopify/react-native-skia';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeProvider';
import features from './synapse_500_features.json';

const { width: SW, height: SH } = Dimensions.get('window');

// ---------- Scrambler Text Component ----------
const ScramblerText = ({ text, style }) => {
  const [display, setDisplay] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,./<>?';
  useEffect(() => {
    let iter = 0;
    const interval = setInterval(() => {
      setDisplay(prev =>
        text
          .split('')
          .map((c, i) => (i < iter ? c : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      );
      if (iter >= text.length) clearInterval(interval);
      iter += 1;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  return <Text style={style}>{display}</Text>;
};

const getIconEmoji = (name) => {
  const map = {
    volume: '🔊',
    settings: '⚙️',
    mic: '🎙️',
    play: '▶️',
    crosshair: '🎯',
    lock: '🔒',
    wifi: '📡',
    battery: '🔋',
    power: '🔌',
    brightness: '☀️',
    display: '🖥️',
    music: '🎵',
    keyboard: '⌨️',
    mouse: '🖱️',
    search: '🔍',
    camera: '📷',
    folder: '📁',
    file: '📄',
    terminal: '💻',
    alert: '⚠️',
    info: 'ℹ️',
    globe: '🌐',
    cpu: '🧠',
    ram: '💾',
    ping: '📶',
    bluetooth: '🌀'
  };
  return map[name] || name || '⚡';
};

// ---------- Accordion Module ----------
const AccordionModule = ({ moduleName, features, onExecute, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const toggleAccordion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextState = !expanded;
    setExpanded(nextState);
    heightValue.value = withTiming(nextState ? 1 : 0, { duration: 250, easing: Easing.inOut(Easing.ease) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.value * 8000,
    opacity: heightValue.value,
    overflow: 'hidden',
    marginTop: heightValue.value * 8
  }));

  return (
    <View style={[styles.moduleSection, { borderColor: theme.border, borderRadius: theme.borderRadius }]}>
      <TouchableOpacity 
        style={[styles.accordionHeader, { backgroundColor: expanded ? theme.accent + '15' : 'transparent' }]} 
        onPress={toggleAccordion}
      >
        <Text style={[styles.moduleHeader, { color: theme.text }]}>
          {moduleName} <Text style={{ color: theme.accent, fontSize: 13 }}>({features.length})</Text>
        </Text>
        <Text style={{ color: theme.accent, fontWeight: 'bold' }}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        {features.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.featureItem, { borderBottomColor: theme.border + '30' }]} 
            onPress={() => onExecute(item)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.featureIconContainer, { backgroundColor: theme.accent + '10' }]}>
                <Text style={{ color: theme.accent, fontSize: 16 }}>{getIconEmoji(item.ui_icon)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.featureName, { color: theme.text }]}>{item.name}</Text>
                <Text style={styles.featureDesc}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

// ---------- Main Component ----------
export default function TouchlessHUD() {
  const { themeName, theme, setTheme } = useTheme();
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [detectedTransport, setDetectedTransport] = useState('DISCONNECTED'); // 'USB', 'WIFI', 'DISCONNECTED'
  const [hostIp, setHostIp] = useState('192.168.1.99');
  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ps4State, setPs4State] = useState('STANDBY');
  const [scrcpyState, setScrcpyState] = useState('IDLE');
  const [deployToast, setDeployToast] = useState(null);

  const wsUsbRef = useRef(null);
  const wsWifiRef = useRef(null);
  const wsActiveRef = useRef(null);
  const reconnectTimer = useRef(null);

  const pulse = useSharedValue(1);
  const bgX = useSharedValue(0);
  const bgY = useSharedValue(0);
  const shake = useSharedValue(0);
  const spin = useSharedValue(0);

  // Load host IP
  useEffect(() => {
    (async () => {
      let savedIp = null;
      try {
        savedIp = await AsyncStorage.getItem('synapse_host_ip');
      } catch (e) {}
      
      let defaultIp = '192.168.1.99';
      try {
        const hostConfig = require('./host_ip.json');
        if (hostConfig && hostConfig.hostIp) {
          defaultIp = hostConfig.hostIp;
        }
      } catch (e) {}

      const activeIp = savedIp || defaultIp;
      setHostIp(activeIp);
      connect(activeIp);
    })();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsUsbRef.current) try { wsUsbRef.current.close(); } catch(e){}
      if (wsWifiRef.current) try { wsWifiRef.current.close(); } catch(e){}
    };
  }, []);

  const connect = (targetIp) => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    
    // Close existing
    if (wsUsbRef.current) { try { wsUsbRef.current.close(); } catch(e){} wsUsbRef.current = null; }
    if (wsWifiRef.current) { try { wsWifiRef.current.close(); } catch(e){} wsWifiRef.current = null; }
    wsActiveRef.current = null;
    
    setWsStatus('CONNECTING');
    setDetectedTransport('DISCONNECTED');

    let resolved = false;

    const setupSocket = (url, transportName) => {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        if (resolved) {
          ws.close();
          return;
        }
        resolved = true;
        wsActiveRef.current = ws;
        setWsStatus('CONNECTED');
        setDetectedTransport(transportName);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        pulse.value = withRepeat(withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);

        // Close inactive socket
        if (transportName === 'USB' && wsWifiRef.current) {
          try { wsWifiRef.current.close(); } catch(e){}
          wsWifiRef.current = null;
        } else if (transportName === 'WIFI' && wsUsbRef.current) {
          try { wsUsbRef.current.close(); } catch(e){}
          wsUsbRef.current = null;
        }
      };

      ws.onmessage = (e) => {
        if (wsActiveRef.current !== ws) return;
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'ACK_OK' && data.id === 'PS4_WAKE') setPs4State('ON');
          if (data.type === 'STREAM_ACTIVE') {
            setScrcpyState('SUCCESS');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          if (data.type === 'STREAM_FAILED') {
            setScrcpyState('FAILURE');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            shake.value = withSequence(withTiming(12, { duration: 50 }), withTiming(-12, { duration: 50 }), withTiming(0, { duration: 50 }));
          }
          if (data.type === 'DEPLOY_COMPLETE') {
            setDeployToast({ success: true, transport: data.transport || 'usb' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => setDeployToast(null), 5000);
          }
        } catch (_) {}
      };

      ws.onclose = () => {
        if (wsActiveRef.current === ws) {
          wsActiveRef.current = null;
          setWsStatus('DISCONNECTED');
          setDetectedTransport('DISCONNECTED');
          pulse.value = 1;
          
          if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
          reconnectTimer.current = setTimeout(() => connect(targetIp), 3000);
        }
      };

      ws.onerror = () => {};

      return ws;
    };

    // Try USB
    try {
      wsUsbRef.current = setupSocket('ws://127.0.0.1:8085', 'USB');
    } catch(e) {}

    // Try WiFi
    if (targetIp && targetIp !== '127.0.0.1') {
      try {
        wsWifiRef.current = setupSocket(`ws://${targetIp}:8085`, 'WIFI');
      } catch(e) {}
    }
  };

  useEffect(() => {
    Gyroscope.setUpdateInterval(60);
    const sub = Gyroscope.addListener(g => {
      bgX.value = withSpring(g.y * 20);
      bgY.value = withSpring(g.x * 20);
      if (Math.abs(g.x) > 1.4 || Math.abs(g.y) > 1.4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });
    return () => sub.remove();
  }, []);

  const send = payload => {
    if (wsActiveRef.current && wsActiveRef.current.readyState === WebSocket.OPEN) {
      wsActiveRef.current.send(JSON.stringify(payload));
    }
  };

  const breathingStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const parallaxStyle = useAnimatedStyle(() => ({ transform: [{ translateX: bgX.value }, { translateY: bgY.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const handlePs4Wake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPs4State('WAKING');
    spin.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false);
    send({ type: 'PS4_WAKE' });
  };

  const handleSendKey = key => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    send({ type: 'PS4_SEND_KEY', key });
  };

  const handleLaunchGame = id => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    send({ type: 'PS4_LAUNCH_GAME', titleId: id });
  };

  const handleScrcpy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScrcpyState('CONNECTING');
    send({ type: 'START_SCRCPY' });
  };

  const executeFeature = feature => {
    const hapticString = feature.haptic_profile || 'ImpactFeedbackStyle.Light';
    if (hapticString.includes('Success')) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (hapticString.includes('Error')) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (hapticString.includes('Warning')) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (hapticString.includes('Heavy')) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else if (hapticString.includes('Medium')) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    send({ type: 'feature', feature: feature.id, payload: feature.ws_payload });
  };

  const cycleTheme = () => {
    const themeNames = Object.keys(require('./ThemeProvider').themes);
    const idx = themeNames.indexOf(themeName);
    const next = themeNames[(idx + 1) % themeNames.length];
    setTheme(next);
    AsyncStorage.setItem('synapse_theme', next);
  };

  // Group and filter features
  const modules = {};
  features.forEach(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.module.toLowerCase().includes(search.toLowerCase())) return;
    if (!modules[f.module]) modules[f.module] = [];
    modules[f.module].push(f);
  });
  const moduleKeys = Object.keys(modules).sort();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Dynamic Skia Background */}
      <Animated.View style={[StyleSheet.absoluteFill, parallaxStyle, { opacity: 0.4 }]}>
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={SW} height={SH}>
            <LinearGradient start={vec(0, 0)} end={vec(SW, SH)} colors={[theme.bg, theme.accent + '25', theme.bg]} />
            <Blur blur={40} />
          </Rect>
        </Canvas>
      </Animated.View>

      {/* Top Navbar */}
      <View style={styles.topBar}>
        <TouchableOpacity onLongPress={cycleTheme}>
          <ScramblerText text="SYNAPSE_OS" style={[styles.title, { color: theme.text }]} />
        </TouchableOpacity>
        
        {/* Dynamic Transport Connection Chip */}
        <TouchableOpacity 
          style={[
            styles.connectionChip, 
            { 
              backgroundColor: wsStatus === 'CONNECTED' 
                ? (detectedTransport === 'USB' ? '#10B98125' : '#3B82F625') 
                : '#EF444425',
              borderColor: wsStatus === 'CONNECTED' 
                ? (detectedTransport === 'USB' ? '#10B981' : '#3B82F6') 
                : '#EF4444'
            }
          ]} 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSettingsOpen(true); }}
        >
          <Animated.View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: wsStatus === 'CONNECTED' 
                  ? (detectedTransport === 'USB' ? '#10B981' : '#3B82F6') 
                  : '#EF4444' 
              },
              breathingStyle
            ]} 
          />
          <Text style={[styles.connectionChipText, { color: theme.text }]}>
            {wsStatus === 'CONNECTED' ? `${detectedTransport} LINK` : 'OFFLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sliding Deploy Complete Toast */}
      {deployToast && (
        <Animated.View entering={FadeInUp} style={[styles.deployToast, { backgroundColor: theme.accent, shadowColor: theme.accent }]}>
          <Text style={styles.deployToastTitle}>🚀 DEPLOY SYNCHRONIZED</Text>
          <Text style={styles.deployToastDesc}>APK updated successfully over {deployToast.transport.toUpperCase()}</Text>
        </Animated.View>
      )}

      {/* Body Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* PS4 remote Deck */}
        <Animated.View 
          entering={FadeInUp.delay(100)} 
          style={[styles.moduleCard, { borderColor: theme.border, backgroundColor: theme.border + '15', borderRadius: theme.borderRadius }]}
        >
          <Text style={[styles.moduleTitle, { color: theme.text }]}>GAMING MATRIX (PS4 NODE)</Text>
          
          {ps4State === 'STANDBY' && (
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.accent }]} onPress={handlePs4Wake}>
              <Text style={styles.buttonText}>WAKE CONSOLE</Text>
            </TouchableOpacity>
          )}

          {ps4State === 'WAKING' && (
            <Animated.View style={[styles.loadingRing, spinStyle, { borderColor: theme.accent, borderTopColor: 'transparent' }]} />
          )}

          {ps4State === 'ON' && (
            <View style={styles.phantomController}>
              <View style={styles.dpad}>
                <TouchableOpacity style={[styles.dpadBtn, { borderColor: theme.accent }]} onPress={() => handleSendKey('up')}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>▲</Text></TouchableOpacity>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 140 }}>
                  <TouchableOpacity style={[styles.dpadBtn, { borderColor: theme.accent }]} onPress={() => handleSendKey('left')}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>◀</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.dpadBtn, { borderColor: theme.accent }]} onPress={() => handleSendKey('right')}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>▶</Text></TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.dpadBtn, { borderColor: theme.accent }]} onPress={() => handleSendKey('down')}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>▼</Text></TouchableOpacity>
              </View>
              <View style={styles.faceButtons}>
                <TouchableOpacity style={[styles.faceBtn, { backgroundColor: theme.accent }]} onPress={() => handleSendKey('enter')}><Text style={{ color: '#fff', fontWeight: 'bold' }}>✖</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.faceBtn, { backgroundColor: theme.border + '60' }]} onPress={() => handleSendKey('back')}><Text style={{ color: theme.text, fontWeight: 'bold' }}>●</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.faceBtn, { borderColor: theme.accent, borderWidth: 1 }]} onPress={() => handleSendKey('ps')}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>PS</Text></TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={[styles.sectionSubTitle, { color: theme.text }]}>QUICK LAUNCH GRID</Text>
          <View style={styles.grid}>
            {['CUSA00001', 'CUSA00002', 'CUSA00003', 'CUSA00004'].map((id, i) => (
              <TouchableOpacity 
                key={id} 
                style={[styles.gridBtn, { backgroundColor: theme.border + '20', borderColor: theme.border }]} 
                onPress={() => handleLaunchGame(id)}
              >
                <Text style={{ color: theme.text }}>GAME {i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Telemetry card */}
        <Animated.View 
          entering={FadeInUp.delay(200)} 
          style={[styles.moduleCard, { borderColor: theme.border, backgroundColor: theme.border + '15', borderRadius: theme.borderRadius }]}
        >
          <Text style={[styles.moduleTitle, { color: theme.text }]}>VEHICLE / HARDWARE TELEMETRY</Text>
          <Animated.View style={shakeStyle}>
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                { 
                  backgroundColor: scrcpyState === 'FAILURE' ? '#EF4444' : scrcpyState === 'SUCCESS' ? '#10B981' : theme.accent 
                }
              ]} 
              onPress={handleScrcpy}
            >
              <Text style={styles.buttonText}>
                {scrcpyState === 'IDLE' ? 'ESTABLISH VISUAL LINK' :
                 scrcpyState === 'CONNECTING' ? 'PINGING NODE...' :
                 scrcpyState === 'SUCCESS' ? 'LINK ACTIVE – CHECK HOST' :
                 'NODE OFFLINE'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* 500-Feature Command center */}
        <Animated.View 
          entering={FadeInUp.delay(300)} 
          style={[styles.moduleCard, { borderColor: theme.border, backgroundColor: theme.border + '15', borderRadius: theme.borderRadius }]}
        >
          <Text style={[styles.moduleTitle, { color: theme.text }]}>ALL SUBSYSTEM FEATURES</Text>
          
          <TextInput 
            style={[styles.searchInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]} 
            placeholder="⌕ Search 500 Subsystems..." 
            placeholderTextColor="#888"
            value={search} 
            onChangeText={setSearch} 
          />

          <View style={styles.featureGridContainer}>
            {moduleKeys.map(mod => (
              <AccordionModule key={mod} moduleName={mod} features={modules[mod]} onExecute={executeFeature} theme={theme} />
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      {/* Sidebar settings menu */}
      {settingsOpen && (
        <View style={styles.modalOverlay}>
          <Animated.View entering={SlideInDown} style={[styles.settingsDrawer, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.text }]}>SETTINGS</Text>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSettingsOpen(false); }}>
                <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 16 }}>CLOSE [X]</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>HOST PC IP ADDRESS</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.border + '10' }]} 
              value={hostIp} 
              onChangeText={setHostIp} 
              onSubmitEditing={() => { 
                AsyncStorage.setItem('synapse_host_ip', hostIp); 
                connect(hostIp); 
                setSettingsOpen(false);
              }} 
            />
            <Text style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
              Auto-senses USB reverse tunnel on localhost and WiFi connection on this IP.
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 50, overflow: 'hidden' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, zIndex: 10 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  connectionChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  connectionChipText: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  content: { paddingBottom: 100 },
  moduleCard: { borderWidth: 1, padding: 24, marginBottom: 20, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  moduleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20, letterSpacing: 0.5 },
  sectionSubTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, marginTop: 24 },
  primaryButton: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  buttonText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  loadingRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 4, alignSelf: 'center', margin: 20 },
  phantomController: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 16 },
  dpad: { alignItems: 'center', width: 140 },
  dpadBtn: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', margin: 2, borderRadius: 12 },
  faceButtons: { flexDirection: 'row', flexWrap: 'wrap', width: 120, justifyContent: 'center' },
  faceBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', margin: 6, borderRadius: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridBtn: { width: '48%', borderWidth: 1, paddingVertical: 16, alignItems: 'center', marginBottom: 12, borderRadius: 12 },
  
  // Deploy Toast Overlay
  deployToast: { 
    position: 'absolute', 
    top: 60, 
    left: 24, 
    right: 24, 
    padding: 16, 
    borderRadius: 16, 
    zIndex: 999, 
    alignItems: 'center', 
    shadowOpacity: 0.2, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 6 } 
  },
  deployToastTitle: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  deployToastDesc: { color: '#ffffffcc', fontSize: 12, fontWeight: '500' },

  // Search input
  searchInput: { borderWidth: 1, paddingVertical: 14, paddingHorizontal: 18, fontSize: 15, marginBottom: 16, borderRadius: 24 },

  // Accordion lists
  featureGridContainer: { marginTop: 8 },
  moduleSection: { borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, alignItems: 'center' },
  moduleHeader: { fontSize: 15, fontWeight: '700' },
  featureItem: { paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1 },
  featureIconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  featureName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  featureDesc: { color: '#64748B', fontSize: 12 },

  // Modal Settings Drawer
  modalOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000070', zIndex: 100 },
  settingsDrawer: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, padding: 24, paddingBottom: 40 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  drawerTitle: { fontSize: 18, fontWeight: '800' },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, padding: 14, fontSize: 15, borderRadius: 12 },
});
