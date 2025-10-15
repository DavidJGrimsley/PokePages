import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring
} from 'react-native-reanimated';

import { IconSymbol } from 'components/UI/IconSymbol';
import colors from 'constants/style/colors';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  animatedOpen?: boolean;
  rightContent?: React.ReactNode;
  invertColors?: boolean;
  backgroundImage?: string;
}

export function Collapsible({ children, title, isOpen: externalIsOpen, onToggle, animatedOpen = false, rightContent, invertColors = false, backgroundImage }: CollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlledExternally = externalIsOpen !== undefined;
  const isOpen = isControlledExternally ? externalIsOpen : internalIsOpen;
  
  const rotation = useSharedValue(0);

  const handlePress = () => {
    const nextIsOpen = isControlledExternally ? !isOpen : !internalIsOpen;
    
    if (isControlledExternally) {
      onToggle?.(nextIsOpen);
    } else {
      setInternalIsOpen(nextIsOpen);
    }
    
    // Animate rotation
    rotation.value = withSpring(nextIsOpen ? 90 : 0);
  };

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });



  const backgroundClass = invertColors 
    ? "bg-app-primary dark:bg-app-background" 
    : "bg-app-background dark:bg-app-primary";
  const titleClass = invertColors 
    ? "text-app-secondary dark:text-app-primary" 
    : "text-app-primary dark:text-app-secondary";

  return (
    <View className={`${backgroundClass} rounded-xl p-4 mb-4 shadow-app-medium relative overflow-hidden`}>
      {backgroundImage && (
        <Image
          source={{ uri: backgroundImage }}
          style={{ 
            position: 'absolute',
            width: '60%',
            height: '80%',
            top: '10%',
            right: '5%',
            opacity: 0.9,
            zIndex: 0
          }}
          resizeMode="contain"
          onError={(error) => console.log('Image load error:', error)}
          onLoad={() => console.log('Image loaded successfully:', backgroundImage)}
        />
      )}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, zIndex: 1 }}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Animated.View style={rotationStyle}>
            <IconSymbol
              name="chevron.right"
              size={18}
              weight="medium"
              color={colors.light.secondary}
            />
          </Animated.View>
          <Text className={`font-subheader text-xl-responsive font-medium ${titleClass}`}>{title}</Text>
        </View>
        {rightContent && (
          <View>
            {rightContent}
          </View>
        )}
      </TouchableOpacity>
      {isOpen && (
        <Animated.View 
          entering={FadeInDown.duration(500).springify().damping(15)}
          style={{ 
            marginTop: 6, 
            marginLeft: 24, 
            overflow: 'hidden',
            zIndex: 1
          }}
        >
          <View>
            {children}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
