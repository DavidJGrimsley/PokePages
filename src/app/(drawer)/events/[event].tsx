import React from 'react';
import { View, Text, Pressable, Platform, Alert, Clipboard } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';

import { allEvents } from '~/constants/events/index';
import { isCounterEvent, isTeraRaidEvent, isMysteryGiftEvent, isPromoCodeEvent, EventStatus } from '~/constants/events/types';
import { useEventClaim } from '~/services/eventClaimsService';
import { getPromoCodeStatus } from '~/utils/helperFX';
import { EventCounter } from '@/src/components/Events/EventCounter';
import { EventDetailLayout } from '@/src/components/Events/EventDetailLayout';
import { EventClaimButton } from '@/src/components/Events/EventClaimButton';
import { PokemonStatsDisplay } from '@/src/components/Events/PokemonStatsDisplay';
import { PokemonDisplay } from '@/src/components/Events/PokemonDisplay';
import { useShowSignInAlert } from '@/src/hooks/useNavigateToSignIn';

// Static generation for all event slugs
export async function generateStaticParams(): Promise<{ event: string }[]> {
  return Object.keys(allEvents).map((key) => ({ event: key }));
}

export default function EventDetailPage() {
  const { event: eventSlug } = useLocalSearchParams<{ event: string }>();
  
  // Ensure eventSlug is a string
  let slug = Array.isArray(eventSlug) ? eventSlug[0] : eventSlug;
  
  // Handle static generation
  if (slug === '[event]' || !slug) {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/events\/([^\/]+)$/);
      if (match && match[1] && allEvents[match[1]]) {
        slug = match[1];
      }
    }
    
    if (!slug || slug === '[event]' || !allEvents[slug]) {
      slug = Object.keys(allEvents)[0];
    }
  }
  
  const event = slug ? allEvents[slug] : null;
  
  // Use event claim hook for promo code events
  const { claimed, toggleClaim } = useEventClaim(slug || '');
  const showSignInAlert = useShowSignInAlert();
  
  // Handle claim toggle with auth check
  const handleToggleClaim = async () => {
    try {
      await toggleClaim();
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        showSignInAlert();
      }
    }
  };
  
  // Helper for showing alerts
  const showAlert = (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      window.alert(message ? `${title}\n${message}` : title);
    } else {
      Alert.alert(title, message);
    }
  };
  
  if (!event) {
    return (
      <View className="flex-1 bg-app-background p-md">
        <Text className="typography-header text-app-text">Event not found</Text>
      </View>
    );
  }

  // SEO meta content
  const title = `${event.title} | PokePages Events`;
  const description = event.description;
  const canonicalUrl = `https://pokepages.app/events/${slug}`;
  
  // Render different content based on event type
  const renderEventContent = () => {
    if (isCounterEvent(event)) {
      return (
        <EventDetailLayout 
          event={event} 
          heroContent={
            <EventCounter
              pokemonName={event.pokemonName}
              pokemonId={event.pokemonId}
              isShiny={event.isShiny}
              teraType={event.teraType}
              eventTitle={event.title}
              eventDescription={event.description}
              eventKey={slug}
              startDate={event.startDate}
              endDate={event.endDate}
              distributionStart={event.distributionStart}
              distributionEnd={event.distributionEnd}
              targetCount={event.targetCount}
              maxRewards={event.maxRewards}
            />
          }
          showCounterBuilds={true}
        />
      );
    }

    if (isTeraRaidEvent(event)) {
      return (
        <EventDetailLayout 
          event={event}
          heroContent={
            <PokemonStatsDisplay
              pokemonId={event.pokemonId}
              pokemonName={event.pokemonName}
              isShiny={event.isShiny}
              teraType={event.teraType}
              initialShowStats={true}
            />
          }
          showCounterBuilds={true}
        >
          {/* Raid Details */}
          <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">
              Raid Details
            </Text>
            <Text className="typography-copy text-app-text dark:text-gray-300">Raid Level: {event.raidLevel}★</Text>
            {event.hasMightiestMark && (
              <Text className="typography-copy text-app-accent dark:text-app-primary">Has Mightiest Mark!</Text>
            )}
          </View>

          {/* Event Periods */}
          <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">
              Event Periods
            </Text>
            <Text className="typography-copy text-app-text dark:text-gray-300">Period 1: {new Date(event.periods.period1.start).toLocaleString()} - {new Date(event.periods.period1.end).toLocaleString()}</Text>
            {event.periods.period2 && (
              <Text className="typography-copy text-app-text dark:text-gray-300">Period 2: {new Date(event.periods.period2.start).toLocaleString()} - {new Date(event.periods.period2.end).toLocaleString()}</Text>
            )}
          </View>

          {/* Rewards */}
          {event.rewards && event.rewards.length > 0 && (
            <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
              <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">
                Rewards
              </Text>
              {event.rewards.map((reward, index) => (
                <Text key={index} className="typography-copy text-app-text dark:text-gray-300">• {reward}</Text>
              ))}
            </View>
          )}

          {/* Claim Button */}
          <View className="mb-md">
            <EventClaimButton
              claimed={claimed}
              onToggle={handleToggleClaim}
              iconName="trophy"
              claimedLabel="✓ Caught"
              unclaimedLabel="Mark as Caught"
            />
          </View>
          <Text className="typography-copy text-xs text-app-secondary dark:text-gray-400 mb-md text-center">
            💡 Tip: You can keep Tera Raid Pokémon even after events end by not connecting your Nintendo Switch to the internet before catching them.
          </Text>
        </EventDetailLayout>
      );
    }

    if (isMysteryGiftEvent(event)) {
      // Check if reward has pokemonId (either Pokemon or item that unlocks Pokemon)
      const hasPokemon = 'pokemonId' in event.rewardDetails && typeof event.rewardDetails.pokemonId === 'number';
      const pokemonId = hasPokemon ? (event.rewardDetails as { pokemonId: number; isShiny?: boolean }).pokemonId : undefined;
      const isShiny = hasPokemon && 'isShiny' in event.rewardDetails ? (event.rewardDetails as { isShiny?: boolean }).isShiny : false;
      
      return (
        <EventDetailLayout event={event}>
          {/* Pokemon Display if available */}
          {pokemonId && (
            <PokemonDisplay 
              pokemonId={pokemonId}
              pokemonName={event.rewardName}
              isShiny={isShiny}
              showStats={false}
              size="medium"
            />
          )}
          
          {/* Reward Details */}
          <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">Reward Details</Text>
            <Text className="typography-copy text-app-secondary dark:text-gray-400 mb-xs">
              <Text className="typography-copy-bold">Type:</Text> {event.rewardType === 'pokemon' ? 'Pokémon' : event.rewardType.charAt(0).toUpperCase() + event.rewardType.slice(1)}
            </Text>
            <Text className="typography-copy text-app-secondary dark:text-gray-400 mb-xs">
              <Text className="typography-copy-bold">Reward:</Text> {event.rewardName}
            </Text>
            <Text className="typography-copy text-app-secondary dark:text-gray-400 mb-xs">
              <Text className="typography-copy-bold">Distribution method:</Text> {event.distributionMethod === 'internet' ? 'Internet' : event.distributionMethod === 'serial-code' ? 'Serial code' : event.distributionMethod.charAt(0).toUpperCase() + event.distributionMethod.slice(1)}
            </Text>
            {event.serialCode && (
              <Text className="typography-copy text-app-secondary dark:text-gray-400 mb-xs">
                <Text className="typography-copy-bold">Code:</Text> {event.serialCode}
              </Text>
            )}
          </View>

          {/* How to Redeem */}
          {event.howToRedeem && (
            <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
              <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">How to Redeem</Text>
              {event.howToRedeem.menuPath && (
                <Text className="typography-copy text-app-accent dark:text-app-primary mb-sm">{event.howToRedeem.menuPath}</Text>
              )}
              {event.howToRedeem.steps.map((step, index) => (
                <Text key={index} className="typography-copy text-app-text dark:text-gray-300">
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
          )}

          {/* Claim Button */}
          <View className="mb-md">
            <EventClaimButton
              claimed={claimed}
              onToggle={handleToggleClaim}
              iconName="gift"
              claimedLabel="✓ Claimed"
              unclaimedLabel="Mark as Claimed"
            />
          </View>
        </EventDetailLayout>
      );
    }

    if (isPromoCodeEvent(event)) {
      const status = getPromoCodeStatus(event.expirationDate);
      
      // Check if any reward is a Pokemon
      const pokemonReward = event.rewards.find(r => r.type === 'pokemon' && r.pokemonId);
      
      const handleCopyCode = async () => {
        try {
          if (Platform.OS === 'web') {
            await navigator.clipboard.writeText(event.code);
          } else {
            Clipboard.setString(event.code);
          }
          showAlert('Success', 'Promo code copied to clipboard!');
        } catch (error) {
          console.error('Failed to copy code:', error);
          showAlert('Error', 'Failed to copy code to clipboard');
        }
      };

      return (
        <EventDetailLayout event={event}>
          {/* Pokemon Display if reward is a Pokemon */}
          {pokemonReward && pokemonReward.pokemonId && (
            <PokemonDisplay 
              pokemonId={pokemonReward.pokemonId}
              pokemonName={pokemonReward.name}
              isShiny={pokemonReward.isShiny}
              showStats={false}
              size="medium"
            />
          )}
          
          {/* Promo Code Display */}
          <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">Promo Code</Text>
            <View className="bg-app-background dark:bg-app-surface rounded-md p-md mb-sm border-2 border-app-accent dark:border-app-primary">
              <Text style={{ fontFamily: 'RobotoMono' }} className="text-app-accent dark:text-app-primary text-4xl font-bold text-center mb-md">{event.code}</Text>
              <Pressable
                onPress={handleCopyCode}
                className="bg-app-accent dark:bg-app-primary py-sm px-lg rounded-md items-center"
              >
                <Text 
                  className="text-app-white"
                  style={{ fontFamily: 'PressStart2P', fontSize: 10 }}
                >
                  Copy Code
                </Text>
              </Pressable>
            </View>
            <Text className="typography-copy text-app-text dark:text-gray-300">Expires: {new Date(event.expirationDate).toLocaleString()}</Text>
          </View>

          {/* Claim Button */}
          {status === EventStatus.ACTIVE && (
            <View className="mb-md">
              <EventClaimButton
                claimed={claimed}
                onToggle={handleToggleClaim}
                iconName="key"
                claimedLabel="✓ Redeemed"
                unclaimedLabel="Mark as Redeemed"
              />
            </View>
          )}

          {/* Rewards List */}
          <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">Rewards</Text>
            {event.rewards.map((reward, index) => (
              <View key={index} className="mb-xs">
                <Text className="typography-copy text-app-text dark:text-dark-app-text">• {reward.name}</Text>
                {reward.quantity && (
                  <Text className="typography-copy text-app-secondary dark:text-gray-400">  Quantity: {reward.quantity}</Text>
                )}
                {reward.details && (
                  <Text className="typography-copy text-app-secondary dark:text-gray-400">  {reward.details}</Text>
                )}
              </View>
            ))}
          </View>

          {/* How to Redeem */}
          {event.howToRedeem && (
            <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
              <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">How to Redeem</Text>
              {event.howToRedeem.menuPath && (
                <Text className="typography-copy text-app-accent dark:text-app-primary mb-sm">{event.howToRedeem.menuPath}</Text>
              )}
              {event.howToRedeem.steps.map((step, index) => (
                <Text key={index} className="typography-copy text-app-text dark:text-gray-300">
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
          )}
        </EventDetailLayout>
      );
    }

    return null;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      {renderEventContent()}
    </>
  );
}
