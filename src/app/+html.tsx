import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Primary Meta Tags */}
        <title>Poké Pages - Your Ultimate Pokémon Legends Z-A Guide</title>
        <meta name="title" content="Poké Pages - Your Ultimate Pokémon Legends Z-A Guide" />
        <meta name="description" content="Complete guides, strategies, and resources for Pokémon Legends Z-A. Master shiny hunting, battle tactics, team building, wild zones, Z-A Royale, and more with Poké Pages." />
        <meta name="keywords" content="Pokemon Legends ZA, Pokemon Legends Z-A, shiny hunting, battle guide, team building, wild zones, Z-A Royale, Pokemon strategies, Poke Pages, PokePages" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pokepages.app" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pokepages.app/" />
        <meta property="og:title" content="Poké Pages - Your Ultimate Pokémon Legends Z-A Guide" />
        <meta property="og:description" content="Complete guides, strategies, and resources for Pokémon Legends Z-A. Master shiny hunting, battle tactics, team building, and more." />
        <meta property="og:site_name" content="Poké Pages" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pokepages.app/" />
        <meta property="twitter:title" content="Poké Pages - Your Ultimate Pokémon Legends Z-A Guide" />
        <meta property="twitter:description" content="Complete guides, strategies, and resources for Pokémon Legends Z-A. Master shiny hunting, battle tactics, team building, and more." />
        
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
    </html>
  );
}