import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void | Promise<void>;
  placeholder?: string;
  submitting?: boolean;
  maxLength?: number;
}

export function CommentInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Write a comment...',
  submitting = false,
  maxLength = 1000,
}: CommentInputProps) {
  const [inputHeight, setInputHeight] = useState(40);
  const MAX_INPUT_HEIGHT = 140;

  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        maxLength={maxLength}
        multiline
        blurOnSubmit={false}
        returnKeyType="default"
        className="flex-1 text-base leading-6 text-gray-900 dark:text-white py-1"
        style={[
          { minHeight: 40, height: Math.min(inputHeight, MAX_INPUT_HEIGHT) },
          Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null,
        ]}
        onContentSizeChange={(e) => {
          const h = e.nativeEvent.contentSize.height;
          setInputHeight(h < MAX_INPUT_HEIGHT ? h : MAX_INPUT_HEIGHT);
        }}
        onKeyPress={(e: any) => {
          // Web: Enter submits, Shift+Enter inserts newline
          if (Platform.OS === 'web') {
            const key = e?.nativeEvent?.key || e?.key;
            const shift = e?.nativeEvent?.shiftKey;
            if (key === 'Enter' && !shift) {
              if (typeof e.preventDefault === 'function') e.preventDefault();
              onSubmit();
            }
          }
        }}
        scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
        accessibilityLabel="Write a comment"
        accessibilityHint="Type your comment here"
      />
      <TouchableOpacity
        onPress={onSubmit}
        disabled={!value.trim() || submitting}
        className={`ml-2 ${
          value.trim() && !submitting ? 'opacity-100' : 'opacity-50'
        }`}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#F59E0B" />
        ) : (
          <Ionicons name="send" size={24} color="#F59E0B" />
        )}
      </TouchableOpacity>
    </View>
  );
}
