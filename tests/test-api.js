import 'dotenv/config';

async function testApi() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test health check
    const healthResponse = await fetch('http://localhost:3001');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test wo-chien event
    const eventResponse = await fetch('http://localhost:3001/api/events/wo-chien');
    const eventData = await eventResponse.json();
    console.log('🎯 Wo-chien event:', eventData);
    
    // Test increment (if event exists)
    if (eventData.success) {
      const incrementResponse = await fetch('http://localhost:3001/api/events/wo-chien/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          anonymousId: 'test_drizzle_' + Date.now()
        })
      });
      const incrementData = await incrementResponse.json();
      console.log('🚀 Increment result:', incrementData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testApi();