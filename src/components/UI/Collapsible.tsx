import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { IconSymbol } from 'components/UI/IconSymbol';
import colors from 'constants/style/colors';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  animatedOpen?: boolean;
}

export function Collapsible({ children, title, isOpen: externalIsOpen, onToggle, animatedOpen = false }: CollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlledExternally = externalIsOpen !== undefined;
  const isOpen = isControlledExternally ? externalIsOpen : internalIsOpen;

  const handlePress = () => {
    if (isControlledExternally) {
      onToggle?.(!isOpen);
    } else {
      const newIsOpen = !internalIsOpen;
      setInternalIsOpen(newIsOpen);
    }
  };

  return (
    <View className="bg-app-background dark:bg-app-primary rounded-xl p-4 mb-4 shadow-app-medium">
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        onPress={handlePress}
        activeOpacity={0.8}>
        <Animated.View 
          style={{
            transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
            transitionProperty: 'transform',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease-out'
          }}
        >
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={colors.light.secondary}
          />
        </Animated.View>
        <Text className="text-app-secondary font-subheader text-xl-responsive font-medium">{title}</Text>
      </TouchableOpacity>
      {isOpen && (
        <Animated.View 
          style={[
            { 
              marginTop: 6, 
              marginLeft: 24, 
              overflow: 'hidden',
              opacity: isOpen ? 1 : 0,
              transform: [
                { scale: isOpen ? 1 : 0.95 },
                { scaleY: isOpen ? 1 : 0 }
              ],
              transitionProperty: 'opacity, transform',
              transitionDuration: animatedOpen ? '400ms' : '0ms',
              transitionTimingFunction: 'ease-out'
            }
          ]}
        >
          <View>
            {children}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
