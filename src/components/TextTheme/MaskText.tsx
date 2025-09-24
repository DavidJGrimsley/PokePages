import React from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { Text, View } from 'react-native';

export function MaskText({ text }: { text: string }) {
  return (
    <View className="h-[140px] w-full">
      <MaskedView
        style={{ flex: 1, flexDirection: 'row' }}
        maskElement={
          <View className="bg-transparent flex-1 items-center justify-center">
            <Text className="typography-display text-center">{text}</Text>
          </View>
        }
      >
        {/* Content shown through the text mask: three colored panels side-by-side */}
        <View className="flex-1 flex-row">
          <View className="flex-1 bg-red-500" />
          <View className="flex-1 bg-green-500" />
          <View className="flex-1 bg-blue-500" />
        </View>
      </MaskedView>
    </View>
  );
}

