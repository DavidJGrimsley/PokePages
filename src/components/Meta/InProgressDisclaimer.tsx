// NOTE: You must install 'react-native-typewriter' for this to work:
// npm install react-native-typewriter

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import TypeWriter from 'react-native-typewriter';


const disclaimerText = "This information or feature is new and may be slightly inaccurate or buggy, please email support@pokepages.app for any issues. Your help is greatly appreciated!";


export function InProgressDisclaimer() {
	return (
		<View style={styles.container}>
			<TypeWriter
				typing={1}
				maxDelay={100}
				minDelay={20}
				style={styles.text}
			>
				<Text>{disclaimerText}</Text>
			</TypeWriter>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	text: {
		fontFamily: 'monospace',
		fontSize: 13,
		color: '#888',
		textAlign: 'center',
		letterSpacing: 0.5,
	},
});