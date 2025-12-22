import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface IframeEmbedProps {
  src: string;
}

/**
 * Platform-conditional component for embedding web content
 * Uses iframe on web platform and WebView on native platforms
 */
export const IframeEmbed: React.FC<IframeEmbedProps> = ({ src }) => {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <iframe
        src={src}
        style={styles.webview}
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
      >
        Loading…
      </iframe>
    );
  }

  return (
    <WebView
      source={{ uri: src }}
      style={styles.webview}
      startInLoadingState={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    height: '85%' as any,
    width: '100%',
    border: 'none',
  },
});
