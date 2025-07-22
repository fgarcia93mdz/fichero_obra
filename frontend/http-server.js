const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Puerto diferente al backend

// Servir archivos estáticos del build
const buildPath = path.join(__dirname, 'build');

if (!require('fs').existsSync(buildPath)) {
  console.error('❌ No se encontró la carpeta build. Ejecuta "npm run build" primero.');
  process.exit(1);
}

app.use(express.static(buildPath));

// Servir index.html para todas las rutas (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🌐 Servidor HTTP iniciado');
  console.log(`📱 http://localhost:${PORT}`);
  console.log(`📱 http://192.168.x.x:${PORT} (desde móviles en misma red)`);
  console.log('⚠️  NOTA: Solo para testing local. Cámara puede no funcionar en algunos navegadores.');
  console.log('💡 Para producción usa HTTPS hosting');
});
