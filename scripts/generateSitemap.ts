import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'https://pokepages.app';
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'sitemap.xml');
const DIST_OUTPUT = path.join(process.cwd(), 'dist', 'sitemap.xml');

interface RouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

// Define custom priorities and change frequencies for specific routes
const routeConfigs: { [key: string]: Partial<RouteConfig> } = {
  '/': { priority: 1.0, changefreq: 'daily' },
  '/events': { priority: 0.9, changefreq: 'daily' },
  '/social': { priority: 0.8, changefreq: 'hourly' },
  '/guides/PLZA/strategies': { priority: 0.9, changefreq: 'weekly' },
  '/guides/gen9/strategies': { priority: 0.9, changefreq: 'weekly' },
  '/resources/type/analyzer': { priority: 0.8, changefreq: 'monthly' },
  '/resources/type/info': { priority: 0.8, changefreq: 'monthly' },
};

function getRoutesFromBuild(): string[] {
  console.log('🏗️  Building web app to get routes...');
  
  try {
    // Run expo export and capture output
    const output = execSync('npx expo export -p web', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    // Extract routes from the "Static routes" section
    const routeMatches = output.match(/^\s*\/[^\s]+/gm);
    if (!routeMatches) {
      console.warn('⚠️  Could not find routes in build output');
      return [];
    }
    
    // Clean up routes (remove size info, trim whitespace)
    const routes = routeMatches
      .map(line => line.trim().split(/\s+/)[0])
      .filter(route => route.startsWith('/'));
    
    return routes;
  } catch (error) {
    console.error('❌ Error building web app:', error);
    return [];
  }
}

function shouldExcludeRoute(route: string): boolean {
  const excludePatterns = [
    /\/\(drawer\)\//,  // Exclude drawer-specific routes (duplicates)
    /\/\(tabs\)\//,    // Exclude tab-specific routes (duplicates)
    /\/\(profile\)\//,  // Exclude profile group routes (duplicates)
    /\/\(onboarding\)\//,  // Exclude onboarding group routes (duplicates)
    /\/auth\//,        // Exclude auth routes
    /\/oAuth$/,
    /\/callback/,
    /\/sign-in$/,
    /\/sign-up$/,
    /\/\+not-found$/,
    /\/_sitemap$/,
    /\/\[.*\]$/,       // Exclude dynamic route templates like [username], [postId], etc.
  ];

  return excludePatterns.some(pattern => pattern.test(route));
}

function getRouteConfig(route: string): RouteConfig {
  const defaults = {
    priority: 0.5,
    changefreq: 'weekly' as const,
  };

  // Check for exact match
  if (routeConfigs[route]) {
    return { path: route, ...defaults, ...routeConfigs[route] };
  }

  // Check for partial matches
  if (route.startsWith('/guides/PLZA/strategies/')) {
    return { path: route, priority: 0.9, changefreq: 'weekly' };
  }
  if (route.startsWith('/guides/gen9/')) {
    return { path: route, priority: 0.8, changefreq: 'weekly' };
  }
  if (route.startsWith('/events/')) {
    return { path: route, priority: 0.8, changefreq: 'daily' };
  }
  if (route.startsWith('/social/')) {
    return { path: route, priority: 0.6, changefreq: 'hourly' };
  }

  return { path: route, ...defaults };
}

function generateSitemap() {
  console.log('🗺️  Generating sitemap from build output...');
  
  // Get routes from expo build
  const allRoutes = getRoutesFromBuild();
  
  if (allRoutes.length === 0) {
    console.error('❌ No routes found. Please ensure the build completed successfully.');
    process.exit(1);
  }
  
  // Filter and deduplicate routes
  const uniqueRoutes = Array.from(new Set(
    allRoutes
      .filter(route => !shouldExcludeRoute(route))
      .map(route => route || '/')
  )).sort();

  console.log(`📍 Found ${uniqueRoutes.length} unique routes to include in sitemap`);

  // Generate XML
  const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of uniqueRoutes) {
    const config = getRouteConfig(route);
    const url = `${BASE_URL}${route}`;
    
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${config.changefreq}</changefreq>\n`;
    xml += `    <priority>${config.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  // Write to public folder
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf-8');
  console.log(`✅ Sitemap generated at ${OUTPUT_FILE}`);
  
  // Copy to dist folder if it exists
  const distDir = path.dirname(DIST_OUTPUT);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(DIST_OUTPUT, xml, 'utf-8');
    console.log(`📋 Sitemap copied to ${DIST_OUTPUT}`);
  } else {
    console.log(`ℹ️  dist folder not found - run build:web first, or sitemap will be copied during next build`);
  }
  
  console.log(`📊 Total URLs: ${uniqueRoutes.length}`);
}

// Run the script
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
