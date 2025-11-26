import fs from 'fs';

export function maskSecret(value?: string) {
  if (!value) return 'MISSING';
  if (value.length <= 12) return `${value}`;
  return `${value.slice(0, 4)}...${value.slice(-4)} (len=${value.length})`;
}

export function envPresence(key: string) {
  const v = process.env[key];
  return v ? `SET len=${v.length}` : 'MISSING';
}

export function isDotEnvPresent() {
  try {
    return fs.existsSync('./.env');
  } catch (e) {
    return false;
  }
}

export function formatMemoryUsage() {
  const m = process.memoryUsage();
  return {
    rss: m.rss,
    heapTotal: m.heapTotal,
    heapUsed: m.heapUsed,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  };
}

export function formatUptime() {
  return process.uptime();
}
