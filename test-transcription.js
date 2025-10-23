#!/usr/bin/env node
/**
 * Test Transcription with gpt-4o-transcribe
 * This script tests the transcription service using a real audio file
 */

require('dotenv').config();
const path = require('path');
const settingsManager = require('./src/config/settings');
const whisperTranscriber = require('./src/transcription/whisper');

async function testTranscription() {
  console.log('\n🎙️  Testing Transcription Service...\n');

  // Initialize the transcriber
  whisperTranscriber.initialize();

  // Path to test audio file
  const audioFilePath = path.join(__dirname, 'audio.wav');

  console.log(`Audio file: ${audioFilePath}`);

  // Validate the audio file first
  console.log('\n1️⃣  Validating audio file...');
  const validation = whisperTranscriber.validateAudioFile(audioFilePath);
  if (!validation.valid) {
    console.error(`❌ Audio file validation failed: ${validation.error}`);
    process.exit(1);
  }
  console.log('✅ Audio file is valid');

  // Test API connection
  console.log('\n2️⃣  Testing API connection...');
  const connectionTest = await whisperTranscriber.testConnection();
  if (!connectionTest.success) {
    console.error(`❌ API connection failed: ${connectionTest.error}`);
    process.exit(1);
  }
  console.log('✅ API connection successful');

  // Transcribe the audio
  console.log('\n3️⃣  Transcribing audio with gpt-4o-transcribe...');
  try {
    const startTime = Date.now();

    const result = await whisperTranscriber.transcribeAudio(audioFilePath, {
      language: 'auto',
      prompt: 'This is a test transcription for the Speak voice dictation app.'
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Transcription successful!\n');
    console.log('📝 Results:');
    console.log('─'.repeat(60));
    console.log(`Text: ${result.text}`);
    console.log(`Language: ${result.language}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Duration: ${duration}s`);
    console.log('─'.repeat(60));

    // Estimate cost
    const estimatedCost = whisperTranscriber.estimateCost(result.duration);
    console.log(`\n💰 Estimated cost: $${estimatedCost.toFixed(6)}`);

    console.log('\n🎉 All tests passed!\n');
    return { success: true, result };

  } catch (error) {
    console.error('\n❌ Transcription failed!');
    console.error(`Error: ${error.message}`);
    console.error('\nFull error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testTranscription()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
