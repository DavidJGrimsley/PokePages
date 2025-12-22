/**
 * Ad Configuration
 * 
 * Defines all promotional service ads shown throughout the app.
 * Ads rotate randomly and display as banners between content sections.
 */

export interface AdConfig {
  /** Unique identifier for the ad */
  id: string;
  
  /** Main heading/service name */
  title: string;
  
  /** Short catchy tagline (shown in banner) */
  tagline: string;
  
  /** Detailed description (shown in modal) */
  description: string;
  
  /** Call-to-action button text */
  ctaText: string;
  
  /** Internal route path for form (optional) */
  internalFormRoute?: string;
  
  /** External URL for intake form or more info */
  externalUrl: string;
  
  /** Google Forms URL for embedded intake form (optional) */
  formUrl?: string;
  
  /** List of key features/benefits */
  features: string[];
  
  /** Icon name from Ionicons */
  icon: string;
  
  /** Accent color (Tailwind color class suffix, e.g., 'blue', 'purple') */
  accentColor: string;
}

/**
 * All available service ads
 * 
 * Current 
 * App development, website building, game development, tutoring, online presence.
 * 
 * Real service information from DavidsPortfolio
 * Contact: DavidJGrimsley@gmail.com | Website: davidjgrimsley.com
 */
export const adsConfig: Record<string, AdConfig> = {
  // checked
  'app-development': {
    id: 'app-development',
    title: 'Need an App Developed?',
    tagline: 'Turn your idea into reality',
    description: 'Professional mobile and web app development with business goals wired in from day one—strategy, UX, and build tied to outcomes, plus optional bundling with online presence services so the app and your listings work together.',
    ctaText: 'Start Your Project',
    internalFormRoute: '/intake/app-development',
    externalUrl: 'mailto:DavidJGrimsley@gmail.com?subject=App%20Development%20Inquiry',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSemBxe0Z6JYAZi8D9ZeMBU9HTRxqC-QlsSWoBTG6LvYKGDWsA/viewform?embedded=true',
    features: [
      'Cross-platform React Native apps',
      'iOS & Android deployment',
      'Modern UI/UX design',
      'Backend integration & APIs',
      'Real-time features & databases',
      'App Store optimization',
    ],
    icon: 'phone-portrait-outline',
    accentColor: 'blue',
  },
  // checked
  'website-building': {
    id: 'website-building',
    title: 'Get a Website Built!',
    tagline: 'Beautiful, fast, and responsive',
    description: 'Custom business and portfolio websites built around your business goals from start to finish—conversion-focused UX, performance, and SEO—plus optional bundling with online presence services so your site, listings, and profiles reinforce each other.',
    ctaText: 'Get Your Website',
    internalFormRoute: '/intake/website-building',
    externalUrl: 'https://davidjgrimsley.com',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfyVF35E5-vuZP7WORUDtUC36tJrnTrWUFzRGa41FGxqelV4Q/viewform?usp=sf_link',
    features: [
      'Portfolio websites',
      'E-commerce solutions',
      'Custom domain setup',
      'Responsive design for all devices',
      'SEO optimization',
      'Fast loading performance',
      'Modern UI/UX',
      'Content management',
    ],
    icon: 'globe-outline',
    accentColor: 'green',
  },
  // checked
  'game-development': {
    id: 'game-development',
    title: 'Want to Make a Game?',
    tagline: 'Bring your game concept to life',
    description: 'Game development by the Poké Pages team specializing in Fortnite experiences (UEFN & Verse), Unreal Engine, Unity, Roblox, and Scratch. Perfect for educational games and engaging experiences.',
    ctaText: 'Create Your Game',
    internalFormRoute: '/intake/game-development',
    externalUrl: 'mailto:DavidJGrimsley@gmail.com?subject=Game%20Development%20Inquiry',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSemBxe0Z6JYAZi8D9ZeMBU9HTRxqC-QlsSWoBTG6LvYKGDWsA/viewform?embedded=true',
    features: [
      'Fortnite Experiences (UEFN & Verse)',
      'Unreal Engine (Blueprint & C++) development',
      'Educational games (Scratch, Roblox)',
      'Game design consulting',
      '2D & 3D game mechanics',
      'Mobile, Console, Web, PC, etc.',
      'Interactive experiences',
    ],
    icon: 'game-controller-outline',
    accentColor: 'purple',
  },
  // checked
  'tutoring': {
    id: 'tutoring',
    title: 'Need Tutoring?',
    tagline: 'Learn from an experienced developer',
    description: 'Personalized tutoring in mathematics, game development, computer science, web development, and more from the Poké Pages team. Fill out the form to get started and inquire about pricing and availability .',
    ctaText: 'Sign Up for Tutoring',
    internalFormRoute: '/intake/tutoring',
    externalUrl: 'https://davidjgrimsley.com',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSca1rbKUU94fup06Ko-wW3vVOLxNuMJNOaqnbMh6tJdyiJ1dw/viewform?usp=header',
    features: [
      'Math: Geometry, Algebra, Calculus',
      'Software Development: AP CSA, AP CSP, Web Dev',
      'Game dev: Fortnite, Unreal, Roblox',
      'One-on-one: Tailored lessons',
      'Group classes: Get the benefit of peers',
      'Flexible virtual scheduling',
      'Pricing to fit your budget',
    ],
    icon: 'school-outline',
    accentColor: 'orange',
  },
  // checked
  'online-presence': {
    id: 'online-presence',
    title: 'Build Your Online Presence',
    tagline: 'Own your business profiles everywhere',
    description: 'Fix and level up your business listings and profiles: Apple Business Connect, Google Maps/Business Profile, LinkedIn, and more—bundle with a polished site so your info stays accurate and consistent.',
    ctaText: 'Get a consultation',
    internalFormRoute: '/intake/online-presence',
    externalUrl: 'https://davidjgrimsley.com',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfyVF35E5-vuZP7WORUDtUC36tJrnTrWUFzRGa41FGxqelV4Q/viewform?usp=sf_link',
    features: [
      'Apple Business Connect setup and verification',
      'Google Business Profile + Maps accuracy and hours',
      'LinkedIn company page setup or refresh',
      'Directory cleanup: Yelp, Bing, and other maps',
      'Professional portfolio or landing page build',
      'Contact forms, booking links, and call-to-action wiring',
      'Branded domain email and DNS records',
      'Analytics and review links to track engagement',
    ],
    icon: 'trending-up-outline',
    accentColor: 'pink',
  },
};

/**
 * Get all ad configurations as an array
 */
export const getAllAds = (): AdConfig[] => {
  return Object.values(adsConfig);
};

/**
 * Get a random ad from the pool
 */
export const getRandomAd = (): AdConfig => {
  const ads = getAllAds();
  const randomIndex = Math.floor(Math.random() * ads.length);
  return ads[randomIndex];
};

/**
 * Get an ad by ID
 */
export const getAdById = (id: string): AdConfig | undefined => {
  return adsConfig[id];
};

export type AdConfigKey = keyof typeof adsConfig;
