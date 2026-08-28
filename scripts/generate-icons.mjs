import sharp from 'sharp';
await sharp('assets/src/app-icon.svg').resize(192, 192).png().toFile('public/icon-192.png');
await sharp('assets/src/app-icon.svg').resize(512, 512).png().toFile('public/icon-512.png');
await sharp('assets/src/app-icon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp('assets/src/recall-landscape.png').resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 84 }).toFile('public/og-recall-deck.jpg');
