import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export function PayPal() {
  const handleDonatePress = () => {
    
    const donateUrl = 'https://www.paypal.com/donate/?hosted_button_id=WZL2E37Z2PFTU';
    Linking.openURL(donateUrl);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.donateButton}
        onPress={handleDonatePress}
        android_ripple={{ color: '#0070ba' }}
      >
        <Text style={styles.donateText}>💳 Donate with PayPal</Text>
        <Text style={styles.subText}>Help keep Poké Pages alive!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  donateButton: {
    backgroundColor: '#0070ba',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  donateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subText: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
  },
});
