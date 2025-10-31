import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming
} from 'react-native-reanimated';
import { 
  getTypeMatchups,
  getWeaknesses,
  getResistances,
  getQuadrupleWeaknesses,
  getQuadrupleResistances,
  type PokemonType,
  ALL_STANDARD_TYPES
} from '~/constants/typeUtils';
import typeAnalysisConfig from '~/constants/typeAnalysis.json';
import { cn } from '@/src/utils/cn';
import { getTypeColor } from '~/utils/typeColors';
import { LinearGradient } from 'expo-linear-gradient';



interface TypeChipProps {
  type: PokemonType;
  variant: 'superEffective' | 'notVeryEffective' | 'neutral' | 'weakTo' | 'resists' | 'quadResists' | 'noEffect' | 'superDuperEffective' | 'veryWeak';
}

function TypeChip({ type, variant }: TypeChipProps) {
  const variantClasses = {
    superEffective: 'bg-green-600',
    notVeryEffective: 'bg-red-600',
    neutral: 'bg-gray-500',
    weakTo: 'bg-orange-600',
    resists: 'bg-blue-500',
    quadResists: 'bg-pink-500',
    noEffect: 'bg-white border border-gray-300',
    superDuperEffective: 'bg-yellow-500',
    veryWeak: 'bg-yellow-600',
  };

  const textClasses = {
    superEffective: 'text-white',
    notVeryEffective: 'text-white',
    neutral: 'text-white',
    weakTo: 'text-white',
    resists: 'text-white',
    quadResists: 'text-black',
    noEffect: 'text-gray-700',
    superDuperEffective: 'text-purple-700',
    veryWeak: 'text-black',
  };

  return (
    <View className={cn('px-3 py-1.5 rounded-full m-1', variantClasses[variant])}>
      <Text className={cn('text-xs font-bold capitalize', textClasses[variant])}>
        {type}
      </Text>
    </View>
  );
}

interface TypeGridProps {
  types: PokemonType[] | string[];
  variant: 'superEffective' | 'notVeryEffective' | 'neutral' | 'weakTo' | 'resists' | 'quadResists' | 'noEffect' | 'superDuperEffective' | 'veryWeak';
  emptyMessage?: string;
}

function TypeGrid({ types, variant, emptyMessage = 'None' }: TypeGridProps) {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const typesKey = types.join(',');

  useEffect(() => {
    // Reset and animate
    opacity.value = 0;
    translateX.value = -15;
    
    opacity.value = withTiming(1, { duration: 350 });
    translateX.value = withTiming(0, { duration: 350 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesKey]); // Trigger when types array changes

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { flexDirection: 'row', flexWrap: 'wrap', gap: 4 }]}>
      {types.length > 0 ? (
        types.map((type) => {
          // Handle dual-type combinations (e.g., "normal/rock")
          if (typeof type === 'string' && type.includes('/')) {
            return (
              <View key={type} className={cn('px-3 py-1.5 rounded-full m-1', variant === 'superDuperEffective' ? 'bg-yellow-500' : 'bg-green-600')}>
                <Text className={cn('text-xs font-bold capitalize', variant === 'superDuperEffective' ? 'text-purple-700' : 'text-white')}>
                  {type}
                </Text>
              </View>
            );
          }
          // Handle single types
          return <TypeChip key={type} type={type as PokemonType} variant={variant} />;
        })
      ) : (
        <Text className="text-gray-500 text-xs italic">
          {emptyMessage}
        </Text>
      )}
    </Animated.View>
  );
}

interface TypeAnalysisProps {
  selectedType: PokemonType;
  secondType?: PokemonType | null;
}

