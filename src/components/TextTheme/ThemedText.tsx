import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '~/hooks/useThemeColor';
import { cn } from '~/utils/cn';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'display' | 'displayOutlined' | 'displayOutlinedMobile' | 'displayOutlinedReverse' | 'logo' | 'header' | 'subheader' | 'cta' | 'copy' | 'copyBold' | 'mono' | 'monoBold';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps & { className?: string }) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Define type-based classes using NativeWind that match your theme.ts typography
  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'display':
        return 'typography-display text-app-text';
      case 'displayOutlined':
        return 'typography-display-outlined';
      case 'displayOutlinedMobile':
        return 'typography-display-outlined-mobile';
      case 'displayOutlinedReverse':
        return 'typography-display-outlined-reverse';
      case 'logo':
        return 'typography-logo';
      case 'header':
        return 'typography-header text-app-text';
      case 'subheader':
        return 'typography-subheader text-app-text';
      case 'cta':
        return 'typography-cta text-app-text';
      case 'copy':
        return 'typography-copy text-app-text';
      case 'copyBold':
        return 'typography-copy-bold text-app-text';
      case 'mono':
        return 'typography-mono text-app-text';
      case 'monoBold':
        return 'typography-mono-bold text-app-text';
      case 'title':
        return 'typography-header text-app-text';
      case 'subtitle':
        return 'typography-subheader text-app-text';
      case 'defaultSemiBold':
        return 'typography-copy-bold text-app-text';
      case 'link':
        return 'typography-copy text-app-primary underline';
      default:
        return 'typography-copy text-app-text';
    }
  };

  return (
    <Text
      className={cn(getTypeClasses(type), className)}
      style={[
        // Only apply custom color if lightColor or darkColor is specified
        (lightColor || darkColor) && { color },
        style,
      ]}
      {...rest}
    />
  );
}
