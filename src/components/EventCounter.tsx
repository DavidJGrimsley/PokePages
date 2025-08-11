import React, { useState, useEffect } from 'react';
import { 
  Text, 
  StyleSheet, 
  View, 
  ScrollView, 
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
  apiEndpoint?: string;
  startDate: string;
  endDate: string;
  distributionStart: string;
  distributionEnd: string;
  targetCount: number;
  maxRewards: number;
  colorScheme?: 'light' | 'dark';
}

interface CounterData {
  count: number;
  playerCount: number;
  lastUpdated: string;
}

export const EventCounter: React.FC<EventCounterProps> = ({
  pokemonName,
  pokemonId,
  teraType,
  eventTitle,
  eventDescription,
  apiEndpoint,
  startDate,
  endDate,
  distributionStart,
  distributionEnd,
  targetCount,
  maxRewards,
  colorScheme = 'light'
}) => {
  const [globalCount, setGlobalCount] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [playerId, setPlayerId] = useState('');
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
    // Pokemon stats typically range from 1-255, with most being 20-180
    // Normalize to 0-1 range for color calculation
    const normalized = Math.min(statValue / 180, 1); // 180 is considered "high"
    
    if (normalized <= 0.5) {
      // Red to Orange (0-0.5)
      const redToOrange = normalized * 2;
      const red = 220;
      const green = Math.floor(120 * redToOrange);
      return `rgb(${red}, ${green}, 50)`;
    } else {
      // Orange to Forest Green (0.5-1)
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
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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

  // API base URL - you can modify this based on your backend
  const API_BASE = apiEndpoint || 'https://api.pokepages.app';

  const storageKey = `pokemon_event_${pokemonName.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Sanitize pokemon name for API calls (same logic as server)
  const sanitizedPokemonName = pokemonName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  // Generate or retrieve player ID
  const generatePlayerId = () => {
    return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
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

  // Fetch Pokemon data using pokenode-ts
  useEffect(() => {
    const initialize = async () => {
      try {
        let storedPlayerId = await getStorageItem(`${storageKey}_player_id`);
        let storedPlayerCount = await getStorageItem(`${storageKey}_player_count`);
        
        if (!storedPlayerId) {
          storedPlayerId = generatePlayerId();
          await setStorageItem(`${storageKey}_player_id`, storedPlayerId);
          await setStorageItem(`${storageKey}_player_count`, '0');
          storedPlayerCount = '0';
        }
        
        setPlayerId(storedPlayerId);
        setPlayerCount(parseInt(storedPlayerCount || '0'));
      } catch (error) {
        console.error('Error initializing player:', error);
        const fallbackId = generatePlayerId();
        setPlayerId(fallbackId);
        setPlayerCount(0);
      }
    };

    const loadPokemonData = async () => {
      try {
        // Create PokemonClient instance
        const pokemonClient = new PokemonClient();
        
        // Fetch Pokemon data using pokenode-ts
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
        
        // Get shiny image with proper null checking
        const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_shiny || 
                        pokemon.sprites.front_shiny || 
                        pokemon.sprites.front_default || '';
        setPokemonImage(imageUrl);
        console.log(`Pokemon image URL: ${imageUrl}`);
        
        // Extract base stats with proper typing
        const stats: PokemonStats = {
          hp: pokemon.stats.find((stat: any) => stat.stat.name === 'hp')?.base_stat || 0,
          attack: pokemon.stats.find((stat: any) => stat.stat.name === 'attack')?.base_stat || 0,
          defense: pokemon.stats.find((stat: any) => stat.stat.name === 'defense')?.base_stat || 0,
          specialAttack: pokemon.stats.find((stat: any) => stat.stat.name === 'special-attack')?.base_stat || 0,
          specialDefense: pokemon.stats.find((stat: any) => stat.stat.name === 'special-defense')?.base_stat || 0,
          speed: pokemon.stats.find((stat: any) => stat.stat.name === 'speed')?.base_stat || 0,
        };
        
        setPokemonStats(stats);
        console.log(`Loaded data for ${pokemon.name}:`, pokemon);
        
      } catch (error) {
        console.error('Error in loadPokemonData:', error);
        setPokemonImage('');
        setPokemonStats(null);
      } finally {
        setImageLoading(false);
      }
    };

    initialize();
    loadPokemonData();
  }, [pokemonId, storageKey]);

  // Load counter data
  useEffect(() => {
    if (!playerId) return;

    const loadCounter = async () => {
      try {
        const url = `${API_BASE}/counter/${sanitizedPokemonName}/player/${playerId}`;
        console.log('Fetching counter from:', url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch counter: ${response.status} ${response.statusText}`);
        
        const data: CounterData = await response.json();
        console.log('Counter data received:', data);
        
        setGlobalCount(data.count);
        setPlayerCount(data.playerCount);
        setLastUpdated(data.lastUpdated);
        setError('');
        
        await setStorageItem(`${storageKey}_player_count`, data.playerCount.toString());
      } catch (error) {
        console.error('Failed to fetch counter:', error);
        setError(`Failed to load counter: ${error instanceof Error ? error.message : 'Unknown error'}. Using offline mode.`);
      }
    };

    loadCounter();
    const interval = setInterval(loadCounter, 30000);
    return () => clearInterval(interval);
  }, [playerId, API_BASE, storageKey, sanitizedPokemonName]);

  const incrementCounter = async () => {
    setLoading(true);
    setError('');
    
    try {
      const url = `${API_BASE}/counter/${sanitizedPokemonName}/increment`;
      console.log('Incrementing counter at:', url);
      console.log('With playerId:', playerId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      
      if (!response.ok) throw new Error(`Failed to increment counter: ${response.status} ${response.statusText}`);
      
      const data: CounterData = await response.json();
      console.log('Increment response:', data);
      
      setGlobalCount(data.count);
      setPlayerCount(data.playerCount);
      setLastUpdated(data.lastUpdated);
      
      await setStorageItem(`${storageKey}_player_count`, data.playerCount.toString());
    } catch (error) {
      console.error('Failed to increment counter:', error);
      setError(`Failed to update counter: ${error instanceof Error ? error.message : 'Unknown error'}. Please contact me for assistance at MrDJ@PokePages.app.`);
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
            Don&apos;t forget to claim your {pokemonName} from Mystery Gift between {distributionStart} and {distributionEnd}!
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
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {/* Counter Display */}
      <View style={styles.counterContainer}>
        <Text style={styles.counter}>
          Global Count: {globalCount.toLocaleString()}
        </Text>
        <Text style={styles.playerCounter}>
          Your Contributions: {playerCount.toLocaleString()}
        </Text>
        {playerId && (
          <Text style={styles.playerId}>
            Player ID: {playerId.slice(-8)}
          </Text>
        )}
        {/* Last Updated */}
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </Text>
        )}
      </View>

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
});
