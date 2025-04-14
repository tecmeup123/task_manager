const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function generateIcons() {
  try {
    // Carregue a imagem SVG
    const svgPath = path.join(__dirname, '../public/icons/icon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Tamanhos dos ícones necessários para PWA
    const sizes = [192, 512];
    
    // Para cada tamanho, crie uma versão PNG do ícone
    for (const size of sizes) {
      // Crie um SVG data URL
      const svgBase64 = Buffer.from(svgContent).toString('base64');
      const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
      
      // Carregue a imagem
      const img = await loadImage(svgDataUrl);
      
      // Crie um canvas para desenhar a imagem
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Desenhe a imagem no canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // Salve o canvas como PNG
      const outputPath = path.join(__dirname, `../public/icons/icon-${size}x${size}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      console.log(`Ícone criado: ${outputPath}`);
    }
    
    console.log('Geração de ícones concluída!');
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
  }
}

generateIcons();