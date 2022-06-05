/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "cloudflare-workers",
  server: "./server.ts",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ["**/.*", "**/*.css"],
  devServerPort: 8002,
  cacheDirectory: "./node_modules/.cache/remix",
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
};
