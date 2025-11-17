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
import { cn } from '@/src/utils/cn';
import { getTypeColor } from '~/utils/typeColors';
import { TypeBlurb } from './Blurb';
import { CounterSuggestions } from './CounterSuggestions';
import { Footer } from '../Meta/Footer';

// Helper component to render a type name with its color background
function TypeBadge({ typeName }: { typeName: string }) {
  const typeColor = getTypeColor(typeName);
  const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
  
  // Calculate luminance for text color
  const getLuminance = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const textColor = getLuminance(typeColor) > 0.6 ? '#141115' : '#FFFFFF';
  
  return (
    <Text 
      style={{ 
        backgroundColor: typeColor,
        color: textColor,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
      }}
      className="font-semibold"
    >
      {capitalizedType}
    </Text>
  );
}



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
  const secondMatchups = secondType ? getTypeMatchups(secondType) : null;
  const weaknesses = getWeaknesses(selectedType, secondType || undefined);
  const resistances = getResistances(selectedType, secondType || undefined);
  
  // Dual-type specific calculations
  const quadWeaknesses = isDualTyped ? getQuadrupleWeaknesses(selectedType, secondType) : [];
  const quadResistances = isDualTyped ? getQuadrupleResistances(selectedType, secondType) : [];
  
  // Calculate types that are weak to BOTH types in a dual typing (defensive perspective)
  // This shows which opponent types you should avoid the most
  const typesWeakToBoth: PokemonType[] = [];
  if (isDualTyped && secondMatchups) {
    const type1SuperEffective = matchups.offensive.superEffectiveAgainst;
    const type2SuperEffective = secondMatchups.offensive.superEffectiveAgainst;
    
    // Find types that appear in both arrays (weak to both types)
    for (const type of type1SuperEffective) {
      if (type2SuperEffective.includes(type)) {
        typesWeakToBoth.push(type);
      }
    }
  }
  
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

  // Calculate quad damage combinations for second type (if dual typed)
  const secondQuadDamageCombinations: string[] = [];
  if (isDualTyped && secondMatchups) {
    const secondSuperEffectiveTypes = secondMatchups.offensive.superEffectiveAgainst;
    for (let i = 0; i < secondSuperEffectiveTypes.length; i++) {
      for (let j = i; j < secondSuperEffectiveTypes.length; j++) {
        const type1 = secondSuperEffectiveTypes[i];
        const type2 = secondSuperEffectiveTypes[j];
        if (i === j) {
          continue;
        }
        secondQuadDamageCombinations.push(`${type1}/${type2}`);
      }
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
          {/* Defensive Section - Now First */}
          <View className="mb-2 lg:flex-1">
            <View className="flex-row flex-wrap items-center mb-1.5 gap-1">
              <Text className="text-lg font-bold text-app-gray-600 dark:text-app-surface">
                🛡️ Defensive (When 
              </Text>
              {isDualTyped ? (
                <>
                  <TypeBadge typeName={selectedType} />
                  <Text className="text-lg font-bold text-app-gray-600 dark:text-app-surface">&</Text>
                  <TypeBadge typeName={secondType!} />
                </>
              ) : (
                <TypeBadge typeName={selectedType} />
              )}
              <Text className="text-lg font-bold text-app-gray-600 dark:text-app-surface">
                {' '}defends):
              </Text>
            </View>


            {isDualTyped && quadWeaknesses.length > 0 && <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Very Weak To (takes 4x Damage):
              </Text>
              <TypeGrid
                types={quadWeaknesses}
                variant="veryWeak"
              />
            </View>}
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Weak To (takes 2x Damage):
              </Text>
              <TypeGrid
                types={weaknesses.filter(w => !quadWeaknesses.includes(w))}
                variant="weakTo"
              />
            </View>
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Neutral:
              </Text>
              <TypeGrid
                types={defensiveNeutral}
                variant="neutral"
              />
            </View>
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Resists (takes 0.5x Damage):
              </Text>
              <TypeGrid
                types={resistances.filter(r => !quadResistances.includes(r))}
                variant="resists"
              />
            </View>
            {isDualTyped && quadResistances.length > 0 && (
              <View className="mb-1">
                <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
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
                <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  Immune To (takes 0x Damage) :
                </Text>
                <TypeGrid
                  types={matchups.defensive.immuneTo}
                  variant="noEffect"
                />
              </View>
            )}

            {/* Counter Suggestions - Inside defensive section */}
            <CounterSuggestions selectedType={selectedType} secondType={secondType} />
          </View>

        {/* Wrapper for responsive layout */}
          {/* Offensive Section - Now Second */}
          <View className="mb-3 lg:flex-1">
            <View className="flex-row flex-wrap items-center mb-1.5 gap-1">
              <Text className="text-lg font-bold text-app-gray-600 dark:text-app-surface">
                🗡️ Offensive (When 
              </Text>
              {isDualTyped ? (
                <>
                  <TypeBadge typeName={selectedType} />
                  <Text className="text-lg font-bold text-app-gray-600 dark:text-app-surface">/</Text>
                  <TypeBadge typeName={secondType!} />
                </>
              ) : (
                <TypeBadge typeName={selectedType} />
              )}
              <Text className="text-lg font-bold text-app-gray-600 dark:text-app-surface">
                {' '}attacks):
              </Text>
            </View>

            {isDualTyped && typesWeakToBoth.length > 0 && (
              <View className="mb-1 p-2 bg-red-50 dark:bg-red-950 rounded-lg border border-red-300 dark:border-red-700">
                <Text className="text-sm font-semibold mb-1.5 text-red-800 dark:text-red-300">
                  ⚠️ AVOID These Types (Weak to BOTH {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} & {secondType!.charAt(0).toUpperCase() + secondType!.slice(1)}):
                </Text>
                <TypeGrid
                  types={typesWeakToBoth}
                  variant="veryWeak"
                />
              </View>
            )}
            
            {isDualTyped && (
              <Text className="text-xs text-gray-600 dark:text-gray-400 italic mb-2">
                Note: Shows STAB (Same Type Attack Bonus) move effectiveness. Pokémon can learn other type moves.
              </Text>
            )}

            {/* Type 1 Offensive */}
            {isDualTyped && (
              <View className="flex-row items-center mt-2 mb-1 gap-1">
                <TypeBadge typeName={selectedType} />
                <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {' '}Type Moves:
                </Text>
              </View>
            )}

            {quadDamageCombinations.length > 0 && (
              <View className="mb-1">
                <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  Super Duper Effective (4x Damage) Against:
                </Text>
                <TypeGrid
                  types={quadDamageCombinations}
                  variant="superDuperEffective"
                />
              </View>
            )}
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Super Effective (2x Damage) Against:
              </Text>
              <TypeGrid
                types={matchups.offensive.superEffectiveAgainst}
                variant="superEffective"
              />
            </View>
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Neutral Against:
              </Text>
              <TypeGrid
                types={offensiveNeutral}
                variant="neutral"
              />
            </View>
            <View className="mb-1">
              <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                Not Very Effective (0.5x Damage) Against:
              </Text>
              <TypeGrid
                types={matchups.offensive.notVeryEffectiveAgainst}
                variant="notVeryEffective"
              />
            </View>
            {matchups.offensive.noEffectAgainst.length > 0 && (
              <View className="mb-1">
                <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  No Effect (0x Damage) Against:
                </Text>
                <TypeGrid
                  types={matchups.offensive.noEffectAgainst}
                  variant="noEffect"
                />
              </View>
            )}

            {/* Type 2 Offensive (if dual type) */}
            {isDualTyped && secondMatchups && (
              <>
                <View className="flex-row items-center mt-4 mb-1 gap-1">
                  <TypeBadge typeName={secondType!} />
                  <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {' '}Type Moves:
                  </Text>
                </View>

                {secondQuadDamageCombinations.length > 0 && (
                  <View className="mb-1">
                    <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                      Super Duper Effective (4x Damage) Against:
                    </Text>
                    <TypeGrid
                      types={secondQuadDamageCombinations}
                      variant="superDuperEffective"
                    />
                  </View>
                )}

                {secondMatchups.offensive.superEffectiveAgainst.length > 0 && (
                  <View className="mb-1">
                    <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                      Super Effective (2x Damage) Against:
                    </Text>
                    <TypeGrid
                      types={secondMatchups.offensive.superEffectiveAgainst}
                      variant="superEffective"
                    />
                  </View>
                )}
                <View className="mb-1">
                  <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    Neutral Against:
                  </Text>
                  <TypeGrid
                    types={ALL_STANDARD_TYPES.filter(type => 
                      !secondMatchups.offensive.superEffectiveAgainst.includes(type) &&
                      !secondMatchups.offensive.notVeryEffectiveAgainst.includes(type) &&
                      !secondMatchups.offensive.noEffectAgainst.includes(type)
                    )}
                    variant="neutral"
                  />
                </View>
                <View className="mb-1">
                  <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    Not Very Effective (0.5x Damage) Against:
                  </Text>
                  <TypeGrid
                    types={secondMatchups.offensive.notVeryEffectiveAgainst}
                    variant="notVeryEffective"
                  />
                </View>
                {secondMatchups.offensive.noEffectAgainst.length > 0 && (
                  <View className="mb-1">
                    <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                      No Effect (0x Damage) Against:
                    </Text>
                    <TypeGrid
                      types={secondMatchups.offensive.noEffectAgainst}
                      variant="noEffect"
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
          {/* blurb about the chosen type */}
          <TypeBlurb selectedType={selectedType} secondType={secondType} />
        <Text
          role="heading"
          aria-level={1}
          className="text-lg font-semibold text-center text-gray-700 dark:text-app-secondary"
        >
          Use this Pokemon Type Calculator to analyze effectiveness{'\n'}
          Enter a Pokemon&apos;s name in the search bar to have its type filled in for you
        </Text>
        <Footer />
      </ScrollView>
    </View>
  );
}