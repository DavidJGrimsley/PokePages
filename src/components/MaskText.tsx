import React from 'react';
import { theme } from '@/constants/style/theme';
import MaskedView from '@react-native-masked-view/masked-view';
import { StyleSheet, Text, View } from 'react-native';

export function MaskText({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <MaskedView
        style={styles.maskedView}
        maskElement={
          <View style={styles.maskContainer}>
            <Text style={[theme.typography.display, styles.maskText]}>{text}</Text>
          </View>
        }
      >
        {/* Content shown through the text mask: three colored panels side-by-side */}
        <View style={styles.row}>
          <View style={[styles.box, { backgroundColor: '#f00' }]} />
          <View style={[styles.box, { backgroundColor: '#0f0' }]} />
          <View style={[styles.box, { backgroundColor: '#00f' }]} />
        </View>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Give the masked example an explicit height so it renders predictably
    height: 140,
    width: '100%',
  },
  maskedView: {
    flex: 1,
    flexDirection: 'row',
  },
  maskContainer: {
    // Transparent background because mask is based on alpha channel
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskText: {
    textAlign: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  box: {
    flex: 1,
  },
});

