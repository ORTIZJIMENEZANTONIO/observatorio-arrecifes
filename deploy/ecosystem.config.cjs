// PM2 — Observatorio de Arrecifes — México
// Agregar esta entrada al ecosystem.config.cjs de cercu-frontend
module.exports = {
  apps: [
    {
      name: 'arrecifes',
      cwd: '/var/www/cercu-frontend/arrecifes',
      script: '.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
        NUXT_PUBLIC_DATA_MODE: 'api',
        NUXT_PUBLIC_API_BASE_URL: 'https://arrecifes.cercu.com.mx/api/v1',
        NUXT_PUBLIC_OBSERVATORY: 'arrecifes',
      },
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/pm2/arrecifes-error.log',
      out_file: '/var/log/pm2/arrecifes-out.log',
    },
  ],
};
