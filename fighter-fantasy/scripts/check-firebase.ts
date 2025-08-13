import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('🔍 Checking Firebase Configuration...\n');

// Check Client SDK variables
const clientVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('📱 Client SDK Configuration:');
let allClientVarsSet = true;
for (const varName of clientVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allClientVarsSet = false;
  }
}

console.log('\n🔑 Admin SDK Configuration:');
const adminJson = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!adminJson) {
  console.log('❌ FIREBASE_ADMIN_SDK_JSON: Not set');
  console.log('\n📝 How to set it up:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Download the JSON file');
  console.log('4. Copy the ENTIRE content of the JSON file');
  console.log('5. In your .env file, set it as a single line:');
  console.log('   FIREBASE_ADMIN_SDK_JSON={"type":"service_account","project_id":"...entire JSON content..."}');
  console.log('   Make sure the entire JSON is on ONE LINE with no line breaks!');
} else {
  try {
    const parsed = JSON.parse(adminJson);
    console.log(`✅ FIREBASE_ADMIN_SDK_JSON: Valid JSON`);
    console.log(`   - Project ID: ${parsed.project_id || 'Not found'}`);
    console.log(`   - Client Email: ${parsed.client_email || 'Not found'}`);
    console.log(`   - Private Key: ${parsed.private_key ? 'Present' : 'Missing'}`);
    
    if (parsed.private_key) {
      // Check if private key has proper format
      const hasBeginMarker = parsed.private_key.includes('-----BEGIN');
      const hasEndMarker = parsed.private_key.includes('-----END');
      const hasNewlines = parsed.private_key.includes('\\n');
      
      if (!hasBeginMarker || !hasEndMarker) {
        console.log('   ⚠️  Private key might be malformed (missing BEGIN/END markers)');
      }
      if (!hasNewlines) {
        console.log('   ⚠️  Private key might be missing \\n characters');
        console.log('   💡 Make sure the private_key field has \\n characters, not actual line breaks');
      }
    }
  } catch (error) {
    console.log(`❌ FIREBASE_ADMIN_SDK_JSON: Invalid JSON format`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    console.log('\n💡 Common issues:');
    console.log('   - The JSON must be on a single line in .env');
    console.log('   - Make sure there are no line breaks within the JSON');
    console.log('   - Escape any special characters properly');
    console.log('   - The private_key field should contain \\n, not actual newlines');
  }
}

console.log('\n📊 Summary:');
if (allClientVarsSet && adminJson) {
  try {
    JSON.parse(adminJson);
    console.log('✅ All Firebase configuration appears to be set!');
    console.log('   You should be able to run: npm run seed');
  } catch {
    console.log('⚠️  Client SDK is configured but Admin SDK has issues');
  }
} else {
  console.log('❌ Firebase configuration is incomplete');
  console.log('   Please set all required environment variables in .env');
} 