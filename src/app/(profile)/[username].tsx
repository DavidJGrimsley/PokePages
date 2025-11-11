import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, ScrollView, Image, Linking, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '~/store/authStore';
import { ScreenContent } from 'components/UI/ScreenContent';
import { Button } from 'components/UI/Button';
import { buildApiUrl } from '~/utils/apiConfig';
import * as socialApi from '~/utils/socialApi';
import { Ionicons } from '@expo/vector-icons';

interface ProfileData {
  id: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLink: string | null;
}

interface CatchData {
  id: string;
  pokemonId: number;
  storagePath: string;
  caughtAt: string;
  notes: string | null;
}

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user, session } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [catches, setCatches] = useState<CatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [friendRequestPending, setFriendRequestPending] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      // fetchCatches(); // TODO: Add catches endpoint or remove feature
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Check friendship status after profile is loaded (need the userId)
  useEffect(() => {
    if (profile?.id && user?.id) {
      checkFriendshipStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, user?.id]);

  const fetchUserProfile = async () => {
    try {
      console.log('🔍 Fetching profile for username:', username);
      const response = await fetch(buildApiUrl(`profiles/by-username/${username}`), {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      const result = await response.json();
      console.log('📥 Profile fetch result:', result);
      if (result.success) {
        console.log('✅ Profile loaded:', result.data);
        setProfile(result.data);
      } else {
        console.error('❌ Profile not found:', result.error);
        setProfile(null);
      }
    } catch (error) {
      console.error('💥 Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatches = async () => {
    if (!profile?.id) return;
    try {
      const response = await fetch(buildApiUrl(`catches/${profile.id}`), {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setCatches(result.data);
      }
    } catch (error) {
      console.error('Error fetching catches:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user?.id || !profile?.id) return;
    
    // Don't check friendship status if viewing your own profile
    if (user.id === profile.id) {
      console.log('👤 Viewing own profile, skipping friendship check');
      return;
    }
    
    try {
      // Use the checkFriendshipStatus API
      const friendship = await socialApi.checkFriendshipStatus(user.id, profile.id);
      console.log('Friendship status:', friendship);
      
      if (friendship) {
        if (friendship.status === 'accepted') {
          setIsFriend(true);
          setFriendRequestPending(false);
        } else if (friendship.status === 'pending') {
          setIsFriend(false);
          // Check if we're the requester (we sent the request)
          setFriendRequestPending(friendship.requesterId === user.id);
        }
      } else {
        setIsFriend(false);
        setFriendRequestPending(false);
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user?.id || !profile?.id) return;
    
    try {
      await socialApi.sendFriendRequest(user.id, profile.id);
      setFriendRequestPending(true);
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send friend request');
    }
  };

  const handleUnfriend = async () => {
    if (!user?.id || !profile?.id) return;

    // Web fallback since Alert.alert is a no-op in some web builds
    if (Platform.OS === 'web') {
      const ok = window.confirm(`Remove ${profile.username || 'this user'} from your friends?`);
      if (!ok) return;
      try {
        await socialApi.unfriend(user.id, profile.id);
        setIsFriend(false);
        Alert.alert('Success', 'Unfriended successfully');
      } catch (error) {
        console.error('Error unfriending:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unfriend');
      }
      return;
    }

    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${profile?.username || 'this person'} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialApi.unfriend(user.id, profile.id);
              setIsFriend(false);
              Alert.alert('Success', 'Unfriended successfully');
            } catch (error) {
              console.error('Error unfriending:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unfriend');
            }
          },
        },
      ]
    );
  };

  const handleBlock = async () => {
    if (!user?.id || !profile?.id) return;
    
    try {
      await socialApi.blockUser(user.id, profile.id);
      setIsBlocked(true);
      setIsFriend(false);
      Alert.alert('Success', 'User blocked');
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to block user');
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !profile?.id) return;
    try {
      // Send a lightweight starter message to create (or reuse) conversation
      const starter = await socialApi.sendMessage(user.id, profile.id, '👋');
      const conversationId = (starter as any).conversationId;
      if (conversationId) {
        router.push(`/social/conversations/${conversationId}`);
      } else {
        // Fallback to messages tab if conversation id missing
        router.push('/(drawer)/social/(tabs)/messages');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start conversation');
    }
  };

  const handleSocialLinkPress = () => {
    if (profile?.socialLink) {
      Linking.openURL(profile.socialLink).catch(() => {
        Alert.alert('Error', 'Could not open link');
      });
    }
  };

  if (loading) {
    return (
      <ScreenContent path="app/(profile)/[username].tsx" title="Profile">
        <Text className="text-center mt-10">Loading...</Text>
      </ScreenContent>
    );
  }

  if (!profile) {
    return (
      <ScreenContent path="app/(profile)/[username].tsx" title="Profile">
        <Text className="text-center mt-10 text-gray-500">User not found</Text>
      </ScreenContent>
    );
  }

  const wordCount = profile.bio ? profile.bio.trim().split(/\s+/).length : 0;

  return (
    <>
      <ScreenContent path="app/(profile)/[username].tsx" title={profile.username || 'User Profile'}>
        <ScrollView className="flex-1 px-4">
          {/* Profile Header */}
          <View className="items-center mt-6 mb-8">
            {profile.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="w-32 h-32 rounded-full border-4 border-amber-500"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-gray-300 border-4 border-amber-500 items-center justify-center">
                <Text className="text-4xl text-gray-600">
                  {profile.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <Text className="text-2xl font-bold mt-4 text-gray-800">
              {profile.username || 'Unknown User'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="mb-6 gap-3">
            {/* Only show friend/block buttons if viewing someone else's profile */}
            {user?.id !== profile.id && (
              <>
                {/* Friend Status Button */}
                {isFriend ? (
                  <TouchableOpacity
                    onPress={handleUnfriend}
                    className="p-4 bg-gray-300 dark:bg-gray-600 rounded-full items-center"
                  >
                    <Text className="typography-label text-gray-600 dark:text-gray-300 font-semibold">
                      Friends ✓
                    </Text>
                  </TouchableOpacity>
                ) : friendRequestPending ? (
                  <View className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <Text className="typography-label text-center text-gray-600 dark:text-gray-400">
                      Friend Request Pending
                    </Text>
                  </View>
                ) : !isBlocked ? (
                  <Button
                    title="Add Friend"
                    onPress={handleSendFriendRequest}
                  />
                ) : null}

                {/* Message Button (only for friends) */}
                {isFriend && (
                  <Button
                    title="Send Message"
                    onPress={handleSendMessage}
                  />
                )}

                {/* Block Button */}
                {!isBlocked ? (
                  <TouchableOpacity
                    onPress={handleBlock}
                    className="p-4 border-2 border-red-500 rounded-full items-center"
                  >
                    <Text className="typography-label text-red-500 font-semibold">Block User</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="p-4 bg-red-200 dark:bg-red-900/30 rounded-full">
                    <Text className="typography-label text-center text-red-800 dark:text-red-400">
                      User Blocked
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Show "Edit Profile" button if viewing your own profile */}
            {user?.id === profile.id && (
              <Button
                title="Edit Profile"
                onPress={() => router.push('/(profile)/editProfile')}
              />
            )}
          </View>

          {/* Bio Section */}
          <View className="mb-6 border-2 border-amber-500 rounded-3xl p-4 bg-white">
            <Text className="text-lg font-bold text-gray-800 mb-2">About</Text>
            {profile.bio ? (
              <>
                <Text className="text-gray-700 leading-6">{profile.bio}</Text>
                <Text className="text-xs text-gray-400 mt-2 text-right">
                  {wordCount} / 50 words
                </Text>
              </>
            ) : (
              <Text className="text-gray-400 italic">No bio available</Text>
            )}
          </View>

          {/* Social Link Section */}
          {profile.socialLink && (
            <View className="mb-6 border-2 border-amber-500 rounded-3xl p-4 bg-white">
              <Text className="text-lg font-bold text-gray-800 mb-2">Connect</Text>
              <TouchableOpacity onPress={handleSocialLinkPress}>
                <Text className="text-blue-500 underline">{profile.socialLink}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Catches Gallery Section */}
          <View className="mb-8 border-2 border-amber-500 rounded-3xl p-4 bg-white">
            <Text className="text-lg font-bold text-gray-800 mb-4">Catches</Text>
            {catches.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {catches.map((catchData) => (
                  <View
                    key={catchData.id}
                    className="w-24 h-24 border-2 border-amber-500 rounded-2xl overflow-hidden bg-gray-100"
                  >
                    <Image
                      source={{ uri: catchData.storagePath }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-400 italic">No catches yet</Text>
            )}
          </View>
        </ScrollView>
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
