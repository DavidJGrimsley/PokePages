import { Platform, Share, Linking } from 'react-native';

export interface ShareOptions {
  message: string;
  url?: string;
  title?: string;
}

/**
 * Generic share function that opens the native share sheet
 */
export async function shareGeneric(options: ShareOptions) {
  try {
    await Share.share({
      message: options.message,
      title: options.title,
      url: options.url,
    });
  } catch (error) {
    console.error('Generic share error:', error);
    throw error;
  }
}

/**
 * Share to Twitter/X
 */
export async function shareToTwitter(options: ShareOptions) {
  const text = encodeURIComponent(options.message);
  const url = options.url ? encodeURIComponent(options.url) : '';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}${url ? `&url=${url}` : ''}`;

  try {
    const canOpen = await Linking.canOpenURL(twitterUrl);
    if (canOpen) {
      await Linking.openURL(twitterUrl);
    } else {
      // Fallback to generic share
      await shareGeneric(options);
    }
  } catch (error) {
    console.error('Twitter share error:', error);
    // Fallback to generic share
    await shareGeneric(options);
  }
}

/**
 * Share to Facebook
 */
export async function shareToFacebook(options: ShareOptions) {
  const url = options.url || '';
  const quote = encodeURIComponent(options.message);
  // Facebook share dialog requires a URL
  const facebookUrl = url
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${quote}`
    : `https://www.facebook.com/sharer/sharer.php?quote=${quote}`;

  try {
    const canOpen = await Linking.canOpenURL(facebookUrl);
    if (canOpen) {
      await Linking.openURL(facebookUrl);
    } else {
      // Fallback to generic share
      await shareGeneric(options);
    }
  } catch (error) {
    console.error('Facebook share error:', error);
    // Fallback to generic share
    await shareGeneric(options);
  }
}

/**
 * Share via SMS
 */
export async function shareViaSMS(options: ShareOptions) {
  const message = encodeURIComponent(options.message);
  const smsUrl = Platform.select({
    ios: `sms:&body=${message}`,
    android: `sms:?body=${message}`,
    default: `sms:?body=${message}`,
  });

  try {
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (canOpen) {
      await Linking.openURL(smsUrl);
    } else {
      // Fallback to generic share
      await shareGeneric(options);
    }
  } catch (error) {
    console.error('SMS share error:', error);
    // Fallback to generic share
    await shareGeneric(options);
  }
}

/**
 * Share via WhatsApp
 */
export async function shareToWhatsApp(options: ShareOptions) {
  const message = encodeURIComponent(options.message);
  const whatsappUrl = `whatsapp://send?text=${message}`;

  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to generic share
      await shareGeneric(options);
    }
  } catch (error) {
    console.error('WhatsApp share error:', error);
    // Fallback to generic share
    await shareGeneric(options);
  }
}

/**
 * Show a menu with all sharing options
 */
export type ShareMethod = 'generic' | 'twitter' | 'facebook' | 'sms' | 'whatsapp';

export async function shareWith(method: ShareMethod, options: ShareOptions) {
  switch (method) {
    case 'twitter':
      return shareToTwitter(options);
    case 'facebook':
      return shareToFacebook(options);
    case 'sms':
      return shareViaSMS(options);
    case 'whatsapp':
      return shareToWhatsApp(options);
    case 'generic':
    default:
      return shareGeneric(options);
  }
}
