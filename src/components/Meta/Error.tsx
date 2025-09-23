// Component Readme:
// If you have more than one error that can occur on a page, you need 
// you need to use a state variable for each and use an 'or' 
// operator to display the component if either is truthy.
// See usage.

import React from 'react';
import { View, Text, Linking, Pressable } from 'react-native';

interface ErrorProps {
  title: string;
  description?: string;
  error?: string;
}

export default function ErrorMessage({ title, description, error }: ErrorProps) {

  const handleEmailPress = () => {
    const emailSubject = encodeURIComponent('TemplateApp Error Report');
    const emailBody = encodeURIComponent(
      `Hi,\n\nI encountered an error in the TemplateApp.\n\nError Details:\nTitle: ${title}\n${description ? `Description: ${description}\n` : ''}${error ? `Technical Error: ${error}\n` : ''}\n\nPlease include a screenshot of the error if possible.\n\nThanks!`
    );
    const mailtoUrl = `mailto:support@templateapp.app?subject=${emailSubject}&body=${emailBody}`;
    
    Linking.openURL(mailtoUrl).catch((err) => {
      console.error('Failed to open email app:', err);
    });
  };

  return (
    <View className="flex-1 p-6 bg-white border">
      <View className="self-center p-3 bg-orange-500 rounded-md"> 
        <Text className="text-lg text-white text-center font-medium">{title}</Text>
      </View>
      <View className="flex-1 justify-center">
        {description && (
          <Text className="text-black text-center my-3 text-base">{description}</Text>
        )}
        <Text className="text-amber-700 text-center italic text-base">
          I&apos;m sorry you&apos;ve encountered an error in the app. Email me at{' '}
          <Pressable onPress={handleEmailPress}>
            <Text className="text-purple-900 underline font-semibold">support@templateapp.app</Text>
          </Pressable>
          {' '}to get help. Include a screenshot of the enitre page/screen please.
        </Text>
        {error && (
          <View className="bg-purple-100 border border-red-500 self-center rounded-md p-4 mt-6">
            <Text className="text-red-500 font-semibold mb-1">Technical error message: </Text>
            <Text className="text-red-500 font-mono text-sm">{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
