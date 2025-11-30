module.exports = {
  apps: [
    {
      name: "api-dona-zulmira",
      script: "dist/src/main.js",
      cwd: "C:/Gestão Dona-Zulmira/Dona-Zulmira-Back-End",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
