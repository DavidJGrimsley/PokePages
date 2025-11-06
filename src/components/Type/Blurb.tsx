import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTypeColor } from '~/utils/typeColors';
import typeAnalysisConfig from '~/constants/typeAnalysis.json';
import { type PokemonType } from '~/constants/typeUtils';

interface TypeBlurbProps {
  selectedType: PokemonType;
  secondType?: PokemonType | null;
}

export function TypeBlurb({ selectedType, secondType = null }: TypeBlurbProps) {
  const isDualTyped = secondType !== null;
  const color1 = getTypeColor(selectedType);
  const color2 = isDualTyped && secondType ? getTypeColor(secondType) : color1;

  // Compute text color for readability across both colors
  const getLuminance = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const textColor = lum1 > 0.6 || lum2 > 0.6 ? '#141115' : '#FFFFFF';

  // Resolve info from typeAnalysis.json
  let infoKey: string | undefined;
  if (isDualTyped && secondType) {
    const k1 = `${selectedType}-${secondType}`;
    const k2 = `${secondType}-${selectedType}`;
    if ((typeAnalysisConfig as any)[k1]) infoKey = k1;
    else if ((typeAnalysisConfig as any)[k2]) infoKey = k2;
  } else {
    infoKey = selectedType;
  }
  const info: any = infoKey ? (typeAnalysisConfig as any)[infoKey] : undefined;

  const headerText = info?.title
    ? `${info.title} Type Analysis`
    : (isDualTyped
        ? `${selectedType.toUpperCase()}/${secondType?.toUpperCase()} Type Analysis`
        : `${selectedType.toUpperCase()} Type Analysis`);

  const aboutLabel = info?.title
    ? `About ${info.title} type`
    : `About ${isDualTyped && secondType ? `${selectedType}/${secondType}` : selectedType} type`;

  return (
    <LinearGradient
      colors={[color1, color2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ borderRadius: 12, padding: 12, marginBottom: 16 }}
      className="rounded-xl p-3 mb-4 shadow-app-small"
    >
      <Text style={{ color: textColor }} className="text-xl font-bold text-center mb-4 capitalize">
        {headerText}
      </Text>
      <Text style={{ color: textColor }} className="text-center">
        (This section is not yet complete. Thank you for your patience!)
      </Text>
      <View>
        <Text style={{ color: textColor }} className="text-base font-semibold mb-1 capitalize">
          Developer&apos;s Note
        </Text>
        {info?.description && (
          <Text style={{ color: textColor }} className="text-sm leading-5">
            {info.description}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}