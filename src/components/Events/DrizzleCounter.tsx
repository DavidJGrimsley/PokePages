import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  Pressable, 
  Platform,
  Alert
} from 'react-native';
import { useAuthStore } from '~/store/authStore';
import { cn } from '~/utils/cn';

// Cross-platform alert function
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

interface DrizzleCounterProps {
  pokemon: string; // Event key like 'wo-chien', 'chi-yu', etc.
  apiUrl?: string; // Optional custom API URL
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

const DrizzleCounter: React.FC<DrizzleCounterProps> = ({ 
  pokemon, 
  apiUrl = 'http://localhost:3001/api' 
}) => {
  const { user, isLoggedIn } = useAuthStore();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [userContribution, setUserContribution] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anonymousId, setAnonymousId] = useState('');

  // Generate anonymous ID for non-logged-in users
  const generateAnonymousId = () => {
    return 'drizzle_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  };

  // Fetch event data
  const fetchEventData = React.useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/events/${pokemon}`);
      const result = await response.json();
      
      if (result.success) {
        setEventData(result.data);
      } else {
        setError(result.error || 'Failed to fetch event data');
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError('Failed to connect to API server');
    }
  }, [apiUrl, pokemon]);

  // Fetch user participation
  const fetchUserParticipation = React.useCallback(async () => {
    if (!isLoggedIn || !user?.id) return;
    
    try {
      const response = await fetch(`${apiUrl}/events/${pokemon}/participation/${user.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setUserContribution(result.data.contributionCount || 0);
      }
    } catch (err) {
      console.error('Error fetching user participation:', err);
    }
  }, [apiUrl, pokemon, isLoggedIn, user?.id]);

  // Initialize anonymous ID
  useEffect(() => {
    if (!isLoggedIn) {
      const storageKey = `drizzle_anonymous_id_${pokemon}`;
      let storedId = localStorage.getItem(storageKey);
      
      if (!storedId) {
        storedId = generateAnonymousId();
        localStorage.setItem(storageKey, storedId);
      }
      
      setAnonymousId(storedId);
    }
  }, [isLoggedIn, pokemon]);

  // Load initial data
  useEffect(() => {
    if (pokemon) {
      fetchEventData();
      fetchUserParticipation();
    }
  }, [pokemon, fetchEventData, fetchUserParticipation]);

  // Increment counter
  const incrementCounter = async () => {
    if (!eventData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${apiUrl}/events/${pokemon}/increment`, {
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
        setUserContribution(result.data.userContribution);
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
    if (!eventData) return 0;
    return Math.min(Number(((eventData.totalCount / eventData.targetCount) * 100).toFixed(1)), 100);
  };

  if (!eventData) {
    return (
      <View className="bg-app-white p-md rounded-md border border-app-secondary shadow-app-small mx-lg my-md">
        <Text className="typography-header text-center text-app-text">
          {error || 'Loading Drizzle Counter...'}
        </Text>
        {error && (
          <Pressable 
            onPress={fetchEventData}
            className="bg-app-primary py-sm px-md rounded-md items-center mt-sm"
          >
            <Text className="typography-copy text-app-white">Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="bg-app-white p-md rounded-md border border-app-secondary shadow-app-small mx-lg my-md">
      {/* Header */}
      <View className="items-center mb-md">
        <Text className="typography-header text-center text-app-accent mb-xs">
          🔥 Drizzle-Powered Counter
        </Text>
        <Text className="typography-subheader text-center text-app-text">
          {eventData.pokemonName}
        </Text>
      </View>

      {/* Counter Display */}
      <View className="bg-app-background p-md rounded-md mb-md">
        <Text className="typography-header text-center text-app-accent mb-sm">
          Global Count: {eventData.totalCount.toLocaleString()}
        </Text>
        <Text className="typography-subheader text-center text-app-primary mb-sm">
          Your Contributions: {userContribution.toLocaleString()}
        </Text>
        
        {/* Progress Bar */}
        <View className="mt-md">
          <View className="h-3 bg-app-secondary rounded-lg overflow-hidden">
            <View 
              className="h-full bg-app-accent rounded-lg transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </View>
          <Text className="text-center mt-xs typography-copy text-app-brown">
            {getProgressPercentage()}% of {eventData.targetCount.toLocaleString()} goal
          </Text>
        </View>
      </View>

      {/* User Info */}
      {!isLoggedIn && (
        <View className="bg-yellow-50 border border-yellow-200 p-sm rounded-md mb-md">
          <Text className="typography-copy text-yellow-800 text-center text-xs">
            🔄 Using Drizzle API • Anonymous ID: {anonymousId.slice(-8)}
          </Text>
        </View>
      )}

      {isLoggedIn && (
        <View className="bg-green-50 border border-green-200 p-sm rounded-md mb-md">
          <Text className="typography-copy text-green-800 text-center text-xs">
            ✅ Authenticated via Drizzle API • User ID: {user?.id?.slice(-8)}
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View className="bg-red-50 border border-red-200 p-sm rounded-md mb-md">
          <Text className="typography-copy text-red-800 text-center text-xs">
            ❌ {error}
          </Text>
        </View>
      )}

      {/* Action Button */}
      <Pressable
        className={cn(
          "py-md px-lg rounded-md items-center transition-all duration-200",
          loading 
            ? "bg-app-brown opacity-60" 
            : "bg-app-accent"
        )}
        onPress={incrementCounter}
        disabled={loading}
      >
        <Text className="typography-cta text-app-white">
          {loading ? 'Incrementing...' : `Defeat ${eventData.pokemonName}!`}
        </Text>
        <Text className="typography-copy text-app-white opacity-80 text-xs mt-xs">
          Powered by Drizzle ORM + Express
        </Text>
      </Pressable>

      {/* Last Updated */}
      <Text className="typography-copy text-app-brown text-center mt-sm text-xs">
        Last updated: {new Date(eventData.updatedAt).toLocaleTimeString()}
      </Text>
    </View>
  );
};

export default DrizzleCounter;