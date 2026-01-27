import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { getRandomAd, getAdById, type AdConfig } from '~/services/adsService';
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
    let isMounted = true;

    const loadAd = async () => {
      try {
        if (adId) {
          const specificAd = await getAdById(adId);
          if (!isMounted) return;
          if (specificAd) {
            setAd(specificAd);
            return;
          }
        }

        const randomAd = await getRandomAd();
        if (!isMounted) return;
        setAd(randomAd);
      } catch (error) {
        console.error('Failed to load ad:', error);
        if (isMounted) {
          setAd(null);
        }
      }
    };

    loadAd();

    return () => {
      isMounted = false;
    };
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
