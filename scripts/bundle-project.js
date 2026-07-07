const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const tempDir = path.join(rootDir, '.clean-temp');
const zipFileName = 'voyagerpulse.zip';
const zipFilePath = path.join(rootDir, zipFileName);

// Exactly ignored folder or file names
const IGNORED_NAMES = new Set([
  '.git',
  'node_modules',
  '.next',
  '.vercel',
  '.clean-temp',
  zipFileName,
]);

function shouldIgnore(fileName) {
  // Ignore specific folders/files
  if (IGNORED_NAMES.has(fileName)) return true;
  
  // Ignore local environment configuration files, but KEEP .env.example
  if (fileName.startsWith('.env') && fileName !== '.env.example') {
    return true;
  }
  
  // Ignore generated zip files
  if (fileName.endsWith('.zip')) {
    return true;
  }
  
  return false;
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    for (const item of items) {
      if (shouldIgnore(item)) {
        continue;
      }
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  console.log('================================================');
  console.log('🚀 VoyagerPulse GitHub Archive Packager');
  console.log('================================================');
  console.log(`Working directory: ${rootDir}`);
  
  // 1. Clean up old artifacts
  if (fs.existsSync(tempDir)) {
    console.log('Cleaning old temporary directory...');
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  if (fs.existsSync(zipFilePath)) {
    console.log('Removing existing zip file...');
    fs.rmSync(zipFilePath, { force: true });
  }

  // 2. Create temp dir and copy files
  console.log('\nGathering clean codebase files...');
  try {
    fs.mkdirSync(tempDir, { recursive: true });
    const rootItems = fs.readdirSync(rootDir);
    
    for (const item of rootItems) {
      if (shouldIgnore(item)) {
        console.log(`  [EXCLUDED] ${item}`);
        continue;
      }
      console.log(`  [INCLUDED] ${item}`);
      copyRecursive(path.join(rootDir, item), path.join(tempDir, item));
    }
  } catch (err) {
    console.error('Error copying files to temporary directory:', err);
    process.exit(1);
  }

  // 3. Compress using OS-native utility
  console.log('\nCompressing codebase into secure ZIP...');
  try {
    if (process.platform === 'win32') {
      // Windows PowerShell
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path '.clean-temp\\*' -DestinationPath '${zipFileName}' -Force"`, { stdio: 'inherit' });
    } else {
      // Unix / macOS zip
      execSync(`cd .clean-temp && zip -rq ../${zipFileName} .`, { stdio: 'inherit' });
    }
    console.log(`\n🎉 Success! Secure archive created: ${zipFileName}`);
  } catch (err) {
    console.error('\n❌ Compression failed:', err.message);
    process.exit(1);
  } finally {
    // 4. Clean up temp folder
    if (fs.existsSync(tempDir)) {
      console.log('\nCleaning up temporary files...');
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
  
  console.log('================================================');
}

main();
