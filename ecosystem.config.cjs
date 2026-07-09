module.exports = {
  apps: [
    {
      name: 'maplenpine-portal',
      script: '.output/server/index.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
}
