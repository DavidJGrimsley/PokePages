# SEO & Shareability Implementation Guide for Poké Pages

## Overview
This guide provides step-by-step instructions for implementing comprehensive SEO meta tags and social media shareability across all pages in the Poké Pages Expo Router app. Based on our analysis, we'll add Open Graph, Twitter Cards, structured data, and other SEO elements to improve search rankings and social sharing previews.

## Prerequisites
- Import `Head` from `expo-router/head` in each page component
- Define page-specific title, description, and keywords variables
- Use the web URL `https://pokepages.app` for canonical links

## Core Meta Tags Template

### For Each Page Component:
1. **Import Head**: Add `import Head from 'expo-router/head';` at the top
2. **Define SEO Variables**: Create title, description, and keywords constants
3. **Add Head Component**: Place the Head component inside the return statement, before other JSX

### Basic Template:
```tsx
// At the top of your component
const title = 'Page Title | Poké Pages';
const description = 'Page description under 160 characters';
const keywords = 'keyword1, keyword2, pokemon related terms';

// Inside return statement, before other JSX
<Head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />

  {/* Open Graph / Facebook */}
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content="Poké Pages" />
  <meta property="og:url" content="https://pokepages.app/current-page-path" />
  <meta property="og:image" content="https://pokepages.app/images/page-preview.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  {/* Twitter Cards */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://pokepages.app/images/page-preview.jpg" />

  {/* Additional SEO */}
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="author" content="Poké Pages" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://pokepages.app/current-page-path" />
</Head>
```

## Page-Specific Implementation

### 1. Home Page (`src/app/(drawer)/index.tsx`) - ✅ COMPLETED
- **Title**: "Poké Pages | The Ultimate Pokémon Companion App"
- **Description**: Focus on community, events, and features
- **Keywords**: Pokemon events, community, strategies, news
- **Image**: `home-preview.png`

### 2. Events (`src/app/(drawer)/events/index.tsx`) - ✅ COMPLETED
- **Title**: "Pokémon Events | Global Challenge Events & Mystery Gifts | PokePages"
- **Description**: Global Pokemon challenge events and Mystery Gift rewards
- **Keywords**: Pokemon events, mystery gift, global challenge, raids
- **Image**: `events-preview.png`

### 3. Type Analyzer (`src/app/(drawer)/resources/type/analyzer.tsx`) - ✅ COMPLETED
- **Title**: "Pokémon Type Analyzer | Type Effectiveness Calculator | PokePages"
- **Description**: Focus on calculator functionality
- **Keywords**: Type effectiveness, pokemon types, calculator
- **Image**: (uses analyzer-specific image)

### 4. Type Info (`src/app/(drawer)/resources/type/info.tsx`) - ✅ COMPLETED
- **Title**: "Pokémon Type Information | Type Colors & Pokémon Lists | PokePages"
- **Description**: Type information with colors and Pokemon lists
- **Keywords**: Pokemon types, type colors, dual types
- **Image**: `type-info-preview.png`

### 5. Ask AI (`src/app/(drawer)/resources/ask.tsx`) - ✅ COMPLETED
- **Title**: "Ask AI About Pokémon | AI-Powered Pokémon Assistant | PokePages"
- **Description**: AI assistant for Pokemon questions
- **Keywords**: Pokemon AI, assistant, questions
- **Image**: `ask-ai-preview.png`

### 6. PLZA Strategies (`src/app/(drawer)/guides/PLZA/strategies/index.tsx`) - ✅ COMPLETED
- **Title**: "Pokémon Legends Z-A Strategies & Guides | PokePages"
- **Description**: Complete strategy guides for Legends Z-A
- **Keywords**: Pokemon legends za strategies, guides, shiny hunting
- **Image**: `plza-strategies-preview.png`

### 7. Social Hub (`src/app/(drawer)/social/index.tsx`) - ✅ COMPLETED
- **Title**: "Social Hub | Connect with Pokémon Trainers | PokePages"
- **Description**: Connect with fellow trainers
- **Keywords**: Pokemon social, community, trainer network
- **Image**: `social-preview.png`

