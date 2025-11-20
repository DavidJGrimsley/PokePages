import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Linking, useWindowDimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Container } from '@/src/components/UI/Container';
import { getArticleById, type NewsArticle } from '@/src/services/rssService';

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Strip HTML and format content for display
 */
function formatContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export default function NewsArticlePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError('Article not found');
        setLoading(false);
        return;
      }

      try {
        const fetchedArticle = await getArticleById(slug);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('[Article Page] Load error:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const handleOpenExternal = async () => {
    if (article?.link) {
      try {
        const supported = await Linking.canOpenURL(article.link);
        if (supported) {
          await Linking.openURL(article.link);
        }
      } catch (err) {
        console.error('[Article Page] Open link error:', err);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A33EA1" />
          <Text className="typography-copy text-app-brown mt-md">Loading article...</Text>
        </View>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <>
        <Stack.Screen options={{ title: 'Article Not Found' }} />
        <Container>
          <View className="flex-1 items-center justify-center p-lg">
            <Text className="typography-header text-red-500 mb-md">⚠️</Text>
            <Text className="typography-subheader text-app-text mb-sm">{error || 'Article not found'}</Text>
            <Pressable
              className="bg-app-accent py-md px-lg rounded-md mt-md"
              onPress={() => router.back()}
            >
              <Text className="typography-cta text-app-background">Go Back</Text>
            </Pressable>
          </View>
        </Container>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: article.title }} />
      <Head>
        <title>{article.title} | Poké Pages</title>
        <meta name="description" content={article.excerpt} />
      </Head>
      <Container>
        <ScrollView
          contentContainerStyle={{ 
            flexGrow: 1, 
            padding: 16,
            maxWidth: width >= 640 ? '90%' : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date */}
          <Text className="text-sm text-red-500 font-bold uppercase mb-sm">
            {formatDate(article.publishedDate)}
          </Text>

          {/* Title */}
          <Text
            role="heading"
            aria-level={1}
            className="typography-header text-app-text dark:text-dark-app-text mb-sm"
          >
            {article.title}
          </Text>

          {/* Side-by-side layout on extra wide screens (>1750px) */}
          <View 
            style={{
              flexDirection: width >= 1750 ? 'row' : 'column',
              gap: width >= 1750 ? 16 : 0,
              alignItems: width >= 1750 ? 'center' : 'stretch',
            }}
          >
            {/* Featured Image */}
            {article.imageUrl && (
              <Pressable
                onPress={() => setImageModalVisible(true)}
                style={{
                  width: width >= 1750 ? '50%' : '100%',
                  // maxWidth: width >= 1750 ? 600 : width >= 1024 ? 800 : width >= 640 ? 600 : '100%',
                  alignSelf: width >= 1750 ? 'flex-start' : 'center',
                }}
              >
                <View className="rounded-lg  shadow-app-medium">
                  <Image 
                    source={{ uri: article.imageUrl }}
                    style={{ 
                      width: '100%', 
                      height: width >= 1024 ? 400 : width >= 640 ? 300 : 250,
                    }}
                    contentFit="contain"
                  />
                </View>
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-xs mb-sm italic">
                  Tap to view full size
                </Text>
              </Pressable>
            )}

            {/* Content Preview */}
            <View 
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-lg mb-md border-l-4 border-l-red-500"
              style={{
                flex: width >= 1750 ? 1 : undefined,
              }}
            >
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-sm">
                Article Preview
              </Text>
              <Text className="typography-copy text-app-text dark:text-dark-app-text leading-relaxed">
                {formatContent(article.content || article.excerpt)}
              </Text>
            </View>
          </View>

          {/* Read Full Article Button */}
          <Pressable
            className="bg-red-600 py-xl px-lg rounded-lg items-center shadow-app-large active:opacity-80 mb-sm"
            onPress={handleOpenExternal}
          >
            <Text className="typography-cta text-white text-lg">📰 Read Full Article on PokémonDB</Text>
            <Text className="text-sm text-white/80 mt-xs">Includes full content, images & videos</Text>
          </Pressable>

          {/* Source Attribution */}
          <Text className="text-xs text-app-brown dark:text-dark-app-brown text-center mt-md mb-lg">
            Article source: pokemondb.net
          </Text>
        </ScrollView>
      </Container>
      
      {/* Full-screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/95 justify-center items-center"
          onPress={() => setImageModalVisible(false)}
        >
          <View className="absolute top-4 right-4 z-10">
            <Pressable 
              className="bg-white/20 rounded-full w-10 h-10 items-center justify-center"
              onPress={() => setImageModalVisible(false)}
            >
              <Text className="text-white text-2xl font-bold">×</Text>
            </Pressable>
          </View>
          
          {article?.imageUrl && (
            <Image 
              source={{ uri: article.imageUrl }}
              style={{ 
                width: '95%', 
                height: '95%',
              }}
              contentFit="contain"
            />
          )}
          
          <Text className="text-white/60 text-sm absolute bottom-4 text-center px-4">
            Tap anywhere to close
          </Text>
        </Pressable>
      </Modal>
    </>
  );
}
