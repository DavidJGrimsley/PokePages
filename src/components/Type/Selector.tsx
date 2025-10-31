import React, { useState } from 'react';
import { View, Text, Platform, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { type PokemonType } from '~/constants/typeUtils';


interface TypeSelectorProps {
  types: PokemonType[];
  selectedType: PokemonType | null;
  onTypeSelect: (type: PokemonType | null) => void;
  allowNone?: boolean;
  label?: React.ReactNode;
}

const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';

export function TypeSelector({ types, selectedType, onTypeSelect, allowNone = false, label }: TypeSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const NONE_VALUE = '__none__';
  const selectedValue = selectedType ?? (allowNone ? NONE_VALUE : types[0]);
  
  const displayValue = selectedType 
    ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
    : allowNone ? 'None' : types[0].charAt(0).toUpperCase() + types[0].slice(1);

  // iOS Modal Picker
  if (isIOS) {
    return (
      <View className="mb-4 items-center flex-1">
        <View className="rounded-lg flex-row bg-gray-100 px-2 py-1 items-center min-w-[150px] w-full max-w-[180px]">
          {label && (
            <Text className="text-xs font-semibold text-gray-600 text-left mr-2 min-w-[40px]">
              {label}
            </Text>
          )}
          <Pressable 
            onPress={() => setShowModal(true)}
            className="flex-1 bg-white rounded px-3 py-2 border border-gray-300"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-800 font-medium">
                {displayValue}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#555" />
            </View>
          </Pressable>
        </View>

        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-2xl" style={{ minHeight: 380 }}>
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <Pressable onPress={() => setShowModal(false)}>
                  <Text className="text-blue-500 font-semibold">Cancel</Text>
                </Pressable>
                <Text className="font-semibold text-gray-800">
                  {label || 'Select Type'}
                </Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Text className="text-blue-500 font-semibold">Done</Text>
                </Pressable>
              </View>
              <Picker
                selectedValue={selectedValue as any}
                onValueChange={(value) => {
                  if (allowNone && value === NONE_VALUE) {
                    onTypeSelect(null);
                  } else {
                    onTypeSelect(value as PokemonType);
                  }
                }}
                style={{ height: 300 }}
              >
                {allowNone && (
                  <Picker.Item label="None" value={NONE_VALUE} />
                )}
                {types.map((type) => (
                  <Picker.Item 
                    key={type} 
                    label={type.charAt(0).toUpperCase() + type.slice(1)} 
                    value={type} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Web and Android - Original Picker
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
