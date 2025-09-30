import { Stack } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from 'constants/style/theme';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList 
} from 'react-native';
import { cn } from '~/utils/cn';

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
}

function GameDropdown({ selectedGeneration, onGenerationSelect }: GameDropdownProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleGenerationSelect = (generation: GameGeneration) => {
    if (generation.available) {
      onGenerationSelect(generation);
      setIsDropdownVisible(false);
    }
  };

  const renderGenerationItem = ({ item }: { item: GameGeneration }) => (
    <TouchableOpacity
      className={cn(
        "flex-row justify-between items-center p-md border-b border-app-secondary",
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
    <View className="px-md py-sm bg-app-white border-b border-app-secondary shadow-app-small">
      <TouchableOpacity
        className="bg-app-white border-2 border-app-accent rounded-lg p-md"
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
          className="flex-1 bg-black/50 justify-center items-center p-lg"
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View className="bg-app-white rounded-xl w-full max-h-[70%] shadow-app-large">
            <Text className="typography-header text-app-text text-center py-lg border-b border-app-secondary">
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
    </View>
  );
}

export default function GuidesLayout() {
  // State variables for controlling which screens are available
  const [gen9, setGen9] = useState(false);
  const [PLZA, setPLZA] = useState(true);
  
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
    <View className="flex-1 bg-app-background">
      <GameDropdown 
        selectedGeneration={selectedGeneration}
        onGenerationSelect={handleGenerationSelect}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={gen9}>
          <Stack.Screen name="gen9" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={PLZA}>
          <Stack.Screen name="PLZA" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
