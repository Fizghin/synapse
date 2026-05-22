import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider } from './ThemeProvider';
import TouchlessHUD from './sensorClient';
import { activateKeepAwakeAsync } from 'expo-keep-awake';

export default function App() {
  useEffect(() => {
    (async () => {
      await activateKeepAwakeAsync();
    })();
  }, []);

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <TouchlessHUD />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
