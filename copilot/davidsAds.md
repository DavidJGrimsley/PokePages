## Ads API Integration Guide (Offline-First)

This guide explains how to consume David’s ads API from any app (web, mobile, or PWA) using an offline-first approach.

### API Endpoint

- **Default URL:** https://davidjgrimsley.com/api/content
- **Env override:**
	```
	EXPO_PUBLIC_ADS_API_URL=https://davidjgrimsley.com/api/content
	```
- **Response:**
	- `ads`: array of ad objects
	- `services`: service definitions
	- `version`, `generatedAt`

### Recommended Usage Pattern (Offline-First)

1. **Load cached ads immediately** for instant UX.
2. **Fetch fresh ads in the background** when online or when cache is stale.
3. **Update cache** and re-render when new data arrives.

### Data Shape (Ads)

Each ad in `ads` has:

- `id`
- `serviceId`
- `headline`
- `body`
- `ctaLabel`
- `ctaUrl`
- `accent`

### Intake URL (External)

PokePages builds the intake URL from **serviceId**:

```
{INTAKE_BASE_URL}/{serviceId}
```

Set the base URL via env:

```
EXPO_PUBLIC_ADS_INTAKE_BASE_URL=https://davidjgrimsley.com/services
```

### Storage Strategy

Use platform storage:

- **Web:** `localStorage`
- **React Native:** `AsyncStorage`

Cache keys:

- `ads_cache`
- `ads_cache_timestamp`

### Example Service (TypeScript)

```ts
const API_URL = 'https://davidjgrimsley.com/api/content';
const CACHE_KEY = 'ads_cache';
const CACHE_TIMESTAMP_KEY = 'ads_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getAllAds(): Promise<AdConfig[]> {
	const cached = await readCache();
	const expired = await isCacheExpired();

	if (cached && !expired) return cached;
	if (cached && expired) {
		refreshInBackground();
		return cached;
	}

	const fresh = await fetchAdsFromAPI();
	await writeCache(fresh);
	return fresh;
}
```

### Integration Notes

- **Always treat ads loading as async.**
- Add loading states in UI components (e.g., modal/banner).
- Guard against `undefined` values before rendering `map()`.

### PokePages Reference

- Service file: `src/services/adsService.ts`
- Components import directly from the service.
- Offline-first caching already implemented.
- Intake URL is external (no in-app forms).

If you want this for another app, copy `adsService.ts` and update any UI-specific transforms (icons/colors).
