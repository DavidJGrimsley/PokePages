import { Stack, Link } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useFavoriteFeaturesStore } from '@/src/store/favoriteFeaturesStore';

import { Container } from 'components/UI/Container';
import { HomeCards } from '@/src/components/Home/HomeCards';
import { NewsCard } from '@/src/components/Home/NewsCard';
import { eventConfig } from 'constants/eventConfig';
import { Footer } from '@/src/components/Meta/Footer';
import { getRecentNews, type NewsArticle } from '@/src/services/rssService';

const getEventStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

export default function Home() {
  // Use shallow comparator to avoid re-render loop when an array reference changes
  const favoritesObj = useFavoriteFeaturesStore((s) => s.favorites);
  const favorites = useMemo(() => Object.keys(favoritesObj), [favoritesObj]);
  
  // State for news articles
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  
  useEffect(() => {
    console.log('[HOME] Favorite Features:', favorites);
  }, [favorites]);

  // Ensure favorites store initializes and syncs for signed-in users
  useEffect(() => {
    const init = async () => {
      try {
        // Avoid re-initializing if the persisted store has already hydrated
        if (!useFavoriteFeaturesStore.getState()._hasHydrated) {
          await useFavoriteFeaturesStore.getState().initialize();
        }
      } catch (e) {
        console.error('[HOME] favorite store init failed', e);
      }
    };
    init();
  }, []);
  
  // Load recent news articles
  useEffect(() => {
    const loadNews = async () => {
      try {
        console.log('[HOME] Starting news fetch...');
        const articles = await getRecentNews(2);
        console.log('[HOME] News fetch complete. Article count:', articles.length);
        console.log('[HOME] Articles:', JSON.stringify(articles.map(a => ({ id: a.id, title: a.title })), null, 2));
        setNewsArticles(articles);
        // Log excerpt snippet, HTML entity presence and image existence for each article
        articles.forEach((a) => {
          const excerptSnippet = (a.excerpt || '').substring(0, 120);
          const hasAngleBracket = /</.test(a.excerpt || '');
          const hasEncodedLt = /&lt;/.test(a.excerpt || '');
          console.log('[HOME] Article:', {
            id: a.id,
            excerptSnippet,
            hasAngleBracket,
            hasEncodedLt,
            hasImage: !!a.imageUrl,
          });
        });
      } catch (error) {
        console.error('[HOME] Failed to load news:', error);
        console.error('[HOME] Error details:', error instanceof Error ? error.message : String(error));
      } finally {
        setLoadingNews(false);
      }
    };
    loadNews();
  }, []);
  
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // SEO meta content
  const title = 'Poké Pages | The Ultimate Pokémon Companion App';
  const description = 'Join thousands of trainers on Poké Pages, a social and resource hub! Track global Pokémon events, participate in community challenges, access battle strategies, type calculators, and stay updated with the latest Pokémon news and distributions.';
  const keywords = 'Pokemon, Poké Pages, Pokemon events, Pokemon battles, Pokemon community, Pokemon type chart, Pokemon strategies, Pokemon news, Pokemon Scarlet Violet, Legends Z-A, Treasures of Ruin, global challenges, Pokemon counters';
  
  // Generate events from our configuration
  const activeCounterEvents = useMemo(() => 
    Object.entries(eventConfig)
      .map(([key, config]) => ({
        key,
        buttonText: `Join the ${config.pokemonName} Challenge!`,
        href: `/(drawer)/events/${key}` as any,
        status: getEventStatus(config.startDate, config.endDate),
        isActive: getEventStatus(config.startDate, config.endDate) === 'active',
        pokemonName: config.pokemonName,
        endDate: config.endDate,
        teraType: config.teraType,
        targetCount: config.targetCount,
      }))
      .filter(event => event.isActive),
    [] // Empty dependency array means it only calculates once
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Poké Pages' }} />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pokepages.app" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:image" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:secure_url" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Poké Pages - The Ultimate Pokémon Companion App" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://pokepages.app/images/home-preview.png" />
        <meta name="twitter:image:alt" content="Poké Pages - The Ultimate Pokémon Companion App" />
        <meta name="twitter:site" content="@mrdj2u26" />
        <meta name="twitter:creator" content="@gokuscharizard" />  

        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pokepages.app" />
      </Head>
      <Container>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, padding: 0 }}
          showsVerticalScrollIndicator={false}
          >
          {/* Download App Banner */}          
         {!isMobile && (<Link href="/download" asChild>
            <Pressable className="bg-gradient-to-r from-blue-600 to-purple-600 py-md px-lg items-center shadow-app-medium">
              <View className="flex-row items-center">
                <Text className="typography-cta text-app-white mr-sm">📱</Text>
                <View>
                  <Text className="typography-cta text-app-white">Download Poké Pages App</Text>
                  <Text className="text-sm text-app-white opacity-90">Get early access - Sign up now!</Text>
                </View>
              </View>
            </Pressable>
          </Link>)}
          
          
          <View className="p-lg bg-app-background dark:bg-dark-app-background">
            {/* Hero Section */}
            <Text
              role="heading"
              aria-level={1}
              className="text-lg font-semibold text-center text-gray-700 dark:text-app-flag"
            >
              The Ultimate (Unofficial) Pokémon Hub
            </Text>
            <Text
              role="heading"
              aria-level={2}
              className="text-sm font-semibold text-center text-app-text dark:text-dark-app-text mb-lg"
            >
              Your home for Pokémon events, strategies, and community connection
            </Text>

            {/* HomeCards Section */}
            <HomeCards
              newestFeaturePath="/(drawer)/guides/PLZA/dexTracker"
              newestFeatureTitle="Legends Z-A Form Tracker"
            />

            {/* Conditional Events Section */}
            {activeCounterEvents.length > 0 && (
              <>
                <Text
                  role="heading"
                  aria-level={3}
                  className="typography-subheader text-app-secondary mb-sm"
                >
                  Latest Events
                </Text>
                
                {/* Active Event Buttons */}
                {activeCounterEvents.map((event) => (
                  <Link key={event.key} href={event.href} asChild>
                    <Pressable className="bg-red-500 py-lg px-lg rounded-lg items-center mb-sm shadow-app-medium active:opacity-80">
                      <Text className="typography-cta text-app-white text-center mb-xs">{event.buttonText}</Text>
                      <Text className="typography-copy text-app-white text-center opacity-90">Click to contribute to the global counter</Text>
                    </Pressable>
                  </Link>
                ))}
              </>
            )}
                    
            {/* Latest News Section */}
            <View className='items-center'>
              <Text
                role="heading"
                aria-level={3}
                className="typography-subheader text-app-secondary mb-sm"
              >
                Latest News
              </Text>
              
              {loadingNews ? (
                <View className="items-center py-lg">
                  <ActivityIndicator size="large" color="#A33EA1" />
                  <Text className="typography-copy text-app-brown mt-sm">Loading news...</Text>
                </View>
              ) : newsArticles.length > 0 ? (
                <>
                  {newsArticles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                  <Link href="https://pokemondb.net/news" target="_blank" rel="noopener noreferrer" asChild>
                    <Pressable>
                      <Text role="heading" aria-level={4} className="text-xs text-app-brown dark:text-dark-app-brown text-center mb-sm underline">
                        Source: Pokémon DB
                      </Text>
                    </Pressable>
                  </Link>
                  {/* View More News Button */}
                  <View className="items-center mb-lg">
                    <Link href="/(drawer)/news" asChild>
                      <Pressable className="bg-app-accent dark:bg-dark-app-accent  py-md px-lg rounded-md self-center active:opacity-80 hover:shadow-app-medium">
                        <Text className="typography-cta text-app-background dark:text-dark-app-background">View More News</Text>
                      </Pressable>
                    </Link>
                  </View>
                </>
              ) : (
                <View className="bg-app-background p-md rounded-lg mb-lg border-l-4 border-l-red-500">
                  <Text className="typography-subheader text-app-text mb-sm">Stay tuned for Pokémon news!</Text>
                  <Text className="typography-copy text-app-brown">
                    The latest news and updates will appear here. Please check back later or refresh the app.
                  </Text>
                </View>
              )}
              
            </View>
          </View>

          {/* Features Section */}
          <View className="p-lg rounded-lg mb-5 border-t-2 border-b-2 border-app-flag">
            <Text
              role="heading"
              aria-level={3}
              className="typography-header dark:text-app-background text-dark-app-background  mb-md"
            >
              Features
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Global Counters</Text>
                <Text className="text-xs text-app-brown">
                  Track community progress on Pokemon defeat challenges with real-time counters
                </Text>
              </View>
              
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Event Updates</Text>
                <Text className="text-xs text-app-brown">
                  Stay informed about the latest Pokemon events and distribution news
                </Text>
              </View>
              
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Battle Strategies</Text>
                <Text className="text-xs text-app-brown">
                  Get tips and team recommendations for event Pokemon battles
                </Text>
              </View>
              
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Community Driven</Text>
                <Text className="text-xs text-app-brown">
                  Join thousands of trainers working together towards common goals
                </Text>
              </View>
            </View>
          </View>

          {/* NO current events View  */}
          <View className="items-center mb-lg">
            <Text
                role="heading"
                aria-level={3}
                className="typography-subheader text-app-secondary mb-sm"
              >
                Latest Events
              </Text>
            {activeCounterEvents.length === 0 && (
              <Text className="typography-copy text-app-brown dark:text-dark-app-brown text-center mb-sm">
                No participation events currently active
              </Text>
            )}
            <Link href="/(drawer)/events" asChild>
              <Pressable className="bg-app-accent dark:bg-dark-app-accent py-md px-lg rounded-md self-center active:opacity-80 hover:shadow-app-medium">
                <Text className="typography-cta text-app-background dark:text-dark-app-background">View All Events</Text>
              </Pressable>
            </Link>
          </View>
          <Footer />
        </ScrollView>
      </Container>
    </>
  );
}


