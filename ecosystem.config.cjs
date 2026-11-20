module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'maplenpine-portal',
      cwd: __dirname,
      node_args: [`--env-file=${require('node:path').join(__dirname, '.env')}`],
      script: '.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Ljubljana',
        PORT: process.env.PORT || 3001,
        NITRO_HOST: '127.0.0.1',
      },
    },
  ],
}
