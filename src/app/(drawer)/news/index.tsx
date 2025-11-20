import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Container } from '@/src/components/UI/Container';
import { NewsCard } from '@/src/components/Home/NewsCard';
import { fetchNews, type NewsArticle } from '@/src/services/rssService';

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = async (forceRefresh = false) => {
    try {
      setError(null);
      if (!forceRefresh) {
        setLoading(true);
      }
      
      const news = await fetchNews(forceRefresh);
      setArticles(news);
    } catch (err) {
      console.error('[News Page] Load error:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNews(true);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pokémon News' }} />
      <Head>
        <title>Pokémon News | Poké Pages</title>
        <meta name="description" content="Latest Pokémon news, updates, and announcements from PokémonDB." />
      </Head>
      <Container>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Text
            role="heading"
            aria-level={1}
            className="typography-header text-app-secondary mb-md"
          >
            Latest Pokémon News
          </Text>

          {loading ? (
            <View className="flex-1 items-center justify-center py-xl">
              <ActivityIndicator size="large" color="#A33EA1" />
              <Text className="typography-copy text-app-brown mt-md">Loading news...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-xl">
              <Text className="typography-subheader text-red-500 mb-sm">⚠️ {error}</Text>
              <Text className="typography-copy text-app-brown text-center">
                Pull down to refresh
              </Text>
            </View>
          ) : articles.length === 0 ? (
            <View className="flex-1 items-center justify-center py-xl">
              <Text className="typography-subheader text-app-brown">No news available</Text>
            </View>
          ) : (
            <View>
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </View>
          )}
        </ScrollView>
      </Container>
    </>
  );
}
