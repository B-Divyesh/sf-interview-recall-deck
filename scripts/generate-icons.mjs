import sharp from 'sharp';
await sharp('assets/src/app-icon.svg').resize(192, 192).png().toFile('public/icon-192.png');
await sharp('assets/src/app-icon.svg').resize(512, 512).png().toFile('public/icon-512.png');
