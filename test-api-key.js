#!/usr/bin/env node
/**
 * Test OpenAI API Key
 * This script tests the API key using the same OpenAI client as the app
 */

require('dotenv').config();
const { OpenAI } = require('openai');

async function testApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  console.log('\n🔍 Testing OpenAI API Key...\n');

  if (!apiKey) {
    console.error('❌ No API key found in .env file');
    process.exit(1);
  }

  // Mask the API key for display
  const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`API Key: ${maskedKey}`);
  console.log(`Key length: ${apiKey.length} characters`);
  console.log(`Key prefix: ${apiKey.substring(0, 7)}`);

  // Initialize OpenAI client with the same configuration as the app
  const openai = new OpenAI({
    apiKey: apiKey
  });

  console.log('\n📡 Testing API connectivity...\n');

  try {
    // Test 1: List models (simple authentication test)
    console.log('Test 1: Listing available models...');
    const models = await openai.models.list();
    console.log('✅ Successfully authenticated!');
    console.log(`Found ${models.data.length} models available`);

    // Check if whisper-1 is available
    const whisperModel = models.data.find(m => m.id === 'whisper-1');
    if (whisperModel) {
      console.log('✅ Whisper-1 model is available');
    } else {
      console.log('⚠️  Whisper-1 model not found in available models');
    }

    console.log('\n🎉 API key is valid and working!\n');

    // Display some available models
    console.log('Available models (first 10):');
    models.data.slice(0, 10).forEach(model => {
      console.log(`  - ${model.id}`);
    });

    return { success: true };

  } catch (error) {
    console.error('\n❌ API Test Failed!\n');
    console.error('Error details:');
    console.error(`  Status: ${error.status || 'N/A'}`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Type: ${error.type || 'N/A'}`);

    if (error.status === 401) {
      console.error('\n💡 Troubleshooting:');
      console.error('  1. Check that your API key is correct');
      console.error('  2. Verify the key hasn\'t been revoked');
      console.error('  3. Ensure the key has proper permissions');
      console.error('  4. Try regenerating the key at https://platform.openai.com/account/api-keys');
    } else if (error.status === 429) {
      console.error('\n💡 Rate limit exceeded. Please wait and try again.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Network connection issue. Check your internet connection.');
    }

    console.error('\nFull error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testApiKey()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
