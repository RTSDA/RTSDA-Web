const fs = require('fs');
const path = require('path');
const https = require('https');

async function* getFiles(dir) {
  try {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        // Skip unnecessary directories
        const skippedDirs = ['standalone', 'cache', 'trace', 'server/pages', 'server/static'];
        if (skippedDirs.some(skipped => res.includes(skipped))) continue;
        yield* getFiles(res);
      } else {
        const relPath = path.relative(path.join(__dirname, '.next'), res);
        yield { path: relPath, fullPath: res };
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Directory not found (skipping): ${dir}`);
      return;
    }
    throw error;
  }
}

async function uploadFile(filePath, fileStream) {
  return new Promise((resolve, reject) => {
    console.log('Uploading:', filePath);
    const req = https.request(
      `https://api.cloudflare.com/client/v4/accounts/45e213fed10247ce4f5ff5c4af8fe592/r2/buckets/rtsda-web-assets/objects/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/octet-stream',
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Successfully uploaded:', filePath);
            resolve();
          } else {
            reject(new Error(`Failed to upload ${filePath}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    fileStream.pipe(req);
  });
}

async function uploadPublicFiles() {
  const publicDir = path.join(__dirname, 'public');
  const skippedFiles = ['_worker.js', '.DS_Store'];
  
  // Upload files directly in public directory
  for (const file of await fs.promises.readdir(publicDir)) {
    if (skippedFiles.includes(file)) continue;
    const fullPath = path.join(publicDir, file);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isFile()) {
      const fileStream = fs.createReadStream(fullPath);
      await uploadFile(`public/${file}`, fileStream);
    }
  }

  // Upload images specifically
  const imagesDir = path.join(publicDir, 'images');
  for (const file of await fs.promises.readdir(imagesDir)) {
    if (file === '.DS_Store') continue;
    const fullPath = path.join(imagesDir, file);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isFile()) {
      const fileStream = fs.createReadStream(fullPath);
      await uploadFile(`public/images/${file}`, fileStream);
    }
  }

  // Upload images in events subdirectory
  const eventsImagesDir = path.join(imagesDir, 'events');
  for (const file of await fs.promises.readdir(eventsImagesDir)) {
    if (file === '.DS_Store') continue;
    const fullPath = path.join(eventsImagesDir, file);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isFile()) {
      const fileStream = fs.createReadStream(fullPath);
      await uploadFile(`public/images/events/${file}`, fileStream);
    }
  }
}

async function uploadDirectory() {
  try {
    // First upload .next files
    const sourceDir = path.join(__dirname, '.next');
    const requiredPrefixes = ['static/', 'server/app/', 'BUILD_ID', 'manifest.json', 'client-reference-manifest', 'app-build-manifest'];
    
    for await (const { path: filePath, fullPath } of getFiles(sourceDir)) {
      // Only upload files that match our required prefixes
      if (requiredPrefixes.some(prefix => filePath.includes(prefix))) {
        const fileStats = await fs.promises.stat(fullPath);
        if (fileStats.isFile()) {
          const fileStream = fs.createReadStream(fullPath);
          
          // Handle different types of files
          if (filePath.startsWith('static/')) {
            // Static assets (JS, CSS, etc)
            await uploadFile(`_next/${filePath}`, fileStream);
          } else if (filePath.startsWith('server/app/')) {
            // HTML files and other server files
            await uploadFile(`_next/${filePath}`, fileStream);
          } else if (
            filePath === 'BUILD_ID' || 
            filePath.endsWith('manifest.json') ||
            filePath.includes('client-reference-manifest') ||
            filePath.includes('app-build-manifest')
          ) {
            // Build files and manifests
            await uploadFile(`_next/${filePath}`, fileStream);
          }
        }
      }
    }

    // Then upload public files
    await uploadPublicFiles();

    console.log('Upload completed successfully!');
  } catch (error) {
    console.error('Error during upload:', error);
    process.exit(1);
  }
}

uploadDirectory().catch(console.error);
