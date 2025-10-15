import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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