# Deploy — arrecifes.cercu.com.mx

Mismo patrón que `humedales.cercu.com.mx` y `observatorio.cercu.com.mx`:
- Nuxt node-server + PM2 en puerto **3007**
- Nginx reverse proxy con subdominio
- Proyecto en `/var/www/cercu-frontend/arrecifes/`

## 1. DNS (✅ ya hecho)

Registro A `arrecifes.cercu.com.mx → 72.62.200.124`.

## 2. Subir el proyecto al servidor

```bash
# Desde tu máquina local
rsync -avz --exclude node_modules --exclude .nuxt --exclude .output --exclude .git \
  . root@72.62.200.124:/var/www/cercu-frontend/arrecifes/
```

> Si el directorio destino no existe, créalo primero:
> `ssh root@72.62.200.124 "mkdir -p /var/www/cercu-frontend/arrecifes"`

## 3. Construir y arrancar PM2 (en el servidor)

```bash
ssh root@72.62.200.124

cd /var/www/cercu-frontend/arrecifes
npm install
npm run build

# Opción A — agregar la entrada al ecosystem.config.cjs existente y recargar
pm2 reload ecosystem.config.cjs --only arrecifes

# Opción B — arrancar directo
pm2 start .output/server/index.mjs --name arrecifes -- --port 3007
pm2 save
```

## 4. Configurar Nginx

```bash
nano /etc/nginx/http.d/cercu.conf
# Pega el bloque server de deploy/nginx.conf al final del archivo

nginx -t
rc-service nginx reload         # Alpine; en Debian/Ubuntu: systemctl reload nginx
```

## 5. SSL con Certbot

```bash
certbot --nginx -d arrecifes.cercu.com.mx
```

Certbot reescribirá el bloque server con las directivas `listen 443 ssl` y certificados;
las líneas en `deploy/nginx.conf` ya reflejan ese estado final.

## 6. Backend cercu-backend

Si aún no, en `cercu-backend` corre el seed para crear las tablas y dejar al admin con
acceso a `arrecifes`:

```bash
ssh root@72.62.200.124
cd /var/www/cercu-backend
git pull origin main
npm install
npm run build
npm run seed                    # añade 'arrecifes' al ObservatoryAdmin existente
pm2 restart cercu-api
```

Y agrega `https://arrecifes.cercu.com.mx` a `CORS_ORIGIN` en el `.env` del backend.

## 7. Verificar

```bash
curl -I https://arrecifes.cercu.com.mx
curl https://arrecifes.cercu.com.mx/api/v1/observatory/arrecifes/reefs | head -c 400
pm2 status
```

Login admin: `https://arrecifes.cercu.com.mx/admin/login` con `OBS_ADMIN_EMAIL` /
`OBS_ADMIN_PASSWORD` del backend.

## Actualizar (después del deploy inicial)

```bash
# Desde local
rsync -avz --exclude node_modules --exclude .nuxt --exclude .output --exclude .git \
  . root@72.62.200.124:/var/www/cercu-frontend/arrecifes/

# En el servidor
ssh root@72.62.200.124
cd /var/www/cercu-frontend/arrecifes
npm install
npm run build
pm2 restart arrecifes
```

## Mapa de puertos PM2

| Servicio | Puerto |
|----------|--------|
| cercu-frontend | 3001 |
| observatorio-techos-verdes | 3002 |
| cercu-backend | 3003 |
| observatorio-humedales | 3005 |
| **observatorio-arrecifes** | **3007** |
