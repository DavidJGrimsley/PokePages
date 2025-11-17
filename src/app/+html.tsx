import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Primary Meta Tags */}
        <title>Poké Pages | The Ultimate Pokémon Companion App</title>
        <meta name="title" content="Poké Pages | The Ultimate Pokémon Companion App" />
        <meta name="description" content="Join thousands of trainers on Poké Pages, a social and resource hub! Track global Pokémon events, participate in community challenges, access battle strategies, type calculators, and stay updated with the latest Pokémon news and distributions." />
        <meta name="keywords" content="Pokemon, Poké Pages, Pokemon events, Pokemon battles, Pokemon community, Pokemon type chart, Pokemon strategies, Pokemon news, Pokemon Scarlet Violet, Legends Z-A, Treasures of Ruin, global challenges, Pokemon counters" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pokepages.app" />
        {/* PWA: Manifest and icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/images/icons/favicon.ico" />
        <link rel="icon" href="/images/icons/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/images/icons/favicon-16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/images/icons/mask-icon.svg" color="#582a5a" />
        <meta name="theme-color" content="#582a5a" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pokepages.app" />
        <meta property="og:title" content="Poké Pages | The Ultimate Pokémon Companion App" />
        <meta property="og:description" content="Join thousands of trainers on Poké Pages, a social and resource hub! Track global Pokémon events, participate in community challenges, access battle strategies, type calculators, and stay updated with the latest Pokémon news and distributions." />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:image" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:secure_url" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Poké Pages - The Ultimate Pokémon Companion App" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Poké Pages | The Ultimate Pokémon Companion App" />
        <meta name="twitter:description" content="Join thousands of trainers on Poké Pages, a social and resource hub! Track global Pokémon events, participate in community challenges, access battle strategies, type calculators, and stay updated with the latest Pokémon news and distributions." />
        <meta name="twitter:image" content="https://pokepages.app/images/home-preview.png" />
        <meta name="twitter:image:alt" content="Poké Pages - The Ultimate Pokémon Companion App" />
        <meta name="twitter:site" content="@mrdj2u26" />
        <meta name="twitter:creator" content="@gokuscharizard" />
        
        {/* Critical CSS to stabilize mobile web layout before bundles load */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body { height: 100%; margin: 0; padding: 0; }
            html { height: 100vh; height: -webkit-fill-available; }
            body { height: 100vh; height: -webkit-fill-available; display: flex; flex-direction: column; }
            #root { min-height: 100vh; min-height: 100dvh; min-height: -webkit-fill-available; position: relative; display: flex; flex-direction: column; }
          `
        }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
      <script dangerouslySetInnerHTML={{ __html: `
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js').catch(function(err){
              console.warn('ServiceWorker registration failed:', err);
            });
          });
        }
      ` }} />
    </html>
  );
}