### 8. Social Feed (`src/app/(drawer)/social/(tabs)/feed.tsx`) - ✅ COMPLETED
- **Title**: "Social Feed | Pokémon Trainer Community | PokePages"
- **Description**: Explore posts from the community
- **Keywords**: Pokemon feed, trainer posts, community
- **Image**: `feed-preview.png`

### 9. Messages (`src/app/(drawer)/social/(tabs)/messages.tsx`) - ✅ COMPLETED
- **Title**: "Messages | Trainer Conversations | PokePages"
- **Description**: Connect through direct messages
- **Keywords**: Pokemon messages, trainer chat
- **Image**: `messages-preview.png`
- **Note**: Uses `noindex, nofollow` for privacy

### 10. Create Post (`src/app/(drawer)/social/(tabs)/post.tsx`) - ✅ COMPLETED
- **Title**: "Create Post | Share Your Pokémon Adventure | PokePages"
- **Description**: Share your Pokemon journey
- **Keywords**: Create pokemon post, share pokemon
- **Image**: `post-preview.png`
- **Note**: Uses `noindex, nofollow` for user-generated content

### Remaining Pages - TODO
Apply the template to:
- `/guides/gen9/*` pages (map, strategies, raid-counter, top50)
- `/guides/PLZA/*` individual strategy pages
- `/events/[counterEvent]` dynamic event pages
- Individual conversation pages

## Advanced SEO Features

### Structured Data (Schema.org)
For content-rich pages, add JSON-LD structured data:

```tsx
// Define structured data object
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage", // or Article, CollectionPage, etc.
  "headline": title,
  "description": description,
  "author": {
    "@type": "Organization",
    "name": "PokePages"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PokePages"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://pokepages.app/page-path"
  },
  "keywords": keywords,
  // Add page-specific entities (VideoGame, Article, etc.)
};

// Add to Head component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(structuredData),
  }}
/>
```

### Open Graph Images
To improve social sharing, add:
```tsx
<meta property="og:image" content="https://pokepages.app/images/page-preview.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

## Implementation Checklist

### For Each Page:
- [ ] Import Head from expo-router/head
- [ ] Define title (50-60 chars)
- [ ] Define description (150-160 chars)
- [ ] Define relevant keywords
- [ ] Add basic meta tags (including og:image)
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Add canonical URL
- [ ] Test on web build

### Global Considerations:
- [ ] Create reusable SEO component for consistency
- [ ] Add og:image to all pages
- [ ] Implement structured data where appropriate
- [ ] Test social sharing from web URLs
- [ ] Verify mobile responsiveness

## Testing & Validation

### SEO Testing:
1. **Web Build**: Run `npx expo export --platform web`
2. **Meta Tag Checker**: Use tools like:
   - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - Google Rich Results Test: https://search.google.com/test/rich-results

### Shareability Testing:
1. Copy page URL from web build
2. Paste in Facebook/Twitter post composer
3. Verify rich preview appears with correct title, description, and image

## Best Practices

### Content Guidelines:
- **Titles**: Include brand name, be descriptive, under 60 characters
- **Descriptions**: Compelling, keyword-rich, under 160 characters
- **Keywords**: Relevant Pokemon terms, avoid keyword stuffing
- **URLs**: Use clean, descriptive paths for canonical links

### Technical Guidelines:
- **Canonical URLs**: Always point to https://pokepages.app
- **Robots Meta**: Use "index, follow" for public pages
- **Viewport**: Essential for mobile SEO
- **Author**: Consistent branding

### Social Media Specific:
- **Open Graph**: Required for Facebook, LinkedIn, Discord
- **Twitter Cards**: Use "summary_large_image" for better visibility
- **Images**: 1200x630px recommended for OG images

## Priority Implementation Order

1. **High Priority**: Home page, type analyzer, main feature pages
2. **Medium Priority**: Guide pages, event pages
3. **Low Priority**: Profile pages, secondary features

## Notes for GitHub Copilot
When implementing:
- Always include 3-5 lines of context when editing
- Use replace_string_in_file for efficiency
- Test changes in web build
- Follow the established pattern from existing pages
- Suggest improvements based on page content

## Notes for Developer
- Update meta content when page content changes
- Monitor Google Search Console for indexing
- Track social shares and engagement
- Regularly test meta tags after updates
- Consider adding sitemap.xml for better crawling