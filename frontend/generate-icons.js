const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños de íconos requeridos para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, 'public', 'icons', 'icon.svg');
const iconsDir = path.join(__dirname, 'public', 'icons');

// Asegurar que el directorio existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generando íconos PWA...');
  
  try {
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`✓ Generado icon-${size}x${size}.png`);
    }
    
    // También generar favicon
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon-32x32.png'));
    
    console.log('✓ Generado favicon-32x32.png');
    console.log('🎉 Todos los íconos generados exitosamente');
    
  } catch (error) {
    console.error('Error generando íconos:', error);
  }
}

generateIcons();
