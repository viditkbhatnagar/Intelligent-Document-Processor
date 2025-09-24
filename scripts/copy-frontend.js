const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // Copy files
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      const curTarget = path.join(targetFolder, file);
      
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    });
  }
}

function copyDistToBackend() {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  const backendTarget = path.join(__dirname, '..', 'backend', 'frontend-build');
  
  console.log('📁 Copying frontend build to backend...');
  
  // Remove existing build
  if (fs.existsSync(backendTarget)) {
    fs.rmSync(backendTarget, { recursive: true, force: true });
    console.log('🗑️  Removed existing frontend-build');
  }
  
  // Check if frontend dist exists
  if (!fs.existsSync(frontendDist)) {
    console.error('❌ Frontend dist folder not found. Run "npm run build:frontend" first.');
    process.exit(1);
  }
  
  // Copy all files from frontend/dist to backend/frontend-build
  fs.mkdirSync(backendTarget, { recursive: true });
  const files = fs.readdirSync(frontendDist);
  
  files.forEach(file => {
    const sourcePath = path.join(frontendDist, file);
    const targetPath = path.join(backendTarget, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, path.dirname(targetPath));
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
  
  console.log('✅ Frontend build copied successfully!');
  console.log(`📍 Location: ${backendTarget}`);
}

copyDistToBackend();
