import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from 'constants/style/theme';
import React, { useState, createContext, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList 
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { cn } from '~/utils/cn';

// Create context for scroll handling
interface ScrollContextType {
  scrollY: SharedValue<number>;
  lastScrollY: SharedValue<number>;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  return context; // Return null if not in context instead of throwing
};

interface GameGeneration {
  guardID: string;
  label: string;
  available: boolean;
  games: string;
}

const gameGenerations: GameGeneration[] = [
  { guardID: 'PLZA', label: 'Pokemon Legends:', available: true, games: 'Z-A' },
  { guardID: 'gen9', label: 'Generation 9', available: true, games: 'Scarlet, Violet' },
  { guardID: 'gen8', label: 'Generation 8', available: false, games: 'Sword, Shield, BDSP' },
  { guardID: 'gen7', label: 'Generation 7', available: false, games: 'Sun, Moon, Ultra S/M' },
  { guardID: 'gen6', label: 'Generation 6', available: false, games: 'X, Y, ORAS' },
  { guardID: 'gen5', label: 'Generation 5', available: false, games: 'Black, White, B2W2' },
  { guardID: 'gen4', label: 'Generation 4', available: false, games: 'Diamond, Pearl, Platinum' },
  { guardID: 'gen3', label: 'Generation 3', available: false, games: 'Ruby, Sapphire, Emerald' },
  { guardID: 'gen2', label: 'Generation 2', available: false, games: 'Gold, Silver, Crystal' },
  { guardID: 'gen1', label: 'Generation 1', available: false, games: 'Red, Blue, Yellow' },
];

interface GameDropdownProps {
  selectedGeneration: GameGeneration;
  onGenerationSelect: (generation: GameGeneration) => void;
  scrollY: SharedValue<number>;
  lastScrollY: SharedValue<number>;
}

function GameDropdown({ selectedGeneration, onGenerationSelect, scrollY, lastScrollY }: GameDropdownProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Derive the hidden state from scroll values
  const isHidden = useDerivedValue(() => {
    const scrollDelta = scrollY.value - lastScrollY.value;
    
    // Near top of page - always show
    if (scrollY.value <= 50) {
      return 0;
    }
    
    // Scrolling down - hide dropdown
    if (scrollDelta > 3) {
      return 1;
    }
    
    // Scrolling up - show dropdown  
    if (scrollDelta < -3) {
      return 0;
    }
    
    // No significant scroll, maintain based on position
    return scrollY.value > 100 ? 1 : 0;
  });

  // Animated style for hiding/showing the dropdown based on scroll direction
  const animatedStyle = useAnimatedStyle(() => {
    const maxHeight = interpolate(
      isHidden.value,
      [0, 1],
      [100, 0], // From full height to 0
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      isHidden.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      maxHeight: withTiming(maxHeight, { duration: 250 }),
      opacity: withTiming(opacity, { duration: 250 }),
      overflow: 'hidden',
    };
  });

  const handleGenerationSelect = (generation: GameGeneration) => {
    if (generation.available) {
      onGenerationSelect(generation);
      setIsDropdownVisible(false);
    }
  };

  const renderGenerationItem = ({ item }: { item: GameGeneration }) => (
    <TouchableOpacity
      className={cn(
        "flex-row justify-between items-center px-sm py-xs border-b border-app-secondary",
        !item.available && "opacity-60",
        item.guardID === selectedGeneration.guardID && "bg-app-accent/15"
      )}
      onPress={() => handleGenerationSelect(item)}
      disabled={!item.available}
    >
      <View className="flex-1">
        <Text className={cn(
          "typography-subheader mb-0",
          !item.available && "text-app-brown",
          item.guardID === selectedGeneration.guardID ? "text-app-accent font-semibold" : "text-app-text"
        )}>
          {item.label}
        </Text>
        <Text className={cn(
          "typography-copy text-sm",
          !item.available && "text-app-brown",
          item.guardID === selectedGeneration.guardID ? "text-app-accent" : "text-app-brown"
        )}>
          {item.games}
        </Text>
      </View>
      {!item.available && (
        <Text className="typography-copy text-app-accent text-sm font-semibold ml-sm">
          Coming Soon
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Animated.View 
      style={[
        animatedStyle,
      ]} 
      className="px-sm py-xs bg-app-white border-b border-app-secondary shadow-app-small"
    >
      <TouchableOpacity
        className="bg-app-white border-2 border-app-accent rounded-lg px-sm py-xs"
        onPress={() => setIsDropdownVisible(true)}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="typography-subheader text-app-text mb-0">
              {selectedGeneration.label}
            </Text>
            <Text className="typography-copy text-app-brown text-sm">
              {selectedGeneration.games}
            </Text>
          </View>
          <MaterialIcons 
            name="arrow-drop-down" 
            size={24} 
            color={theme.colors.light.accent} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center px-md py-sm"
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View className="bg-app-white rounded-xl w-full max-h-[70%] shadow-app-large">
            <Text className="typography-header text-app-text text-center py-sm border-b border-app-secondary">
              Select Game
            </Text>
            <FlatList
              data={gameGenerations}
              renderItem={renderGenerationItem}
              keyExtractor={(item) => item.guardID}
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
}

export default function GuidesLayout() {
  // State variables for controlling which screens are available
  const [gen9, setGen9] = useState(false);
  const [PLZA, setPLZA] = useState(true);
  
  // Shared values for scroll tracking
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  
  // Default to Legends Z-A since it's available
  const [selectedGeneration, setSelectedGeneration] = useState(
    gameGenerations.find(gen => gen.guardID === 'PLZA') || gameGenerations[9]
  );

  const handleGenerationSelect = (generation: GameGeneration) => {
    setSelectedGeneration(generation);
    
    // Update guard states based on selection
    if (generation.guardID === 'gen9') {
      setGen9(true);
      setPLZA(false);
    } else if (generation.guardID === 'PLZA') {
      setGen9(false);
      setPLZA(true);
    }
  };

  return (
    <ScrollContext.Provider value={{ scrollY, lastScrollY }}>
      <View className="flex-1 bg-app-background">
        <GameDropdown 
          selectedGeneration={selectedGeneration}
          onGenerationSelect={handleGenerationSelect}
          scrollY={scrollY}
          lastScrollY={lastScrollY}
        />
        <Animated.View style={[{ flex: 1 }]} className="flex-1">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={gen9}>
              <Stack.Screen name="gen9" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={PLZA}>
              <Stack.Screen name="PLZA" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </Animated.View>
      </View>
    </ScrollContext.Provider>
  );
}
