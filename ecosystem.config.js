module.exports = {
  apps: [
    {
      name: 'aapno-khano-pos',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
