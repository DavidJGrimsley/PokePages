import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  Alert,
  Pressable, 
  Platform, 
  Image,
  Dimensions 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PokemonClient } from 'pokenode-ts';
import { supabase } from '~/utils/supabaseClient';
import { diagnosticChecks } from '~/utils/supabaseDiagnostics';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

import { useAuthStore } from '~/store/authStore';
import { getEventStatus } from '~/utils/helperFX';
import ErrorMessage from '~/components/Meta/Error';
import { cn } from '~/utils/cn';

// Cross-platform alert function
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

// Add interface for Pokemon stats
interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface EventCounterProps {
  pokemonName: string;
  pokemonId: number;
  teraType: string;
  eventTitle: string;
  eventDescription: string;
  eventKey: string; // Unique identifier for the event
  startDate: string;
  endDate: string;
  distributionStart: string;
  distributionEnd: string;
  targetCount: number;
  maxRewards: number;
  colorScheme?: 'light' | 'dark';
}

export const EventCounter: React.FC<EventCounterProps> = ({
  pokemonName,
  pokemonId,
  teraType,
  eventTitle,
  eventDescription,
  eventKey,
  startDate,
  endDate,
  distributionStart,
  distributionEnd,
  targetCount,
  maxRewards,
  colorScheme = 'light'
}) => {
  const { user, isLoggedIn } = useAuthStore();
  const [globalCount, setGlobalCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [pokemonImage, setPokemonImage] = useState('');
  const [pokemonStats, setPokemonStats] = useState<PokemonStats | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBaseStats, setShowBaseStats] = useState(false);
  const [pokemonError, setPokemonError] = useState('');
  const [eventError, setEventError] = useState('');

  // Get screen dimensions for responsive styling
  const screenWidth = Dimensions.get('window').width;
  const getStatsContainerWidth = () => {
    if (screenWidth < 768) return '90%'; // Phone
    if (screenWidth < 1024) return '75%'; // Tablet
    return '60%'; // Desktop
  };

  // Function to get color based on stat value (red to green gradient)
  const getStatColor = (statValue: number): string => {
    const normalized = Math.min(statValue / 180, 1);
    
    if (normalized <= 0.5) {
      const redToOrange = normalized * 2;
      const red = 220;
      const green = Math.floor(120 * redToOrange);
      return `rgb(${red}, ${green}, 50)`;
    } else {
      const orangeToGreen = (normalized - 0.5) * 2;
      const red = Math.floor(220 * (1 - orangeToGreen) + 60 * orangeToGreen);
      const green = Math.floor(120 + 100 * orangeToGreen);
      const blue = Math.floor(50 + 30 * orangeToGreen);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Generate anonymous ID for non-logged-in users
  const generateAnonymousId = () => {
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  };

  // Cross-platform storage functions
  const getStorageItem = async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting storage item:', error);
      return null;
    }
  };

  const setStorageItem = async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting storage item:', error);
    }
  };

  // Initialize anonymous ID for non-logged-in users
  useEffect(() => {
    const initializeAnonymousId = async () => {
      if (!isLoggedIn) {
        const storageKey = `anonymous_id_${eventKey}`;
        let storedId = await getStorageItem(storageKey);
        
        if (!storedId) {
          storedId = generateAnonymousId();
          await setStorageItem(storageKey, storedId);
        }
        
        setAnonymousId(storedId);
      }
    };

    initializeAnonymousId();
  }, [isLoggedIn, eventKey]);

  // Load Pokemon data using pokenode-ts
  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        const pokemonClient = new PokemonClient();
        const pokemon = await pokemonClient.getPokemonById(pokemonId)
          .catch((error: any) => {
            console.error('Error fetching Pokemon from pokenode-ts:', error);
            return null;
          });

        if (!pokemon) {
          setPokemonImage('');
          setPokemonStats(null);
          return;
        }
       
        const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_shiny || 
                          pokemon.sprites.front_shiny || 
                          pokemon.sprites.front_default || '';
        setPokemonImage(imageUrl);
        
        const statsArray = Array.isArray(pokemon.stats) ? pokemon.stats : [];
        const stats: PokemonStats = {
          hp: statsArray.find((stat: any) => stat?.stat?.name === 'hp')?.base_stat || 0,
          attack: statsArray.find((stat: any) => stat?.stat?.name === 'attack')?.base_stat || 0,
          defense: statsArray.find((stat: any) => stat?.stat?.name === 'defense')?.base_stat || 0,
          specialAttack: statsArray.find((stat: any) => stat?.stat?.name === 'special-attack')?.base_stat || 0,
          specialDefense: statsArray.find((stat: any) => stat?.stat?.name === 'special-defense')?.base_stat || 0,
          speed: statsArray.find((stat: any) => stat?.stat?.name === 'speed')?.base_stat || 0,
        };
        
        setPokemonStats(stats);
        
      } catch (error) {
        console.error('Error in loadPokemonData:', error);
        setPokemonError(`${error instanceof Error ? error.message : String(error)}`);
        setPokemonImage('');
        setPokemonStats(null);
      } finally {
        setImageLoading(false);
      }
    };

    loadPokemonData();
  }, [pokemonId]);

  // Load event data and user participation
  useEffect(() => {
    const loadEventData = async () => {
      console.log('🔍 Starting loadEventData for eventKey:', eventKey);
      console.log('🔍 User status:', { isLoggedIn, userId: user?.id, anonymousId });
      
      try {
        // Test basic Supabase connection with timeout
        console.log('🧪 Testing basic Supabase connection...');
        
        const connectionTest = Promise.race([
          supabase
            .from('event_counters')
            .select('event_key')
            .limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
          )
        ]);

        const { data: testData, error: testError } = await connectionTest as any;
        
        console.log('🧪 Connection test completed:', { testData, testError });
        
        if (testError) {
          console.error('❌ Basic connection failed:', testError);
          throw new Error(`Connection failed: ${testError.message}`);
        }

        // Get event data with timeout
        console.log('📊 Fetching event data for eventKey:', eventKey);
        
        const eventQuery = Promise.race([
          supabase
            .from('event_counters')
            .select('*')
            .eq('event_key', eventKey)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Event query timeout after 10 seconds')), 10000)
          )
        ]);

        const { data: eventData, error: eventError } = await eventQuery as any;

        console.log('📊 Event query completed:', { 
          eventData, 
          eventError,
          hasData: !!eventData,
          errorCode: eventError?.code,
          errorMessage: eventError?.message 
        });

        if (eventError) {
          if (eventError.code === 'PGRST116') {
            console.warn('⚠️ No event found for key:', eventKey);
            setGlobalCount(0);
            setEventError(`No event found for key: ${eventKey}`);
            return;
          }
          throw new Error(`Event data error: ${eventError.message}`);
        }

        if (!eventData) {
          console.warn('⚠️ No event data returned for key:', eventKey);
          setGlobalCount(0);
          setEventError(`No event data found for: ${eventKey}`);
          return;
        }

        console.log('✅ Setting global count to:', eventData.total_count);
        setGlobalCount(eventData.total_count || 0);
        setLastUpdated(eventData.updated_at);

        // Get user participation
        if (isLoggedIn && user) {
          console.log('👤 Fetching user participation for event_id:', eventData.id, 'user_id:', user.id);
          
          const userQuery = Promise.race([
            supabase
              .from('user_event_participation')
              .select('contribution_count')
              .eq('event_id', eventData.id)
              .eq('user_id', user.id)
              .maybeSingle(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('User participation timeout')), 10000)
            )
          ]);

          const { data: userParticipation, error: userError } = await userQuery as any;
          console.log('👤 User participation response:', { userParticipation, userError });
          
          if (userError && userError.code !== 'PGRST116') {
            console.error('❌ User participation error:', userError);
          }

          setUserCount(userParticipation?.contribution_count || 0);
        } else if (anonymousId) {
          console.log('👻 Fetching anonymous participation for event_id:', eventData.id, 'anonymous_id:', anonymousId);
          
          const { data: anonParticipation, error: anonError } = await supabase
            .from('anonymous_event_participation')
            .select('contribution_count')
            .eq('event_id', eventData.id)
            .eq('anonymous_id', anonymousId)
            .maybeSingle();

          console.log('👻 Anonymous participation response:', { 
            anonParticipation, 
            anonError,
            hasData: !!anonParticipation 
          });
          
          if (anonError && anonError.code !== 'PGRST116') {
            console.error('❌ Anonymous participation error:', anonError);
          }

          setUserCount(anonParticipation?.contribution_count || 0);
        }

        setError('');
        setEventError('');
        console.log('✅ loadEventData completed successfully');
        
      } catch (error) {
        console.error('💥 Failed to load event data:', error);
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setEventError(`Failed to load event data: ${errorMessage}`);
        
        // Run diagnostics only if user is logged in
        if (isLoggedIn && user) {
          console.log('🚀 Running diagnostics due to error...');
          try {
            await diagnosticChecks.runAllChecks();
          } catch (diagError) {
            console.error('🚀 Diagnostics failed:', diagError);
          }
        }
      }
    };

    if (eventKey && (isLoggedIn || anonymousId)) {
      console.log('🚀 Conditions met, calling loadEventData...');
      loadEventData();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel(`event_${eventKey}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'event_counters',
            filter: `event_key=eq.${eventKey}`
          }, 
          (payload) => {
            console.log('📡 Real-time update received:', payload);
            if (payload.new) {
              setGlobalCount(payload.new.total_count || 0);
              setLastUpdated(payload.new.updated_at);
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
        });

      return () => {
        console.log('🧹 Cleaning up subscription');
        subscription.unsubscribe();
      };
    } else {
      console.log('⏸️ Conditions not met:', { 
        hasEventKey: !!eventKey, 
        isLoggedIn, 
        hasAnonymousId: !!anonymousId 
      });
    }
  }, [eventKey, isLoggedIn, user, anonymousId]);

  // Format date to user-friendly format
  const formatUserFriendlyDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Date TBD';
      }
      
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zonedDate = toZonedTime(date, userTimeZone);
      
      return format(zonedDate, 'MMMM d, yyyy \'at\' h:mm a') + ' local time';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date TBD';
    }
  };

  const status = getEventStatus(startDate, endDate, distributionStart, distributionEnd);
  
  // Get countdown text
  const getCountdownText = () => {
    const now = currentTime;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (status === 'upcoming') {
      const timeDiff = start.getTime() - now.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `Event starts in ${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `Event starts in ${hours}h ${minutes}m`;
      } else {
        return `Event starts in ${minutes}m`;
      }
    } else if (status === 'active') {
      const timeDiff = end.getTime() - now.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `Event ends in ${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `Event ends in ${hours}h ${minutes}m`;
      } else {
        return `Event ends in ${minutes}m`;
      }
    } else {
      return 'Event has ended';
    }
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    return status !== 'active' || loading;
  };

  const incrementCounter = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call the Supabase function with explicit parameters
      const params = {
        p_event_key: eventKey,  // Using p_ prefix to match SQL function parameter
        p_pokemon_name: pokemonName,  // Add pokemon name parameter
        p_user_id: isLoggedIn && user ? user.id : null,
        p_anonymous_id: !isLoggedIn && anonymousId ? anonymousId : null
      };
      
      const { data, error } = await supabase.rpc('increment_counter', params);
      
      if (error) {
        console.error('❌ increment_counter error:', error);
        throw error;
      }

      if (data) {
        if (data.success) {
          // The function returns a JSON object
          const eventCounter = data.event_counter;
          const userContribution = data.user_contribution;
          
          setGlobalCount(eventCounter.current_count || 0);
          setUserCount(userContribution || 0);
          setLastUpdated(eventCounter.updated_at || new Date().toISOString());
        } else {
          // Function returned success: false
          console.error('❌ Function returned error:', data.error);
          throw new Error(data.error || 'Function returned unsuccessful result');
        }
      } else {
        console.error('❌ No data returned from function');
        throw new Error('No data returned from increment_counter function');
      }
      
    } catch (error) {
      console.error('❌ Failed to increment counter:', error);
      setError(`Failed to update counter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      showAlert('Error', 'Failed to update counter. Please try again.');
    }
    
    setLoading(false);
  };

  const getProgressPercentage = () => {
    return Math.min(Number(((globalCount / targetCount) * 100).toFixed(3)), 100);
  };

  const getBonusRewards = () => {
    const bonusLevels = Math.floor((globalCount - targetCount) / 100000);
    return Math.min(bonusLevels, (maxRewards - targetCount) / 100000);
  };

  return (
    <ScrollView className="flex-1 bg-app-background" showsVerticalScrollIndicator={false}>
      {/* Pokemon Image - using exact original styling */}
      <View className="items-center my-sm h-[200px] justify-center">
        {imageLoading ? (
          <LottieView
            source={require('@/assets/lottie/stars.json')}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        ) : pokemonImage ? (
          <Image 
            source={{ uri: pokemonImage }} 
            style={{ width: 180, height: 180 }}  // Using exact original dimensions
            resizeMode="contain"
          />
        ) : (
          <View className="w-45 h-45 bg-app-secondary rounded-full justify-center items-center border-2 border-app-accent">
            <Text className="typography-copy text-app-brown text-center">{pokemonName}</Text>
          </View>
        )}
      </View>

      {/* Show login prompt for better experience - using exact original styling */}
      {!isLoggedIn && (
        <Pressable onPress={() => router.push('/sign-in')}>
          <View className="bg-app-background mx-lg my-sm p-md rounded-md border border-app-primary">
            <Text className="typography-copy text-app-primary text-center">
              💡 Sign in to sync your progress across devices and get personalized stats!
            </Text>
          </View>
        </Pressable>
      )}

      {/* Counter Display - using exact original styling */}
      <View className="bg-app-white py-xs px-lg my-sm mx-lg rounded-md border border-app-secondary shadow-app-small">
        <Text className="typography-header text-center text-app-accent mb-sm">
          Global Count: {globalCount.toLocaleString()}
        </Text>
        <Text className="typography-subheader text-center text-app-primary mb-sm">
          Your Contributions: {userCount.toLocaleString()}
        </Text>
        {!isLoggedIn && anonymousId && (
          <Text className="typography-mono text-app-brown text-center">
            Anonymous ID: {anonymousId.slice(-8)}
          </Text>
        )}
        {isLoggedIn && anonymousId && (
          <Text className="typography-mono text-app-brown text-center">
            Anonymous ID: {anonymousId.slice(-8)}
          </Text>
        )}
        {lastUpdated && (
          <Text className="typography-copy text-app-brown text-center mb-sm">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </Text>
        )}
      </View>

      {/* Display the Error Message component if there is an error */}
      {(pokemonError || eventError) && (
        <ErrorMessage 
          title='Oh no something went wrong!' 
          description={pokemonError ? "Failed to load event data." : "Failed to update event counter."}
          error={pokemonError || eventError}
        />
      )}

      {/* Tera Type - using exact original styling */}
      <View className="my-md flex-row justify-center">
        <Text className="typography-header mb-md text-center text-app-text px-lg">
          {teraType} Tera Type
        </Text>
        <Pressable onPress={() => setShowBaseStats(!showBaseStats)}>
          <Text className="typography-copy-bold text-app-primary text-center my-sm">
            {showBaseStats ? 'Hide base stats' : 'Show base stats'}
          </Text>
        </Pressable>
      </View>

      {/* Base Stats Section - using exact original styling with dynamic colors */}
      {(pokemonStats && showBaseStats) && (
        <View className="bg-app-white my-md p-md rounded-md border border-app-secondary shadow-app-small self-center" style={{ width: getStatsContainerWidth() }}>
          <Text className="typography-subheader text-center text-app-text mb-md">Base Stats</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.hp) }}>
              <Text className="typography-copy text-app-text mb-xs">HP</Text>
              <Text className="typography-copy-bold text-app-text">{pokemonStats.hp}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.attack) }}>
              <Text className="typography-copy text-app-text mb-xs">Attack</Text>
              <Text className="typography-copy-bold text-app-text">{pokemonStats.attack}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.defense) }}>
              <Text className="typography-copy text-app-text mb-xs">Defense</Text>
              <Text className="typography-copy-bold text-app-text">{pokemonStats.defense}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.specialAttack) }}>
              <Text className="typography-copy text-app-text mb-xs">Sp. Atk</Text>
              <Text className="typography-copy-bold text-app-text">{pokemonStats.specialAttack}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.specialDefense) }}>
              <Text className="typography-copy text-app-text mb-xs">Sp. Def</Text>
              <Text className="typography-copy-bold text-app-text">{pokemonStats.specialDefense}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.speed) }}>
              <Text className="typography-copy text-app-text mb-xs">Speed</Text>
              <Text className="typography-copy-bold text-app-text">{pokemonStats.speed}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Congratulatory Banner - using exact original styling */}
      {globalCount >= targetCount && (
        <View className={cn(
          "my-md mx-lg p-lg rounded-md border-2 items-center",
          globalCount >= maxRewards 
            ? "bg-app-background border-app-secondary" 
            : "bg-app-background border-app-accent"
        )}>
          <Text className={cn(
            "typography-subheader text-center mb-md",
            globalCount >= maxRewards ? "text-orange-600" : "text-app-accent"
          )}>
            🎉 {globalCount >= maxRewards ? 'MAXIMUM REWARDS UNLOCKED!' : 'MILESTONE REACHED!'} 🎉
          </Text>
          <Text className={cn(
            "typography-copy text-center mb-sm",
            globalCount >= maxRewards ? "text-orange-800" : "text-app-text"
          )}>
            {globalCount >= maxRewards 
              ? `Incredible! We've defeated ${pokemonName} ${globalCount.toLocaleString()} times! All bonus rewards have been unlocked!`
              : `Amazing! We've surpassed ${targetCount.toLocaleString()} defeats! Keep going to unlock even more bonus rewards!`
            }
          </Text>
          <Text className={cn(
            "typography-copy text-center italic",
            globalCount >= maxRewards ? "text-orange-600" : "text-app-brown"
          )}>
            Don&apos;t forget to claim your {pokemonName} from Mystery Gift between {formatUserFriendlyDate(distributionStart)} and {formatUserFriendlyDate(distributionEnd)}!
          </Text>
          <View className="bg-app-background mx-lg my-md p-md rounded-md border border-app-secondary">
            <Text className="typography-copy-bold text-app-brown text-center mb-sm">
              Bonus Rewards Unlocked: {getBonusRewards()}
            </Text>
            <Text className="typography-copy text-app-brown text-center">
              Every 100,000 defeats beyond {targetCount.toLocaleString()} unlocks additional rewards!
            </Text>
          </View>
        </View>
      )}

      {/* Progress Bar - using exact original styling */}
      <View className="mx-lg my-md">
        <View className="h-5 bg-app-secondary rounded-lg overflow-hidden">
          <View 
            className="h-full bg-app-accent rounded-lg"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </View>
        <Text className="text-center mt-sm typography-copy-bold text-app-accent">
          {getProgressPercentage().toFixed(3)}% Complete
        </Text>
      </View>

      {/* Error Message - using exact original styling */}
      {error && (
        <Text className="typography-copy text-red-500 text-center my-md px-lg">{error}</Text>
      )}

      {/* Action Button - using exact original styling */}
      <View className="items-center my-md">
        <Pressable
          className={cn(
            "py-md px-xxl rounded-md mb-md min-w-[200px] items-center",
            isButtonDisabled() 
              ? "bg-app-brown opacity-60" 
              : "bg-app-accent"
          )}
          onPress={incrementCounter}
          disabled={isButtonDisabled()}
        >
          <Text className={cn(
            "text-app-white typography-cta",
            isButtonDisabled() && "opacity-80"
          )}>
            {loading ? 'Updating...' : 
             status === 'upcoming' ? `Event starts ${formatUserFriendlyDate(startDate)}` :
             status === 'ended' ? 'Event has ended' :
             `Defeated ${pokemonName}`}
          </Text>
        </Pressable>
        <Text className="typography-copy text-center mx-lg text-app-brown">{eventDescription}</Text>
      </View>

      {/* Event Status and Countdown - using exact original styling */}
      <View className={cn(
        "bg-app-white mx-lg my-md p-md rounded-md border-2 items-center shadow-app-small",
        status === 'active' ? "border-app-accent bg-app-background" :
        status === 'upcoming' ? "border-app-secondary bg-app-background" : 
        "border-app-brown bg-app-background"
      )}>
        <Text className="typography-subheader mb-sm text-app-text">
          {status === 'active' ? '🟢 EVENT ACTIVE' :
           status === 'upcoming' ? '🟡 UPCOMING EVENT' : '🔴 EVENT ENDED'}
        </Text>
        <Text className="typography-copy-bold mb-sm text-app-text text-center">
          {getCountdownText()}
        </Text>
        <Text className="typography-copy text-app-brown text-center italic">
          {formatUserFriendlyDate(startDate)} - {formatUserFriendlyDate(endDate)}
        </Text>
      </View>
    </ScrollView>
  );
};