import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/logo.png');
const publicDir = path.join(__dirname, '../public');

async function generateFaviconIco() {
  console.log('🎨 Génération du favicon.ico...\n');

  try {
    // Créer un favicon 32x32 PNG
    await sharp(logoPath)
      .resize(32, 32, { fit: 'cover', background: '#000000' })
      .png()
      .toFile(path.join(publicDir, 'favicon.ico.png'));
    console.log('✅ favicon.ico (32x32) créée');

    console.log('\n✨ Favicon.ico généré avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateFaviconIco();
