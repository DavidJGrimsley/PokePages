// Test Drizzle ORM setup - just run the main src/index.ts
require('dotenv/config');
const { spawn } = require('child_process');

console.log('� Running Drizzle test via src/index.ts...');

const child = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Drizzle test completed successfully!');
  } else {
    console.error('\n❌ Drizzle test failed with exit code:', code);
  }
  process.exit(code);
});