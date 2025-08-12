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
import { useAuthStore } from '~/utils/authStore';
import { diagnosticChecks } from '~/utils/supabaseDiagnostics';

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
        
        const stats: PokemonStats = {
          hp: pokemon.stats.find((stat: any) => stat.stat.name === 'hp')?.base_stat || 0,
          attack: pokemon.stats.find((stat: any) => stat.stat.name === 'attack')?.base_stat || 0,
          defense: pokemon.stats.find((stat: any) => stat.stat.name === 'defense')?.base_stat || 0,
          specialAttack: pokemon.stats.find((stat: any) => stat.stat.name === 'special-attack')?.base_stat || 0,
          specialDefense: pokemon.stats.find((stat: any) => stat.stat.name === 'special-defense')?.base_stat || 0,
          speed: pokemon.stats.find((stat: any) => stat.stat.name === 'speed')?.base_stat || 0,
        };
        
        setPokemonStats(stats);
        
      } catch (error) {
        console.error('Error in loadPokemonData:', error);
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
      try {
        console.log('🔍 Loading event data for:', eventKey);
        
        // Get event data
        const { data: eventData, error: eventError } = await supabase
          .from('event_counters')
          .select('*')
          .eq('event_key', eventKey)
          .single();

        if (eventError) {
          console.error('❌ Event data error:', eventError);
          throw eventError;
        }

        console.log('✅ Event data loaded:', eventData);

        if (eventData) {
          setGlobalCount(eventData.total_count || 0);
          setLastUpdated(eventData.updated_at);
        }

        // Get user participation with enhanced error handling
        if (isLoggedIn && user) {
          console.log('🔍 Loading user participation...');
          console.log('Event ID:', eventData.id, 'Type:', typeof eventData.id);
          console.log('User ID:', user.id, 'Type:', typeof user.id);
          
          const { data: userParticipation, error: userError, status, statusText } = await supabase
            .from('user_event_participation')
            .select('contribution_count, event_id, user_id')  // Explicitly list columns
            .eq('event_id', eventData.id)
            .eq('user_id', user.id)
            .maybeSingle();  // Use maybeSingle() instead of single() to handle empty results

          console.log('User participation response status:', status);
          console.log('User participation response statusText:', statusText);

          if (userError) {
            console.error('❌ User participation error:', userError);
            console.error('Full error details:', {
              message: userError.message,
              details: userError.details,
              hint: userError.hint,
              code: userError.code
            });
            
            // Don't throw here - this might be expected if user hasn't participated yet
            if (userError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
              console.warn('Unexpected user participation error:', userError);
            }
          }

          if (!userError && userParticipation) {
            console.log('✅ User participation loaded:', userParticipation);
            setUserCount(userParticipation.contribution_count || 0);
          } else {
            console.log('ℹ️ No user participation found (user hasn\'t participated yet)');
            setUserCount(0);
          }
        } else if (anonymousId) {
          // Get anonymous participation
          console.log('🔍 Loading anonymous participation for:', anonymousId);
          
          const { data: anonParticipation, error: anonError } = await supabase
            .from('anonymous_event_participation')
            .select('contribution_count')
            .eq('event_id', eventData.id)
            .eq('anonymous_id', anonymousId)
            .maybeSingle();  // Use maybeSingle() for anonymous participation too

          if (anonError && anonError.code !== 'PGRST116') {
            console.error('❌ Anonymous participation error:', anonError);
          }

          if (!anonError && anonParticipation) {
            console.log('✅ Anonymous participation loaded:', anonParticipation);
            setUserCount(anonParticipation.contribution_count || 0);
          } else {
            console.log('ℹ️ No anonymous participation found');
            setUserCount(0);
          }
        }

        setError('');
      } catch (error) {
        console.error('❌ Failed to load event data:', error);
        setError(`Failed to load event data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Run diagnostics if there's an error
        console.log('🚀 Running diagnostics due to error...');
        if (isLoggedIn && user) {
          await diagnosticChecks.runAllChecks();
        }
      }
    };

    if (eventKey && (isLoggedIn || anonymousId)) {
      loadEventData();
      
      // Set up real-time subscription for event updates
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
            console.log('Event updated:', payload);
            if (payload.new) {
              setGlobalCount(payload.new.total_count || 0);
              setLastUpdated(payload.new.updated_at);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [eventKey, isLoggedIn, user, anonymousId]);

  // Format date to user-friendly format
  const formatUserFriendlyDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zonedDate = toZonedTime(date, userTimeZone);
      
      return format(zonedDate, 'MMMM d, yyyy \'at\' h:mm a') + ' local time';
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date(dateString).toLocaleDateString() + ' local time';
    }
  };

  // Check if event is active, upcoming, or ended
  const getEventStatus = () => {
    const now = currentTime;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  // Get countdown text
  const getCountdownText = () => {
    const now = currentTime;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const status = getEventStatus();
    
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
    const status = getEventStatus();
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
      
      console.log('🚀 Calling increment_counter with params:', params);
      
      const { data, error } = await supabase.rpc('increment_counter', params);
      
      console.log('🔍 increment_counter response:', { data, error });
      
      if (error) {
        console.error('❌ increment_counter error:', error);
        throw error;
      }

      if (data) {
        console.log('📊 increment_counter data:', data);
        
        if (data.success) {
          // The function returns a JSON object
          const eventCounter = data.event_counter;
          const userContribution = data.user_contribution;
          
          console.log('✅ Updating counts:', {
            globalCount: eventCounter.current_count,
            userCount: userContribution
          });
          
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
  // console.log('Supabase session:', supabase.auth.getSession ? await supabase.auth.getSession() : useAuthStore.getState().session);
  console.log('Supabase user:', useAuthStore.getState().user);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pokemon Image */}
      <View style={styles.pokemonImageContainer}>
        {imageLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
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
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>
            💡 Sign in to sync your progress across devices and get personalized stats!
          </Text>
        </View>
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
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </Text>
        )}
      </View>
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
            {"Don't forget to claim your "}{pokemonName}{" from Mystery Gift between "}{distributionStart}{" and "}{distributionEnd}{"!"}
          </Text>
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
      {/* PROBLEM HERE */}
      {/* {error && (
        <Text style={styles.error}>{error}</Text>
      )} */}
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
             getEventStatus() === 'upcoming' ? `Event starts ${formatUserFriendlyDate(startDate)}` :
             getEventStatus() === 'ended' ? 'Event has ended' :
             `Defeated ${pokemonName}`}
          </Text>
        </Pressable>
        <Text style={styles.description}>{eventDescription}</Text>
      </View>
      {/* Event Status and Countdown */}
      <View style={[
        styles.statusContainer,
        getEventStatus() === 'active' ? styles.activeStatus :
        getEventStatus() === 'upcoming' ? styles.upcomingStatus : styles.endedStatus
      ]}>
        <Text style={styles.statusTitle}>
          {getEventStatus() === 'active' ? '🟢 EVENT ACTIVE' :
           getEventStatus() === 'upcoming' ? '🟡 UPCOMING EVENT' : '🔴 EVENT ENDED'}
        </Text>
        <Text style={styles.countdownText}>
          {getCountdownText()}
        </Text>
        <Text style={styles.eventDates}>
          {formatUserFriendlyDate(startDate)} - {formatUserFriendlyDate(endDate)}
        </Text>
      </View>
      {/* Bonus Rewards Info */}
      {globalCount >= targetCount && (
        <View style={styles.bonusContainer}>
          <Text style={styles.bonusTitle}>
            Bonus Rewards Unlocked: {getBonusRewards()}
          </Text>
          <Text style={styles.bonusText}>
            Every 100,000 defeats beyond {targetCount.toLocaleString()} unlocks additional rewards!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#e9ecef',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2c3e50',
    paddingHorizontal: 20,
  },
  baseStatsToggle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginVertical: 8,
  },
  teraTypeContainer: {
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeStatus: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  upcomingStatus: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  endedStatus: {
    borderColor: '#9E9E9E',
    backgroundColor: '#F5F5F5',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center',
  },
  eventDates: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20,
    color: '#6c757d',
    lineHeight: 20,
  },
  counterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  counter: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 8,
  },
  playerCounter: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2196F3',
    marginBottom: 8,
  },
  playerId: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  error: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  congratsBanner: {
    marginVertical: 16,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  milestoneReachedBanner: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  maxRewardsBanner: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  congratsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 12,
  },
  congratsText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1B5E20',
    marginBottom: 8,
    lineHeight: 20,
  },
  congratsSubtext: {
    fontSize: 12,
    textAlign: 'center',
    color: '#388E3C',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  bonusContainer: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
  buildsSection: {
    marginTop: 24,
    marginBottom: 32,
    marginHorizontal: 'auto',
    maxWidth: 800,
    width: '90%',
    alignSelf: 'center',
  },
  buildsTitle: {
    fontSize: 32,
    textAlign: 'center',
  },
  attacker: {
    color: '#d84315',
  },
  defender: {
    color: '#19d285ff',
  },
  subSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'left',
  },
  buildCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  buildTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  buildSub: {
    fontSize: 13,
    color: '#555',
    marginBottom: 1,
  },
  buildMoves: {
    fontSize: 13,
    color: '#1976D2',
    marginTop: 4,
    marginBottom: 2,
  },
  buildStrategy: {
    fontSize: 12,
    color: '#6d4c41',
    marginTop: 2,
  },
  separator: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
    width: '60%',
    alignSelf: 'center',
    borderRadius: 1,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  loginPrompt: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
});
