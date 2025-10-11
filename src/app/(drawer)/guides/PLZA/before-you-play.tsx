import React from 'react';
import { Container } from 'components/UI/Container';
import { AppText } from '@/src/components/TextTheme/AppText';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import { Collapsible } from '@/src/components/UI/Collapsible';
import colors from '@/src/constants/style/colors';

import { Platform } from 'react-native';

export default function BeforeYouPlay() {

  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <Container>
      <MultiLayerParallaxScrollView 
        headerBackgroundColor={{ dark: colors.light.secondary, light: colors.light.background }}
        titleElement={<BouncyText text="Before You Play" />}
        headerHeight={ isMobile ? 75 : 150 }
        >
      
        {/* Story Recap Section */}
        <Collapsible title="Story recap:">
          <AppText className="text-l font-bold mb-md text-gray-700 dark:text-gray-200">In Pokémon X and Y, players explored the Kalos region and encountered new Pokémon, trainers, and challenges. The story followed the journey of a young trainer aiming to become the Pokémon Champion while uncovering the mysteries of Mega Evolution.</AppText>
          <AppText className="text-base mb-md text-gray-600 dark:text-gray-300">
            🌍 **Setting & Starting Out**: The game takes place in the Kalos Region, a beautiful Europe-inspired area based on France. You play as a young Trainer who moves to Vaniville Town and meets friends/rivals: Shauna, Tierno, Trevor, and your main rival (Serena or Calem).
            {"\n\n"}
            ⚙️ **Beginning the Adventure**: In Aquacorde Town, you choose your starter Pokémon (Chespin, Fennekin, or Froakie). After traveling through early routes and Santalune Forest, you defeat Bug-type Gym Leader Viola for your first badge. You meet Professor Sycamore in Lumiose City, who introduces Mega Evolution - a new mechanic where certain Pokémon temporarily evolve during battle using Mega Stones.
            {"\n\n"}
            🦹 **Team Flare Conflict**: The villain Lysandre leads Team Flare, initially seeming focused on beauty and aesthetics, but later revealing a sinister plan to use the Ultimate Weapon to destroy humans who don&apos;t meet his vision of beauty and &quot;beautify&quot; the world.
            {"\n\n"}
            🗺 **Mid-Game Progress**: You earn Gym badges across Kalos&apos;s diverse geography. A key moment is in Shalour City, where you meet Mega Evolution guru Gurkinn and battle Gym Leader Korrina to earn the Mega Ring, allowing you to use Mega Evolution.
            {"\n\n"}
            ⚔️ **Climax & Legendary Pokémon**: You learn about AZ, a 3,000-year-old former king who used the Ultimate Weapon long ago to revive his special Floette, causing a devastating war. You infiltrate Team Flare&apos;s bases, battle Lysandre, capture the Legendary Pokémon (Xerneas or Yveltal), and stop the weapon from being used.
            {"\n\n"}
            🏆 **Champion & Ending**: After defeating Team Flare, you collect your final Gym badge, challenge the Elite Four, and defeat Champion Diantha to become the new Kalos Champion. During the celebration parade, AZ challenges you to battle, and after you win, his lost Floette returns to him after 3,000 years, bringing him peace.
            {"\n\n"}
            🔍 **Post-Game**: Additional content includes detective missions with Looker, accessing Kiloude City, and finding more Mega Stones throughout the region.
          </AppText>
        </Collapsible>

        {/* Characters Section */}
        <Collapsible title="Characters">
          <AppText className="text-l font-bold mb-md text-gray-600 dark:text-gray-300">These characters are returning from X and Y games and the Kalos region in Legends Z-A in Lumiose City</AppText>
        </Collapsible>
        
        {/* Mechanics Section */}
        <Collapsible title="Mechanics">
          <AppText className="text-l font-bold mb-md text-gray-600 dark:text-gray-300">Time your mega evolution, move around, time your moves, learn your opponent.</AppText>
        </Collapsible>


        {/* Maximize Efforts Section */}
        <Collapsible title="Maximize efforts">
          <AppText className="text-l font-bold mb-md text-gray-600 dark:text-gray-300">Use Pokemon Home, Play Pokemon Go during events and transfer. Turn your notifications on so you do not miss out on promo codes and events!</AppText>
        </Collapsible>
      </MultiLayerParallaxScrollView>

    </Container>
  );
}
