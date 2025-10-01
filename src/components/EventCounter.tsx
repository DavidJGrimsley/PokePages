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
import { buildApiUrl } from '~/utils/apiConfig';
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

interface EventData {
  id: string;
  eventKey: string;
  pokemonName: string;
  totalCount: number;
  targetCount: number;
  maxRewards: number;
  startDate: string;
  endDate: string;
  updatedAt: string;
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
  apiUrl?: string; // Optional custom API URL
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
  colorScheme = 'light',
  apiUrl = buildApiUrl('')
}) => {
  const { user, isLoggedIn } = useAuthStore();
  const [eventData, setEventData] = useState<EventData | null>(null);
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
       
        const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || 
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

  // Fetch event data from API
  const fetchEventData = React.useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/events/${eventKey}`);
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        setEventData(data);
        setGlobalCount(data.totalCount || 0);
        setLastUpdated(data.updatedAt);
        setError('');
        setEventError('');
      } else {
        setEventError(result.error || 'Failed to fetch event data');
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      setEventError('Failed to connect to API server');
    }
  }, [apiUrl, eventKey]);

  // Fetch user participation from API
  const fetchUserParticipation = React.useCallback(async () => {
    if (!eventData?.id) return;
    
    try {
      const userId = isLoggedIn && user ? user.id : null;
      const anonId = !isLoggedIn && anonymousId ? anonymousId : null;
      
      if (!userId && !anonId) return;
      
      const endpoint = userId 
        ? `${apiUrl}/events/${eventKey}/participation/${userId}`
        : `${apiUrl}/events/${eventKey}/participation/anonymous/${anonId}`;
        
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success && result.data) {
        setUserCount(result.data.contributionCount || 0);
      }
    } catch (err) {
      console.error('Error fetching user participation:', err);
    }
  }, [apiUrl, eventKey, eventData?.id, isLoggedIn, user, anonymousId]);

  // Load event data and user participation
  useEffect(() => {
    if (eventKey) {
      fetchEventData();
    }
  }, [eventKey, fetchEventData]);

  useEffect(() => {
    if (eventData && (isLoggedIn || anonymousId)) {
      fetchUserParticipation();
    }
  }, [eventData, isLoggedIn, anonymousId, fetchUserParticipation]);

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
    if (!eventData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${apiUrl}/events/${eventKey}/increment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: isLoggedIn && user ? user.id : undefined,
          anonymousId: !isLoggedIn && anonymousId ? anonymousId : undefined
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state with new values
        setEventData(result.data.event);
        setGlobalCount(result.data.event.totalCount);
        setUserCount(result.data.userContribution);
        setLastUpdated(result.data.event.updatedAt);
        showAlert('Success!', `Counter incremented! You've contributed ${result.data.userContribution} times.`);
      } else {
        throw new Error(result.error || 'Failed to increment counter');
      }
      
    } catch (err) {
      console.error('Error incrementing counter:', err);
      setError(err instanceof Error ? err.message : 'Failed to increment counter');
      showAlert('Error', 'Failed to increment counter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    const target = eventData?.targetCount || targetCount;
    return Math.min(Number(((globalCount / target) * 100).toFixed(3)), 100);
  };

  const getBonusRewards = () => {
    const target = eventData?.targetCount || targetCount;
    const maxRew = eventData?.maxRewards || maxRewards;
    const bonusLevels = Math.floor((globalCount - target) / 100000);
    return Math.min(bonusLevels, (maxRew - target) / 100000);
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
      {(() => {
        const target = eventData?.targetCount || targetCount;
        const maxRew = eventData?.maxRewards || maxRewards;
        return globalCount >= target && (
          <View className={cn(
            "my-md mx-lg p-lg rounded-md border-2 items-center",
            globalCount >= maxRew 
              ? "bg-app-background border-app-secondary" 
              : "bg-app-background border-app-accent"
          )}>
            <Text className={cn(
              "typography-subheader text-center mb-md",
              globalCount >= maxRew ? "text-orange-600" : "text-app-accent"
            )}>
              🎉 {globalCount >= maxRew ? 'MAXIMUM REWARDS UNLOCKED!' : 'MILESTONE REACHED!'} 🎉
            </Text>
            <Text className={cn(
              "typography-copy text-center mb-sm",
              globalCount >= maxRew ? "text-orange-800" : "text-app-text"
            )}>
              {globalCount >= maxRew 
                ? `Incredible! We've defeated ${pokemonName} ${globalCount.toLocaleString()} times! All bonus rewards have been unlocked!`
                : `Amazing! We've surpassed ${target.toLocaleString()} defeats! Keep going to unlock even more bonus rewards!`
              }
            </Text>
            <Text className={cn(
              "typography-copy text-center italic",
              globalCount >= maxRew ? "text-orange-600" : "text-app-brown"
            )}>
              Don&apos;t forget to claim your {pokemonName} from Mystery Gift between {formatUserFriendlyDate(distributionStart)} and {formatUserFriendlyDate(distributionEnd)}!
            </Text>
            <View className="bg-app-background mx-lg my-md p-md rounded-md border border-app-secondary">
              <Text className="typography-copy-bold text-app-brown text-center mb-sm">
                Bonus Rewards Unlocked: {getBonusRewards()}
              </Text>
              <Text className="typography-copy text-app-brown text-center">
                Every 100,000 defeats beyond {target.toLocaleString()} unlocks additional rewards!
              </Text>
            </View>
          </View>
        );
      })()}

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