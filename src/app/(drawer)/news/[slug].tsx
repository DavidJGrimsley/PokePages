import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Linking, Image } from 'react-native';
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
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Category and Date */}
          <View className="flex-row items-center mb-sm">
            <Text className="text-sm text-red-500 font-bold uppercase">{article.category}</Text>
            <Text className="text-sm text-app-brown dark:text-dark-app-brown ml-sm">
              • {formatDate(article.publishedDate)}
            </Text>
          </View>

          {/* Title */}
          <Text
            role="heading"
            aria-level={1}
            className="typography-header text-app-text dark:text-dark-app-text mb-md"
          >
            {article.title}
          </Text>

          {/* Featured Image */}
          {article.imageUrl && (
            <View className="w-full rounded-lg overflow-hidden mb-md">
              <Image 
                source={{ uri: article.imageUrl }}
                style={{ width: '100%', aspectRatio: 16/9 }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Content Preview */}
          <View className="bg-app-background dark:bg-dark-app-background rounded-lg p-md mb-md border-l-4 border-l-red-500">
            <Text className="typography-copy text-app-text dark:text-dark-app-text leading-relaxed">
              {formatContent(article.content || article.excerpt)}
            </Text>
          </View>

          {/* Read Full Article Button */}
          <Pressable
            className="bg-red-500 py-lg px-lg rounded-lg items-center shadow-app-medium active:opacity-80"
            onPress={handleOpenExternal}
          >
            <Text className="typography-cta text-app-white">Read Full Article on PokémonDB</Text>
          </Pressable>

          {/* Source Attribution */}
          <Text className="text-xs text-app-brown dark:text-dark-app-brown text-center mt-md mb-lg">
            Article source: pokemondb.net
          </Text>
        </ScrollView>
      </Container>
    </>
  );
}
