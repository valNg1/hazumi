import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/logo.png');
const publicDir = path.join(__dirname, '../public');

async function generateFavicon() {
  console.log('🎨 Génération du favicon.ico...\n');

  try {
    // Générer un favicon 32x32
    await sharp(logoPath)
      .resize(32, 32, { fit: 'cover', background: '#000000' })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✅ favicon-32x32.png créée');

    // Générer un favicon 16x16
    await sharp(logoPath)
      .resize(16, 16, { fit: 'cover', background: '#000000' })
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✅ favicon-16x16.png créée');

    // Générer un apple-touch-icon 180x180 pour iOS
    await sharp(logoPath)
      .resize(180, 180, { fit: 'cover', background: '#000000' })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png créée');

    console.log('\n✨ Favicons générés avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateFavicon();
