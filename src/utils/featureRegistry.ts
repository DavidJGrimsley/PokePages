export type FeatureMeta = {
  key: string;
  title?: string;
  path?: string;
  icon?: string; // icon name for Ionicons
};

const registry: Record<string, FeatureMeta> = {};

export function registerFeature(meta: FeatureMeta) {
  if (!meta || !meta.key) return;
  registry[meta.key] = meta;
}

export function getFeatureMeta(key: string): FeatureMeta | undefined {
  return registry[key];
}

export function listRegisteredFeatures(): FeatureMeta[] {
  return Object.values(registry);
}

export default { registerFeature, getFeatureMeta, listRegisteredFeatures };
