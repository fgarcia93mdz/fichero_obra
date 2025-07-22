# Configuración para Deployment con HTTPS

## Opciones de Hosting Gratuito con HTTPS:

### 1. Netlify (Recomendado para este proyecto)
```bash
npm run build
# Subir carpeta 'build' a netlify.com
# HTTPS automático
```

### 2. Vercel
```bash
npm install -g vercel
vercel --prod
# HTTPS automático
```

### 3. GitHub Pages con dominio custom
```bash
# Configurar dominio con SSL
# GitHub provee HTTPS automático
```

### 4. Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
# HTTPS automático
```

## Configuración para Producción:

### Frontend (.env.production):
```
REACT_APP_API_URL=https://tu-backend.herokuapp.com/api
HTTPS=true
```

### Backend (para hosting):
```javascript
// En app.js - configuración CORS para producción
const corsOptions = {
  origin: [
    'https://tu-app.netlify.app',
    'https://tu-dominio.com'
  ],
  credentials: true
};
```

## Consideraciones importantes:

1. **Service Workers:** Solo funcionan con HTTPS en producción
2. **PWA Install:** Requiere HTTPS para instalación
3. **Camera API:** Más estable con HTTPS
4. **Geolocation:** Algunas funciones requieren HTTPS

## Testing Local:

- Para desarrollo: usa localhost con HTTP
- Para testing PWA: usa localhost con HTTPS (como tienes ahora)
- Para testing móvil: sube a hosting temporal

## Recomendación:

Para tu caso, Netlify es perfecto:
- Deploy gratuito
- HTTPS automático
- CDN global
- Easy deployment desde GitHub
