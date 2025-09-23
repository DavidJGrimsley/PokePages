import React, { useState, useEffect } from 'react';
import { 
  Text, 
  StyleSheet, 
  View, 
  ScrollView, 
  Alert,
  Pressable, 
  Platform, 
  Image,
  ActivityIndicator,
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

import { useAuthStore } from '~/utils/authStore';
import { theme } from '../../constants/style/theme';
import { getEventStatus } from '~/utils/helperFX';
import ErrorMessage from '~/components/Error';

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

interface CounterData {
  total_count: number;
  user_count: number;
  last_updated: string;
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

        // Debug logs to help track down runtime errors on web
        try {
          console.log('loadPokemonData: fetched pokemon (id):', pokemonId);
          console.log('loadPokemonData: pokemon object preview:', pokemon ? {
            id: (pokemon as any).id,
            name: (pokemon as any).name,
            sprites: (pokemon as any).sprites ? 'hasSprites' : 'noSprites',
          } : null);
          console.log('loadPokemonData: pokemon.stats type:', typeof (pokemon as any)?.stats, 'isArray:', Array.isArray((pokemon as any)?.stats));
        } catch (dbgErr) {
          console.warn('loadPokemonData: debug logging failed:', dbgErr);
        }

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

  // Check if event is active, upcoming, or ended
  // const getEventStatus = () => {
  //   const now = currentTime;
  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
    
  //   if (now < start) return 'upcoming';
  //   if (now > end) return 'ended';
  //   return 'active';
  // };

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
    // const status = getEventStatus();
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

  // Add this inside your component or before making Supabase requests

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pokemon Image */}
      <View style={styles.pokemonImageContainer}>
        {imageLoading ? (
          <LottieView
            source={require('@/assets/lottie/stars.json')}
            autoPlay
            loop
          />
        ) : pokemonImage ? (
          <Image 
            source={{ uri: pokemonImage }} 
            style={styles.pokemonImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{pokemonName}</Text>
          </View>
        )}
      </View>
      {/* Show login prompt for better experience */}
      {!isLoggedIn && (
        <Pressable onPress={() => router.push('/sign-in')}>
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              💡 Sign in to sync your progress across devices and get personalized stats!
            </Text>
          </View>
        </Pressable>
      )}
      {/* Counter Display */}
      <View style={styles.counterContainer}>
        <Text style={styles.counter}>
          Global Count: {globalCount.toLocaleString()}
        </Text>
        <Text style={styles.playerCounter}>
          Your Contributions: {userCount.toLocaleString()}
        </Text>
        {!isLoggedIn && anonymousId && (
          <Text style={styles.playerId}>
            Anonymous ID: {anonymousId.slice(-8)}
          </Text>
        )}
        {isLoggedIn && anonymousId && (
          <Text style={styles.playerId}>
            Anonymous ID: {anonymousId.slice(-8)}
          </Text>
        )}
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
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
      {/* Tera Type */}
      <View style={styles.teraTypeContainer}>
        <Text style={styles.title}>
          {teraType} Tera Type
        </Text>
        <Pressable onPress={() => setShowBaseStats(!showBaseStats)}>
          <Text style={styles.baseStatsToggle}>
            {showBaseStats ? 'Hide base stats' : 'Show base stats'}
          </Text>
        </Pressable>
      </View>
      {/* Base Stats Section */}
      {(pokemonStats && showBaseStats) && (
        <View style={[styles.statsContainer, { width: getStatsContainerWidth() }]}>
          <Text style={styles.statsTitle}>Base Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: getStatColor(pokemonStats.hp) }]}>
              <Text style={styles.statLabel}>HP</Text>
              <Text style={styles.statValue}>{pokemonStats.hp}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: getStatColor(pokemonStats.attack) }]}>
              <Text style={styles.statLabel}>Attack</Text>
              <Text style={styles.statValue}>{pokemonStats.attack}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: getStatColor(pokemonStats.defense) }]}>
              <Text style={styles.statLabel}>Defense</Text>
              <Text style={styles.statValue}>{pokemonStats.defense}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: getStatColor(pokemonStats.specialAttack) }]}>
              <Text style={styles.statLabel}>Sp. Atk</Text>
              <Text style={styles.statValue}>{pokemonStats.specialAttack}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: getStatColor(pokemonStats.specialDefense) }]}>
              <Text style={styles.statLabel}>Sp. Def</Text>
              <Text style={styles.statValue}>{pokemonStats.specialDefense}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: getStatColor(pokemonStats.speed) }]}>
              <Text style={styles.statLabel}>Speed</Text>
              <Text style={styles.statValue}>{pokemonStats.speed}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Congratulatory Banner */}
      {globalCount >= targetCount && (
        <View style={[
          styles.congratsBanner, 
          globalCount >= maxRewards ? styles.maxRewardsBanner : styles.milestoneReachedBanner
        ]}>
          <Text style={[
            styles.congratsTitle,
            globalCount >= maxRewards && { color: '#E65100' }
          ]}>
            🎉 {globalCount >= maxRewards ? 'MAXIMUM REWARDS UNLOCKED!' : 'MILESTONE REACHED!'} 🎉
          </Text>
          <Text style={[
            styles.congratsText,
            globalCount >= maxRewards && { color: '#BF360C' }
          ]}>
            {globalCount >= maxRewards 
              ? `Incredible! We've defeated ${pokemonName} ${globalCount.toLocaleString()} times! All bonus rewards have been unlocked!`
              : `Amazing! We've surpassed ${targetCount.toLocaleString()} defeats! Keep going to unlock even more bonus rewards!`
            }
          </Text>
          <Text style={[
            styles.congratsSubtext,
            globalCount >= maxRewards && { color: '#FF6F00' }
          ]}>
            {"Don't forget to claim your "}{pokemonName}{" from Mystery Gift between "} new Date({distributionStart}{" and "}{distributionEnd}{"!"}
          </Text>
            (
          <View style={styles.bonusContainer}>
            <Text style={styles.bonusTitle}>
              Bonus Rewards Unlocked: {getBonusRewards()}
            </Text>
            <Text style={styles.bonusText}>
              Every 100,000 defeats beyond {targetCount.toLocaleString()} unlocks additional rewards!
            </Text>
          </View>
      )
        </View>
      )}
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {getProgressPercentage().toFixed(3)}% Complete
        </Text>
      </View>
      {/* Error Message */}
      {/* PROBLEM HERE - 'D:\ReactNativeProjec…y\LogBox.web.ts:134 Unexpected text node: . '*/}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.button, 
            isButtonDisabled() && styles.buttonDisabled
          ]}
          onPress={incrementCounter}
          disabled={isButtonDisabled()}
        >
          <Text style={[
            styles.buttonText,
            isButtonDisabled() && styles.buttonTextDisabled
          ]}>
            {loading ? 'Updating...' : 
             status === 'upcoming' ? `Event starts ${formatUserFriendlyDate(startDate)}` :
             status === 'ended' ? 'Event has ended' :
             `Defeated ${pokemonName}`}
          </Text>
        </Pressable>
        <Text style={styles.description}>{eventDescription}</Text>
      </View>
      {/* Event Status and Countdown */}
      <View style={[
        styles.statusContainer,
        status === 'active' ? styles.activeStatus :
        status === 'upcoming' ? styles.upcomingStatus : styles.endedStatus
      ]}>
        <Text style={styles.statusTitle}>
          {status === 'active' ? '🟢 EVENT ACTIVE' :
           status === 'upcoming' ? '🟡 UPCOMING EVENT' : '🔴 EVENT ENDED'}
        </Text>
        <Text style={styles.countdownText}>
          {getCountdownText()}
        </Text>
        <Text style={styles.eventDates}>
          {formatUserFriendlyDate(startDate)} - {formatUserFriendlyDate(endDate)}
        </Text>
      </View>
      {/* Bonus Rewards Info */}
     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  pokemonImageContainer: {
    alignItems: 'center',
    marginVertical: 1,
    height: 200,
    justifyContent: 'center',
  },
  pokemonImage: {
    width: 180,
    height: 180,
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: theme.colors.light.secondary,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.light.accent,
  },
  imagePlaceholderText: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
  },
  title: {
    ...theme.typography.header,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.light.text,
    paddingHorizontal: theme.spacing.lg,
  },
  baseStatsToggle: {
    ...theme.typography.copyBold,
    color: theme.colors.light.primary,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  teraTypeContainer: {
    marginVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressContainer: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  progressBar: {
    height: 20,
    backgroundColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.light.accent,
    borderRadius: theme.borderRadius.lg,
  },
  progressText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    ...theme.typography.copyBold,
    color: theme.colors.light.accent,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.light.accent,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.light.white,
    ...theme.typography.callToAction,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.light.brown,
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: theme.colors.light.white,
    opacity: 0.8,
  },
  statusContainer: {
    backgroundColor: theme.colors.light.white,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  activeStatus: {
    borderColor: theme.colors.light.accent,
    backgroundColor: theme.colors.light.background,
  },
  upcomingStatus: {
    borderColor: theme.colors.light.secondary,
    backgroundColor: theme.colors.light.background,
  },
  endedStatus: {
    borderColor: theme.colors.light.brown,
    backgroundColor: theme.colors.light.background,
  },
  statusTitle: {
    ...theme.typography.subheader,
    marginBottom: theme.spacing.sm,
    color: theme.colors.light.text,
  },
  countdownText: {
    ...theme.typography.copyBold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.light.text,
    textAlign: 'center',
  },
  eventDates: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  description: {
    ...theme.typography.copy,
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
    color: theme.colors.light.brown,
  },
  counterContainer: {
    backgroundColor: theme.colors.light.white,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    ...theme.shadows.small,
  },
  counter: {
    ...theme.typography.header,
    textAlign: 'center',
    color: theme.colors.light.accent,
    marginBottom: theme.spacing.sm,
  },
  playerCounter: {
    ...theme.typography.subheader,
    textAlign: 'center',
    color: theme.colors.light.primary,
    marginBottom: theme.spacing.sm,
  },
  playerId: {
    ...theme.typography.mono,
    color: theme.colors.light.brown,
    textAlign: 'center',
  },
  error: {
    ...theme.typography.copy,
    color: theme.colors.light.red,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  lastUpdated: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  congratsBanner: {
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  milestoneReachedBanner: {
    backgroundColor: theme.colors.light.background,
    borderColor: theme.colors.light.accent,
  },
  maxRewardsBanner: {
    backgroundColor: theme.colors.light.background,
    borderColor: theme.colors.light.secondary,
  },
  congratsTitle: {
    ...theme.typography.subheader,
    textAlign: 'center',
    color: theme.colors.light.accent,
    marginBottom: theme.spacing.md,
  },
  congratsText: {
    ...theme.typography.copy,
    textAlign: 'center',
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  congratsSubtext: {
    ...theme.typography.copy,
    textAlign: 'center',
    color: theme.colors.light.brown,
    fontStyle: 'italic',
  },
  bonusContainer: {
    backgroundColor: theme.colors.light.background,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
  },
  bonusTitle: {
    ...theme.typography.copyBold,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  bonusText: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
  },
  buildsSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    marginHorizontal: 'auto',
    maxWidth: 800,
    width: '90%',
    alignSelf: 'center',
  },
  buildsTitle: {
    ...theme.typography.display,
    textAlign: 'center',
  },
  attacker: {
    color: theme.colors.light.red,
  },
  defender: {
    color: theme.colors.light.accent,
  },
  subSectionTitle: {
    ...theme.typography.header,
    marginBottom: theme.spacing.md,
    textAlign: 'left',
  },
  buildCard: {
    backgroundColor: theme.colors.light.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    ...theme.shadows.small,
  },
  buildTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.accent,
    marginBottom: theme.spacing.xs,
  },
  buildSub: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    marginBottom: 1,
  },
  buildMoves: {
    ...theme.typography.copy,
    color: theme.colors.light.primary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  buildStrategy: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    marginTop: theme.spacing.xs,
  },
  separator: {
    height: 2,
    backgroundColor: theme.colors.light.secondary,
    marginVertical: theme.spacing.md,
    width: '60%',
    alignSelf: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  statsContainer: {
    backgroundColor: theme.colors.light.white,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    ...theme.shadows.small,
    alignSelf: 'center',
  },
  statsTitle: {
    ...theme.typography.subheader,
    textAlign: 'center',
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  statLabel: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    ...theme.typography.copyBold,
    color: theme.colors.light.text,
  },
  loginPrompt: {
    backgroundColor: theme.colors.light.background,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.light.primary,
  },
  loginPromptText: {
    ...theme.typography.copy,
    color: theme.colors.light.primary,
    textAlign: 'center',
  },
});
