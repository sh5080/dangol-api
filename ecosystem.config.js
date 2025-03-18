const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

module.exports = {
  apps: [
    {
      name: "nuworks-api",
      script: "dist/src/main.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        PORT: 8081,
        ...process.env,
      },
    },
  ],
};
