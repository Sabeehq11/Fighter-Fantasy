import * as fs from 'fs';
import * as path from 'path';

console.log('🔧 Firebase Admin SDK JSON Formatter\n');
console.log('This tool helps you format your Firebase Admin SDK JSON correctly.\n');

console.log('📝 Instructions:');
console.log('1. Open your downloaded Firebase service account JSON file');
console.log('2. Copy ALL the content (Cmd+A, Cmd+C)');
console.log('3. Create a temporary file called "service-account.json" in this directory');
console.log('4. Paste the content and save the file');
console.log('5. Run this script again and it will generate the correct format\n');

const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    console.log('✅ Found service-account.json file\n');
    
    // Read and parse the JSON
    const content = fs.readFileSync(serviceAccountPath, 'utf8');
    const parsed = JSON.parse(content);
    
    // Convert to single-line string
    const singleLine = JSON.stringify(parsed);
    
    console.log('📋 Copy this ENTIRE line to your .env file:\n');
    console.log('FIREBASE_ADMIN_SDK_JSON=' + singleLine);
    console.log('\n✅ Done! Now you can:');
    console.log('1. Copy the line above');
    console.log('2. Replace the FIREBASE_ADMIN_SDK_JSON line in your .env file');
    console.log('3. Delete the service-account.json file (for security)');
    console.log('4. Run: npm run seed');
    
    console.log('\n⚠️  IMPORTANT: Delete service-account.json after copying!');
    console.log('   Run: rm service-account.json');
  } catch (error) {
    console.error('❌ Error reading or parsing service-account.json:', error instanceof Error ? error.message : String(error));
    console.log('\nMake sure the file contains valid JSON from Firebase Console.');
  }
} else {
  console.log('❌ No service-account.json file found in the current directory.\n');
  console.log('Please follow the instructions above to create it.');
  console.log('Current directory:', process.cwd());
} 