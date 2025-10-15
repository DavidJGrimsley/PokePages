import React from 'react';
import { Container } from 'components/UI/Container';
import { AppText } from '@/src/components/TextTheme/AppText';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import { Collapsible } from '@/src/components/UI/Collapsible';
import colors from '@/src/constants/style/colors';
import beforeYouPlayData from '@/src/constants/beforeYouPlayLegendsAZ.json';

import { Platform, Linking, TouchableOpacity } from 'react-native';

export default function BeforeYouPlay() {

  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <Container>
      <MultiLayerParallaxScrollView 
        headerBackgroundColor={{ dark: colors.light.secondary, light: colors.light.background }}
        titleElement={<BouncyText text="Before You Play" />}
        headerHeight={ isMobile ? 75 : 150 }
        >
      
          <AppText className="text-xl font-bold mb-md dark:text-gray-700 text-gray-200">
            {beforeYouPlayData.story.caption}
          </AppText>
          
        {/* Story Recap Section */}
        <Collapsible title={beforeYouPlayData.story.title} animatedOpen={true}>
          <AppText className="text-xl font-bold mb-md text-gray-700 dark:text-gray-200">
            {beforeYouPlayData.story.body}
          </AppText>
          
          {beforeYouPlayData.story.bullets.map((bullet, index) => (
            <AppText key={index} className="text-base mb-sm text-gray-600 dark:text-gray-300">
              • {bullet}
            </AppText>
          ))}

          <AppText className="text-lg mb-md text-gray-600 dark:text-gray-300">
           {beforeYouPlayData.story.playPrimer}
          </AppText>
        </Collapsible>

        {/* Characters Section */}
        <Collapsible title="Characters" animatedOpen={true}>
          <AppText className="text-xl font-bold mb-md text-gray-700 dark:text-gray-200">
            {beforeYouPlayData.characters.caption}
          </AppText>
          
          {Object.entries(beforeYouPlayData.characters).map(([key, character]) => {
            if (key === 'caption' || typeof character === 'string') return null;
            
            return (
              <div key={key} className="mb-md">
                <Collapsible 
                  title={character.name}
                  invertColors={true}
                  animatedOpen={true}
                  backgroundImage={(character as any).imageUrl}
                  rightContent={character.likelyRelevantInZA ? (
                    <AppText className="text-sm text-green-400 dark:text-green-800 font-semibold">
                      ✓ Likely relevant in Z-A
                    </AppText>
                  ) : undefined}
                >
                  <AppText className="text-base mb-sm text-gray-600 dark:text-app-secondary">
                    {character.info}
                  </AppText>
                  {character.bullets.map((bullet: string, index: number) => (
                    <AppText key={index} className="text-base mb-sm text-gray-600 dark:text-gray-800">
                      • {bullet}
                    </AppText>
                  ))}
                </Collapsible>
              </div>
            );
          })}
        </Collapsible>
        
        {/* Mechanics Section */}
        <Collapsible title="Mechanics" animatedOpen={true}>
          <AppText className="text-xl font-bold mb-md text-gray-700 dark:text-gray-200">
            {beforeYouPlayData.mechanics.caption}
          </AppText>
          
          {beforeYouPlayData.mechanics.bullets.map((bullet, index) => (
            <AppText key={index} className="text-base mb-md text-gray-600 dark:text-gray-300">
              • {bullet}
            </AppText>
          ))}
        </Collapsible>


        {/* Maximize Efforts Section */}
        <Collapsible title="Maximize efforts" animatedOpen={true}>
          <AppText className="text-xl font-bold mb-md text-gray-700 dark:text-gray-200">
            {beforeYouPlayData.maximizeEfforts.caption}
          </AppText>
          
          {beforeYouPlayData.maximizeEfforts.bullets.map((bullet, index) => (
            <AppText key={index} className="text-base mb-md text-gray-600 dark:text-gray-300">
              • {bullet}
            </AppText>
          ))}
        </Collapsible>

        {/* Credits & Sources Section */}
        <Collapsible title="Credits & Sources" animatedOpen={true} invertColors={true}>
          <AppText className="text-base mb-sm text-gray-600 dark:text-app-secondary">
            Special thanks and attribution for the information in this guide
          </AppText>
          
          <AppText className="text-base mb-sm text-gray-600 dark:text-gray-800 font-semibold">
            📚 Story & Character Information:
          </AppText>
          <AppText className="text-base mb-md text-gray-600 dark:text-gray-800">
            • Pokémon X and Y plot details and character information sourced from Bulbapedia - The community-driven Pokémon encyclopedia
          </AppText>
          <TouchableOpacity onPress={() => Linking.openURL('https://bulbapedia.bulbagarden.net/wiki/Pokémon_X_and_Y')}>
            <AppText className="text-sm mb-md text-blue-600 dark:text-blue-400 underline">
              Source: https://bulbapedia.bulbagarden.net/wiki/Pokémon_X_and_Y
            </AppText>
          </TouchableOpacity>
          
          <AppText className="text-base mb-sm text-gray-600 dark:text-gray-800 font-semibold">
            🖼️ Character Images & Z-A Information:
          </AppText>
          <AppText className="text-base mb-md text-gray-600 dark:text-gray-800">
            • Character artwork and Legends Z-A details from the official Pokémon Legends: Z-A website
          </AppText>
          <TouchableOpacity onPress={() => Linking.openURL('https://legends.pokemon.com/en-us')}>
            <AppText className="text-sm mb-md text-blue-600 dark:text-blue-400 underline">
              Source: https://legends.pokemon.com/en-us
            </AppText>
          </TouchableOpacity>
          
          <AppText className="text-base mb-sm text-gray-600 dark:text-gray-800 font-semibold">
            ⚖️ Legal Disclaimer:
          </AppText>
          <AppText className="text-sm mb-md text-gray-500 dark:text-gray-400 italic">
            This is fan-created content for educational and informational purposes. Pokémon, Pokémon X & Y, and Pokémon Legends: Z-A are trademarks of Nintendo, Game Freak, and The Pokémon Company. All character images and official artwork are property of their respective owners.
          </AppText>
          
          <AppText className="text-sm text-gray-500 dark:text-gray-400 italic">
            This guide respects fair use guidelines and provides proper attribution to all sources. No copyright infringement is intended.
          </AppText>
        </Collapsible>
      </MultiLayerParallaxScrollView>

    </Container>
  );
}