export function TypeAnalysis({ selectedType, secondType = null }: TypeAnalysisProps) {
  const isDualTyped = secondType !== null;
  const matchups = getTypeMatchups(selectedType);
  const weaknesses = getWeaknesses(selectedType, secondType || undefined);
  const resistances = getResistances(selectedType, secondType || undefined);
  
  // Dual-type specific calculations
  const quadWeaknesses = isDualTyped ? getQuadrupleWeaknesses(selectedType, secondType) : [];
  const quadResistances = isDualTyped ? getQuadrupleResistances(selectedType, secondType) : [];
  
  // Calculate all dual-type combinations that take 4x damage from this type
  // This happens when both types in the combination are weak to the attacking type
  const superEffectiveTypes = matchups.offensive.superEffectiveAgainst;
  const quadDamageCombinations: string[] = [];
  
  for (let i = 0; i < superEffectiveTypes.length; i++) {
    for (let j = i; j < superEffectiveTypes.length; j++) {
      const type1 = superEffectiveTypes[i];
      const type2 = superEffectiveTypes[j];
      if (i === j) {
        // Same type twice doesn't make sense, skip
        continue;
      }
      // Create combination string
      quadDamageCombinations.push(`${type1}/${type2}`);
    }
  }
  
  // Calculate neutral offensive types (all types minus super effective, not very effective, and no effect)
  const offensiveNeutral = ALL_STANDARD_TYPES.filter(type => 
    !matchups.offensive.superEffectiveAgainst.includes(type) &&
    !matchups.offensive.notVeryEffectiveAgainst.includes(type) &&
    !matchups.offensive.noEffectAgainst.includes(type)
  );

  // Calculate neutral defensive types (all types minus weak, resist, and immune)
  const defensiveNeutral = ALL_STANDARD_TYPES.filter(type => 
    !weaknesses.includes(type) &&
    !resistances.includes(type) &&
    !matchups.defensive.immuneTo.includes(type)
  );

  return (
    <View className="px-2 flex-1">
     
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Wrapper for responsive layout */}
        <View className="flex-col lg:flex-row lg:gap-6">
          {/* Offensive Section - Only show for single type */}
          {!isDualTyped && <View className="mb-3 lg:flex-1">
            <Text className="text-lg font-bold mb-1.5">
              🗡️ Offensive (When {selectedType} attacks):
            </Text>

          {quadDamageCombinations.length > 0 && (
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5">
                Super Duper Effective (4x Damage) Against:
              </Text>
              <TypeGrid
                types={quadDamageCombinations}
                variant="superDuperEffective"
              />
            </View>
          )}
          <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Super Effective (2x Damage) Against:
            </Text>
            <TypeGrid
              types={matchups.offensive.superEffectiveAgainst}
              variant="superEffective"
            />
          </View>
          <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Neutral Against:
            </Text>
            <TypeGrid
              types={offensiveNeutral}
              variant="neutral"
            />
          </View>
          <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Not Very Effective (0.5x Damage) Against:
            </Text>
            <TypeGrid
              types={matchups.offensive.notVeryEffectiveAgainst}
              variant="notVeryEffective"
            />
          </View>
          {matchups.offensive.noEffectAgainst.length > 0 && (
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5">
                No Effect (0x Damage) Against:
              </Text>
              <TypeGrid
                types={matchups.offensive.noEffectAgainst}
                variant="noEffect"
              />
            </View>
          )}
        </View>}
        {/* Defensive Section */}
        <View className="mb-2 lg:flex-1">
          <Text className="text-lg font-bold mb-1.5">
            🛡️ Defensive (When {isDualTyped ? `${selectedType}/${secondType}` : selectedType} defends):
          </Text>

          {isDualTyped && quadWeaknesses.length > 0 && <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Very Weak To (takes 4x Damage):
            </Text>
            <TypeGrid
              types={quadWeaknesses}
              variant="veryWeak"
            />
          </View>}
          <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Weak To (takes 2x Damage):
            </Text>
            <TypeGrid
              types={weaknesses.filter(w => !quadWeaknesses.includes(w))}
              variant="weakTo"
            />
          </View>
          <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Neutral:
            </Text>
            <TypeGrid
              types={defensiveNeutral}
              variant="neutral"
            />
          </View>
          <View className="mb-1">
            <Text className="text-sm font-semibold mb-1.5">
              Resists (takes 0.5x Damage):
            </Text>
            <TypeGrid
              types={resistances.filter(r => !quadResistances.includes(r))}
              variant="resists"
            />
          </View>
          {isDualTyped && quadResistances.length > 0 && (
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5">
                Double Resists (takes 0.25x Damage):
              </Text>
              <TypeGrid
                types={quadResistances}
                variant="quadResists"
              />
            </View>
          )}
          {matchups.defensive.immuneTo.length > 0 && (
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5">
                Immune To (takes 0x Damage) :
              </Text>
              <TypeGrid
                types={matchups.defensive.immuneTo}
                variant="noEffect"
              />
            </View>
          )}
        </View>
      </View>
          {/* blurb about the chosen type */}
        
          {/* Type analysis description box (single or dual) */}
          {(() => {
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
                <Text style={{ color: textColor }} className="text-base font-semibold mb-1 capitalize">
                  {aboutLabel}
                </Text>
                {info?.description && (
                  <Text style={{ color: textColor }} className="text-sm leading-5">
                    {info.description}
                  </Text>
                )}
              </LinearGradient>
            );
          })()}
      </ScrollView>

    </View>
  );
}