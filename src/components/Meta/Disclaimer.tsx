
// NOTE: You must install 'react-native-typewriter' for this to work:
// npm install react-native-typewriter

import React from 'react';
import { View, Text } from 'react-native';
import TypeWriter from 'react-native-typewriter';

const disclaimerText = "This is a fan made application and is not affiliated with or endorsed by Pokémon Company, Game Freak, or Nintendo.";

// NativeWind refactor + reserved height to prevent jumping
export function Disclaimer() {
	return (
		<View className="relative my-4 px-5 items-center justify-center">
			{/* Placeholder reserves final height */}
			<Text
				className="opacity-0 text-center w-full"
				style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5 }}
			>
				{disclaimerText}
			</Text>

			{/* Animated text overlays placeholder, so layout height doesn't change */}
			<View className="absolute inset-0 px-5 items-center justify-center">
				<TypeWriter typing={1} maxDelay={100} minDelay={20}>
					<Text
						className="text-center text-gray-500 w-full"
						style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5 }}
					>
						{disclaimerText}
					</Text>
				</TypeWriter>
			</View>
		</View>
	);
}