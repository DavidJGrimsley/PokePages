/**
 * Content Moderation Test Suite
 * Run this to test your moderation setup
 */

import { moderateContent, getModerationMessage } from './contentModeration';

// Test cases
const TEST_CASES = [
  // Should PASS ✅
  {
    content: "Just caught a shiny Charizard! So excited!",
    shouldPass: true,
    description: "Normal positive post",
  },
  {
    content: "Looking for tips on beating the Elite Four. Any suggestions?",
    shouldPass: true,
    description: "Asking for help",
  },
  {
    content: "My team: Pikachu, Charizard, Blastoise, Venusaur, Dragonite, Mewtwo",
    shouldPass: true,
    description: "Sharing team composition",
  },
  {
    content: "That was a tough battle! You played really well!",
    shouldPass: true,
    description: "Positive feedback",
  },
  {
    content: "Check out this strategy: https://pokepages.app/builds/123",
    shouldPass: true,
    description: "Sharing legitimate link",
  },
  
  // Should FAIL ❌
  {
    content: "BUY CHEAP VBUCKS NOW!!! CLICK HERE!!! https://scam.com",
    shouldPass: false,
    description: "Obvious spam",
  },
  {
    content: "YOU ARE ALL TERRIBLE PLAYERS!!! QUIT THE GAME!!!",
    shouldPass: false,
    description: "Excessive caps and harassment",
  },
  {
    content: "I hate this stupid game and everyone who plays it",
    shouldPass: false,
    description: "Negative hate speech",
  },
  {
    content: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    shouldPass: false,
    description: "Spam characters",
  },
  {
    content: "Check these out: http://link1.com http://link2.com http://link3.com http://link4.com",
    shouldPass: false,
    description: "Too many links",
  },
];

/**
 * Run all tests
 */
export async function runModerationTests() {
  console.log('\n🧪 Running Content Moderation Tests...\n');
  console.log('═══════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of TEST_CASES) {
    try {
      // Run moderation
      const result = await moderateContent(test.content, 'ai');
      const testPassed = result.isAllowed === test.shouldPass;
      
      if (testPassed) {
        passed++;
        console.log(`✅ PASS: ${test.description}`);
      } else {
        failed++;
        console.log(`❌ FAIL: ${test.description}`);
        console.log(`   Expected: ${test.shouldPass ? 'ALLOWED' : 'BLOCKED'}`);
        console.log(`   Got: ${result.isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
        if (!result.isAllowed) {
          console.log(`   Reason: ${getModerationMessage(result)}`);
        }
      }
      
      results.push({
        ...test,
        result,
        passed: testPassed,
      });
      
    } catch (error) {
      failed++;
      console.log(`❌ ERROR: ${test.description}`);
      console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n📊 Results: ${passed}/${TEST_CASES.length} passed (${Math.round((passed / TEST_CASES.length) * 100)}%)\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your moderation is working correctly!\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review the output above.\n`);
  }

  return results;
}

/**
 * Test a custom message
 */
export async function testCustomContent(content: string) {
  console.log('\n🔍 Testing custom content...\n');
  console.log(`Input: "${content}"\n`);
  
  const result = await moderateContent(content, 'ai');
  
  console.log(`Result: ${result.isAllowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  
  if (!result.isAllowed) {
    console.log(`Reason: ${getModerationMessage(result)}`);
    if (result.flaggedCategories) {
      console.log(`Categories: ${result.flaggedCategories.join(', ')}`);
    }
  }
  
  if (result.confidence) {
    console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
  }
  
  console.log('');
  
  return result;
}

/**
 * Run performance test
 */
export async function runPerformanceTest(iterations = 10) {
  console.log(`\n⚡ Running performance test (${iterations} iterations)...\n`);
  
  const testContent = "This is a normal post about Pokemon!";
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await moderateContent(testContent, 'ai');
    const duration = Date.now() - start;
    times.push(duration);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log('Performance Results:');
  console.log(`  Average: ${avg.toFixed(0)}ms`);
  console.log(`  Min: ${min}ms`);
  console.log(`  Max: ${max}ms`);
  console.log('');
  
  if (avg < 300) {
    console.log('✅ Performance is excellent!\n');
  } else if (avg < 500) {
    console.log('✅ Performance is good.\n');
  } else {
    console.log('⚠️  Performance might be slow. Consider optimizing.\n');
  }
}

/**
 * Interactive test mode
 */
export async function interactiveTest() {
  console.log('\n🎮 Interactive Moderation Test\n');
  console.log('Type content to test (or "exit" to quit)\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Note: In a real implementation, you'd use readline or similar
  // This is just a template
  const testInputs = [
    "I love Pokemon!",
    "This is spam!!!!!",
    "You're all terrible",
  ];
  
  for (const input of testInputs) {
    console.log(`> ${input}`);
    await testCustomContent(input);
  }
}

// Run tests if executed directly
if (require.main === module) {
  (async () => {
    try {
      await runModerationTests();
      await runPerformanceTest();
      
      console.log('\n💡 To test custom content, use:');
      console.log('   testCustomContent("your content here")\n');
    } catch (error) {
      console.error('Test failed:', error);
      process.exit(1);
    }
  })();
}
