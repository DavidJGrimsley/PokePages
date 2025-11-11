import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, ScrollView, Image, Linking, TouchableOpacity, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '~/store/authStore';
import { ScreenContent } from 'components/UI/ScreenContent';
import { Button } from 'components/UI/Button';
import { buildApiUrl } from '~/utils/apiConfig';

interface CatchData {
  id: string;
  pokemonId: number;
  storagePath: string;
  caughtAt: string;
  notes: string | null;
}

export default function ProfilePreviewScreen() {
  const { user, session, isLoggedIn, profile } = useAuthStore();
  const [catches, setCatches] = useState<CatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatches = async () => {
      if (!user || !session) return;
      
      try {
        const response = await fetch(buildApiUrl(`catches/${user.id}`), {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setCatches(result.data);
        }
      } catch (error) {
        console.error('Error fetching catches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatches();
  }, [user, session]);

  // Redirect to sign-in if not logged in
  if (!isLoggedIn || !user || !session) {
    return <Redirect href="/sign-in" />;
  }

  const handleSocialLinkPress = () => {
    if (profile?.socialLink) {
      Linking.openURL(profile.socialLink).catch(() => {
        Alert.alert('Error', 'Could not open link');
      });
    }
  };

  const wordCount = profile?.bio ? profile.bio.trim().split(/\s+/).length : 0;

  return (
    <>
      <ScreenContent path="app/(profile)/preview.tsx" title="My Profile">
        <ScrollView className="flex-1 px-4">
          {/* Profile Header */}
          <View className="items-center mt-6 mb-8">
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="w-32 h-32 rounded-full border-4 border-amber-500"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-gray-300 border-4 border-amber-500 items-center justify-center">
                <Text className="text-4xl text-gray-600">
                  {profile?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <Text className="text-2xl font-bold mt-4 text-gray-800">
              {profile?.username || 'No username'}
            </Text>
          </View>

          {/* Edit Profile Button */}
          <View className="mb-6">
            <Button
              title="Edit Profile"
              onPress={() => router.push('/(profile)/editProfile')}
            />
          </View>

          {/* Bio Section */}
          <View className="mb-6 border-2 border-amber-500 rounded-3xl p-4 bg-white">
            <Text className="text-lg font-bold text-gray-800 mb-2">About Me</Text>
            {profile?.bio ? (
              <>
                <Text className="text-gray-700 leading-6">{profile.bio}</Text>
                <Text className="text-xs text-gray-400 mt-2 text-right">
                  {wordCount} / 50 words
                </Text>
              </>
            ) : (
              <Text className="text-gray-400 italic">No bio yet. Add one in Edit Profile!</Text>
            )}
          </View>

          {/* Social Link Section */}
          {profile?.socialLink && (
            <View className="mb-6 border-2 border-amber-500 rounded-3xl p-4 bg-white">
              <Text className="text-lg font-bold text-gray-800 mb-2">Connect</Text>
              <TouchableOpacity onPress={handleSocialLinkPress}>
                <Text className="text-blue-500 underline">{profile.socialLink}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Catches Gallery Section */}
          <View className="mb-8 border-2 border-amber-500 rounded-3xl p-4 bg-white">
            <Text className="text-lg font-bold text-gray-800 mb-4">My Catches</Text>
            {loading ? (
              <Text className="text-gray-500">Loading...</Text>
            ) : catches.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {catches.map((catchData) => (
                  <TouchableOpacity
                    key={catchData.id}
                    className="w-24 h-24 border-2 border-amber-500 rounded-2xl overflow-hidden bg-gray-100"
                  >
                    <Image
                      source={{ uri: catchData.storagePath }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-gray-400 italic">
                No catches yet. Start your Pokémon journey!
              </Text>
            )}
          </View>
        </ScrollView>
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