// if I want to add this back in after playing it's here:
// "Shauna": {
    //   "name": "Shauna, Trevor, ",
    //   "info": "Friend and traveling companion; cheerful and supportive.",
    //   "bullets": [
    //     "One of the player’s (yours) main companions during the X/Y journey.",
    //     "Represents the friendly social circle you'll meet in Kalos."
    //   ],
    //   "likelyRelevantInZA": true
    // },
    // "Trevor": {
    //   "name": "Trevor",
    //   "info": "Friend who gifts the player (you) the Pokédex early in the game.",
    //   "bullets": [
    //     "Part of the player (you)’s initial group and helps establish the Pokédex role."
    //   ],
    //   "likelyRelevantInZA": false
    // },
    // "Tierno": {
    //   "name": "Tierno",
    //   "info": "Playful friend who accompanies the player (you) on parts of the journey.",
    //   "bullets": [
    //     "Member of the player (you)’s early party of peers; lighthearted presence in Kalos’ social fabric."
    //   ],
    //   "likelyRelevantInZA": false
    // },
    //  "Korrina": {
    //   "name": "Korrina",
    //   "info": "Gym Leader and Tower of Mastery/ Lucario connection.",
    //   "bullets": [
    //     "Introduces the player (you) to Lucario’s aura sensing and gives the Rumble Badge.",
    //     "Connected to the Mega Evolution subplot and the Tower of Mastery"
    //   ],
    //   "likelyRelevantInZA": true
    // },
    // "Gurkinn": {
    //   "name": "Gurkinn",
    //   "info": "Expert on Mega Evolution (Tower of Mastery).",
    //   "bullets": [
    //     "Explains the Mega Ring and Mega Stones; only had one Mega Ring to give in X/Y (which the player (you) receives).",
    //     "Part of the Mega Evolution institutional lore in Kalos"
    //   ],
    //   "likelyRelevantInZA": true
    // },
    // "Diantha": {
    //   "name": "Diantha",
    //   "info": "Champion of the Kalos League and celebrity actress.",
    //   "bullets": [
    //     "A powerful Trainer and public figure—appears in story beats and is referenced around Lumiose society"
    //   ],
    //   "likelyRelevantInZA": true
    // },