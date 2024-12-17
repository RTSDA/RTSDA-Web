const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run Next.js build
console.log('Building Next.js app...');
execSync('next build', { stdio: 'inherit' });

// Function to split large files
function splitLargeFiles(directory, maxSize = 20 * 1024 * 1024) { // 20MB
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      splitLargeFiles(filePath, maxSize);
    } else if (stats.size > maxSize) {
      console.log(`Splitting large file: ${file}`);
      
      // Read the file
      const content = fs.readFileSync(filePath);
      
      // Calculate number of parts needed
      const parts = Math.ceil(stats.size / maxSize);
      
      // Split and write parts
      for (let i = 0; i < parts; i++) {
        const start = i * maxSize;
        const end = Math.min((i + 1) * maxSize, stats.size);
        const partContent = content.slice(start, end);
        
        const partPath = `${filePath}.part${i + 1}`;
        fs.writeFileSync(partPath, partContent);
      }
      
      // Delete original file
      fs.unlinkSync(filePath);
      
      // Create manifest file
      const manifest = {
        originalName: file,
        parts: parts,
        size: stats.size
      };
      
      fs.writeFileSync(`${filePath}.manifest`, JSON.stringify(manifest));
    }
  });
}

// Process the build output
console.log('Processing build output...');
splitLargeFiles(path.join(process.cwd(), '.next'));
