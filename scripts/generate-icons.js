import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/logo.png');
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');

  try {
    // 192x192
    await sharp(logoPath)
      .resize(192, 192, { fit: 'cover', background: '#000000' })
      .png()
      .toFile(path.join(iconsDir, 'icon-192x192.png'));
    console.log('✅ icon-192x192.png créée');

    // 512x512
    await sharp(logoPath)
      .resize(512, 512, { fit: 'cover', background: '#000000' })
      .png()
      .toFile(path.join(iconsDir, 'icon-512x512.png'));
    console.log('✅ icon-512x512.png créée');

    console.log('\n✨ Icônes PWA générées avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateIcons();
