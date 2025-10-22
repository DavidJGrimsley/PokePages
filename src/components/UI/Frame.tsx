import React, { useState, useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import Colors from '~/constants/style/colors';
import { useColorScheme } from '~/hooks/useColorScheme';

// Import WebView directly but only for non-web platforms
// This ensures it's only included in the bundle for platforms that support it
import { WebView as RNWebView } from 'react-native-webview';

export interface FrameProps {
  src: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  style?: any;
  className?: string;
  allowScroll?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  allowFullScreen?: boolean;
  allow?: string; // iframe allow attribute for permissions
  referrerPolicy?: React.HTMLAttributeReferrerPolicy; // iframe referrer policy
  id?: string;
  pointerEvents?: 'auto' | 'none';
  opacity?: number;
  serverUrl?: string; // Optional server base URL for local files
}

export const Frame: React.FC<FrameProps> = ({
  src,
  title = 'Frame Content',
  width = '100%',
  height = 600,
  style,
  className,
  allowScroll = true,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onLoad,
  onError,
  allowFullScreen = true,
  allow,
  referrerPolicy,
  id,
  pointerEvents = 'auto',
  opacity = 1,
  serverUrl,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if this is a local file path
  const isLocalFile = src.startsWith('/') && !src.startsWith('//');
  const isMobile = Platform.OS !== 'web';
  
  // Resolve the actual URL to use
  const resolvedSrc = (() => {
    if (isLocalFile && isMobile && serverUrl) {
      // Convert local path to server URL for mobile
      const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
      const path = src.startsWith('/') ? src : `/${src}`;
      const finalUrl = `${baseUrl}${path}`;
      console.log(`Frame: Converting local path "${src}" to server URL "${finalUrl}"`);
      return finalUrl;
    }
    return src;
  })();

  // Reset loading and error states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // Common container style
  const containerStyle = [
    {
      width: typeof width === 'string' ? width : width,
      height: typeof height === 'string' ? height : height,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      ...style,
    },
  ];

  // Handle load completion
  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle errors
  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
    console.error('Frame loading error:', error);
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/10 z-10">
      <Text className="text-base font-medium" style={{ color: Colors[colorScheme].text }}>
        Loading...
      </Text>
    </View>
  );

  // Error indicator component
  const ErrorIndicator = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-red-500/10 z-10 p-5">
      <Text className="text-base font-medium text-center mb-2" style={{ color: Colors[colorScheme].text }}>
        Failed to load content
      </Text>
      <Text className="text-xs text-center opacity-70" style={{ color: Colors[colorScheme].text }}>
        {src}
      </Text>
    </View>
  );

  // Mobile fallback for local content
  const MobileFallback = () => (
    <View className="flex-1 justify-center items-center bg-black/5 p-5">
      <Text className="text-2xl font-semibold text-center mb-2" style={{ color: Colors[colorScheme].text }}>
        Content Available on Web
      </Text>
      <Text className="text-base text-center mb-3 opacity-80" style={{ color: Colors[colorScheme].text }}>
        This content is only available when running on web platform
      </Text>
      <Text className="text-xs text-center opacity-60 font-mono" style={{ color: Colors[colorScheme].text }}>
        Open in a web browser to view
      </Text>
    </View>
  );

  if (Platform.OS === 'web') {
    // Web platform - use iframe
    return (
      <div
        className={className}
        style={containerStyle[0]}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <iframe
          title={title}
          src={resolvedSrc}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 'inherit',
            overflow: 'hidden',
            pointerEvents,
            opacity,
            transition: 'opacity 0.2s ease',
          }}
          allowFullScreen={allowFullScreen}
          allow={allow}
          referrerPolicy={referrerPolicy}
          id={id}
          onLoad={handleLoadEnd}
          onError={handleError}
        />
        {isLoading && <LoadingIndicator />}
        {hasError && <ErrorIndicator />}
      </div>
    );
  } else {
    // Mobile platforms - check if it's a local file without server URL
    if (isLocalFile && isMobile && !serverUrl) {
      return (
        <View style={containerStyle} className={className}>
          <MobileFallback />
        </View>
      );
    }

    // Mobile platforms - use WebView with simplified configuration
    return (
      <View style={containerStyle} className={className}>
        <RNWebView
          source={{ 
            uri: resolvedSrc,
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            }
          }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          cacheEnabled={false}
          onLoadStart={() => setIsLoading(true)}
          onLoad={handleLoadEnd}
          onError={(e) => {
            console.error("WebView error:", e.nativeEvent);
            handleError(e.nativeEvent);
          }}
          onHttpError={(e) => {
            console.error("WebView HTTP error:", e.nativeEvent);
            handleError(e.nativeEvent);
          }}
        />
        {isLoading && <LoadingIndicator />}
        {hasError && <ErrorIndicator />}
      </View>
    );
  }
};

// Function to request fullscreen (web only)
export const requestFullscreen = (frameId: string) => {
  if (Platform.OS === 'web') {
    const element = document.getElementById(frameId);
    if (element && element.requestFullscreen) {
      element.requestFullscreen();
    }
  } else {
    console.warn('Fullscreen is only supported on web platform');
  }
};