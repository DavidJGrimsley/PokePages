#!/usr/bin/env node

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let frameIndex = 0;

async function typeText(text, color = colors.reset, delayMs = 30) {
  // Write the base color once; allow inline ANSI sequences in `text` to override it.
  if (color) process.stdout.write(color);

  // Tokenize into ANSI escape sequences or single characters so we don't split ANSI codes.
  const tokens = text.match(/\x1b\[[0-9;]*m|./g) || [];
  for (const token of tokens) {
    if (/^\x1b\[[0-9;]*m$/.test(token)) {
      // Pass through ANSI codes without delay or extra wrapping
      process.stdout.write(token);
    } else {
      process.stdout.write(token);
      await sleep(delayMs);
    }
  }
  process.stdout.write(colors.reset + '\n');
}

async function spinner(text, duration) {
  const startTime = Date.now();
  process.stdout.write(text);
  
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(text.length + 2) + '\r');
        resolve();
      } else {
        process.stdout.write('\r' + text + ' ' + colors.cyan + frames[frameIndex] + colors.reset);
        frameIndex = (frameIndex + 1) % frames.length;
      }
    }, 80);
  });
}

async function printBanner() {
  const ascii = {
    'M': [
      '███╗   ███╗ ',
      '████╗ ████║ ',
      '██╔████╔██║ ',
      '██║╚██╔╝██║ ',
      '██║ ╚═╝ ██║ ',
      '╚═╝     ╚═╝ '
    ],
    'r': [
      '      ',
      '      ',
      '██▄▄▄╗',
      '██╔═▀╝',
      '██║   ',
      '╚═╝   ',
    ],
    '.': [
      '      ',
      '      ',
      '      ',
      '      ',
      '██╗   ',
      '╚═╝   '
    ],
    'D': [
      '██████╗  ',
      '██╔══██╗ ',
      '██║  ██║ ',
      '██║  ██║ ',
      '██████╔╝ ',
      '╚═════╝  '
    ],
    'J': [
      '███████╗',
      '╚══██╔═╝',
      '   ██║  ',
      '█  ██║  ',
      '█████║  ',
      '╚════╝  '
    ],
    "'": [
      '   ',
      '██╗',
      '╚═╝',
      '   ',
      '   ',
      '   '
    ],
    's': [
      '     ',
      '     ',
      '▄▄▄▄ ',
      '█▄▄▄╗',
      '▄▄▄█║',
      '╚═══╝',
    ]
  };


  const text = "Mr.DJ's";
  const rows = ascii['M'].length;
  console.log(colors.cyan + colors.bright);
  for (let row = 0; row < rows; row += 1) {
    let line = '  ';
    for (const ch of text) {
      const pattern = ascii[ch];
      line += (pattern ? pattern[row] : '             ') + ' ';
    }
    console.log(line);
  }
  console.log(colors.reset);
  console.log(colors.magenta + '             ╔═════════════════════════════╗');
  console.log('             ║         A R C A D E         ║');
  console.log('             ╚═════════════════════════════╝' + colors.reset);
  console.log('');
}

async function run() {
  console.clear();
  
  await sleep(200);
  
  // Boot sequence
  await typeText('> Initializing broadcast system...', colors.dim, 20);
  await spinner('  Loading channel data', 300);
  await typeText('  ✓ Channel data loaded', colors.green, 15);
  
  await sleep(150);
  
  await typeText('> Connecting to streaming nodes...', colors.dim, 20);
  await spinner('  Establishing connection', 500);
  await typeText('  ✓ Connection established', colors.green, 15);
  
  await sleep(150);
  
  await typeText('> Calibrating entertainment matrix...', colors.dim, 20);
  await spinner('  Optimizing content delivery', 650);
  await typeText('  ✓ System ready', colors.green, 15);
  
  await sleep(200);
  console.log('');
  
  // Main banner
  await printBanner();
  
  await sleep(200);
  
  // Channel info
  await typeText('  YouTube:    ' +  colors.red + '@MrDJsArcade' + colors.reset, colors.white, 25);
  await sleep(100);
  await typeText('  Twitch:     ' + colors.bright + colors.magenta + 'MrDJ2U' + colors.reset, colors.white, 25);
  await sleep(100);
  
  await typeText('  Creator of: ' + colors.bright + colors.cyan + 'Poké Pages' + colors.reset, colors.white, 25);
  await sleep(200);
  console.log('');
  
  await typeText('  ' + colors.yellow + '▶ LEVEL UP YOUR GAMING EXPERIENCE' + colors.reset, colors.reset, 20);
  
  await sleep(300);
  console.log('');
  
  // Final flourish
  const bar = '━'.repeat(50);
  console.log(colors.cyan + '  ' + bar + colors.reset);
  
  await sleep(500);
}

run().catch(console.error);
