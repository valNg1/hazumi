import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/logo.png');
const faviconPath = path.join(__dirname, '../public/favicon.svg');
const publicDir = path.join(__dirname, '../public');

async function createFaviconSvg() {
  console.log('🎨 Création du favicon.svg Hazumi...\n');

  try {
    // Créer une base64 du logo redimensionné en PNG
    const pngBuffer = await sharp(logoPath)
      .resize(64, 64, { fit: 'cover', background: '#000000' })
      .png()
      .toBuffer();

    const base64 = pngBuffer.toString('base64');

    // Créer un SVG qui contient l'image
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <image href="data:image/png;base64,${base64}" width="64" height="64"/>
</svg>`;

    await writeFile(faviconPath, svg, 'utf-8');
    console.log('✅ favicon.svg créée avec le logo Hazumi');
    console.log('✨ Favicon remplacé avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createFaviconSvg();
