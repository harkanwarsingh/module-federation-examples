const { withFederatedSidecar } = require("@module-federation/nextjs-mf");
const deps = require("./package.json").dependencies;
module.exports = withFederatedSidecar({
  name: "home",
  filename: "static/chunks/remoteEntry.js",
  exposes: {
    "./nav": "./components/nav.js",
  },
  shared: {
    react: {
      // Notice shared are NOT eager here.
      requiredVersion: false,
      singleton: true,
    },
  },
})({
  webpack5: true,
  webpack(config, options) {
    const { webpack, isServer } = options;
    config.experiments = { topLevelAwait: true };
    config.output.publicPath = "auto";

    config.module.rules.push({
      test: /_app.js/,
      loader: "@module-federation/nextjs-mf/lib/federation-loader.js",
    });

    if (isServer) {
      // ignore it on SSR, realistically you probably wont be SSRing Fmodules, without paid support from @ScriptedAlchemy
      Object.assign(config.resolve.alias, { info: false });
    } else {
      config.output.publicPath = "auto";
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          remoteType: "var",
          remotes: {
            home: "home",
            about: "about",
            info: "info",
          },
          shared: {
            "@module-federation/nextjs-mf/lib/noop": {
              eager: false,
            },
            react: {
              singleton: true,
              eager: true,
              requiredVersion: false,
            },
          },
        })
      );
    }
    return config;
  },
});