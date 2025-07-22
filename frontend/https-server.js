const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

// Crear certificados autofirmados para desarrollo
const forge = require('node-forge');

function createCertificate() {
  const pki = forge.pki;
  
  // Generar par de claves
  const keys = pki.rsa.generateKeyPair(2048);
  
  // Crear certificado
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'ES'
  }, {
    shortName: 'ST',
    value: 'Madrid'
  }, {
    name: 'localityName',
    value: 'Madrid'
  }, {
    name: 'organizationName',
    value: 'Fichero Obra Dev'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'nsCertType',
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }]);
  
  cert.sign(keys.privateKey);
  
  return {
    cert: pki.certificateToPem(cert),
    key: pki.privateKeyToPem(keys.privateKey)
  };
}

async function startHttpsServer() {
  const app = express();
  
  // Servir archivos estáticos del build
  const buildPath = path.join(__dirname, 'build');
  
  if (!fs.existsSync(buildPath)) {
    console.error('❌ No se encontró la carpeta build. Ejecuta "npm run build" primero.');
    process.exit(1);
  }
  
  app.use(express.static(buildPath));
  
  // Servir index.html para todas las rutas (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  // Crear certificados
  console.log('🔐 Generando certificados SSL...');
  const { cert, key } = createCertificate();
  
  const httpsOptions = {
    key: key,
    cert: cert
  };
  
  const PORT = process.env.PORT || 3444;
  
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log('✅ Servidor HTTPS iniciado');
    console.log(`🌐 https://localhost:${PORT}`);
    console.log('📱 Ideal para testing PWA y acceso a cámara');
    console.log('⚠️  Acepta el certificado autofirmado en el navegador');
  });
}

startHttpsServer().catch(console.error);
