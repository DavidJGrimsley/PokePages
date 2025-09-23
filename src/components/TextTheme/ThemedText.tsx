import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '~/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
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

  // Define type-based classes using NativeWind
  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'title':
        return 'text-3xl font-bold leading-8 font-molle';
      case 'subtitle':
        return 'text-xl font-bold font-roboto';
      case 'defaultSemiBold':
        return 'text-base leading-6 font-semibold font-roboto';
      case 'link':
        return 'text-base leading-7 text-app-primary font-roboto';
      default:
        return 'text-base leading-6 font-roboto';
    }
  };

  return (
    <Text
      className={`text-app-text ${getTypeClasses(type)} ${className || ''}`}
      style={[
        { color },
        style,
      ]}
      {...rest}
    />
  );
}
