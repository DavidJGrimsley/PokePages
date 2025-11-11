import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import type { ReactionType } from '~/utils/socialApi';

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reactionType: ReactionType) => void;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Like' },
  { type: 'shiny', emoji: '⭐', label: 'Shiny' },
  { type: 'fire', emoji: '🔥', label: 'Hype' },
  { type: 'meh', emoji: '💤', label: 'Meh' },
  { type: 'heartbreak', emoji: '💔', label: 'Sad' },
  { type: 'hundred', emoji: '💯', label: 'Love' },
];

export function ReactionPicker({ visible, onClose, onSelect }: ReactionPickerProps) {
  const handleSelect = (type: ReactionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-2xl border-2 border-amber-500 mx-4"
        >
          <Text className="typography-label text-gray-900 dark:text-white text-center mb-4 font-semibold">
            Choose Your Reaction
          </Text>
          <View className="flex-row flex-wrap justify-center">
            {REACTIONS.map((reaction) => (
              <TouchableOpacity
                key={reaction.type}
                onPress={() => handleSelect(reaction.type)}
                className="items-center m-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl min-w-[80px]"
              >
                <Text className="text-3xl mb-1">{reaction.emoji}</Text>
                <Text className="typography-caption text-gray-700 dark:text-gray-300">
                  {reaction.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export { REACTIONS };
