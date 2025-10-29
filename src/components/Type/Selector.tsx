import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { type PokemonType } from '~/constants/typeUtils';


interface TypeSelectorProps {
  types: PokemonType[];
  selectedType: PokemonType | null;
  onTypeSelect: (type: PokemonType | null) => void;
  allowNone?: boolean;
  label?: React.ReactNode; // <-- Change here
}
const isWeb = Platform.OS === 'web';

export function TypeSelector({ types, selectedType, onTypeSelect, allowNone = false, label }: TypeSelectorProps) {
  const NONE_VALUE = '__none__';
  const selectedValue = selectedType ?? (allowNone ? NONE_VALUE : types[0]);
  return (
    <View className="mb-4 items-center flex-1">
      <View className="rounded-lg flex-row bg-gray-100 px-2 py-1 items-center min-w-[150px] w-full max-w-[180px]">
        {label && (
          <Text className="text-xs font-semibold text-gray-600 text-center mr-2 min-w-[40px]">
            {label}
          </Text>
        )}
        <View className="flex-1">
          <Picker
          selectedValue={selectedValue as any}
          onValueChange={(value) => {
            if (allowNone && value === NONE_VALUE) {
              onTypeSelect(null);
            } else {
              onTypeSelect(value as PokemonType);
            }
          }}
          dropdownIconColor="#555"
          style={{ height: isWeb ? 30 : 55 }}
        >
          {allowNone && (
            <Picker.Item label="None" value={NONE_VALUE} />
          )}
          {types.map((type) => (
            <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
          ))}
        </Picker>
      </View>
    </View>
  </View>
  );
}
