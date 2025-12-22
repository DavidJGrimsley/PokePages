import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { getRandomAd, type AdConfig } from '~/constants/adsConfig';
import { AdBanner } from './AdBanner';
import { AdModal } from './AdModal';
import { AdInfoModal } from './AdInfoModal';

interface AdBannerWithModalProps {
  /** Optional: Provide specific ad ID instead of random rotation */
  adId?: string;
  
  /** Optional: Custom className for container */
  className?: string;
}

/**
 * AdBannerWithModal Component
 * 
 * Combines AdBanner, AdModal, and AdInfoModal with state management.
 * Shows a random ad banner that opens a modal with details when pressed.
 * Content rotates on each render to show different services.
 * Supports dismissal with shrink animation.
 */
export function AdBannerWithModal({ adId, className }: AdBannerWithModalProps) {
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Get a random ad on mount (or specific ad if ID provided)
    if (adId) {
      // If specific ad ID provided, try to load it
      import('~/constants/adsConfig').then(({ getAdById }) => {
        const specificAd = getAdById(adId);
        if (specificAd) {
          setAd(specificAd);
        } else {
          // Fallback to random if ID not found
          setAd(getRandomAd());
        }
      });
    } else {
      // Random ad - rotates on each mount
      setAd(getRandomAd());
    }
  }, [adId]);

  const handleDismiss = () => {
    // Animate out
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
    });
  };

  if (!ad || dismissed) {
    return null;
  }

  return (
    <>
      <AdBanner 
        ad={ad} 
        className={className}
        onPress={() => setModalVisible(true)}
        onInfoPress={() => setInfoModalVisible(true)}
        onDismiss={handleDismiss}
        animatedValue={animatedValue}
      />
      
      <AdModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        ad={ad}
      />

      <AdInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
    </>
  );
}
