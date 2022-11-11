// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const withPlugins = require("next-compose-plugins");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const withCustomBabelConfigFile = require("next-plugin-custom-babel-config");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const withVideos = require("next-videos");

/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// module.exports = withPlugins(
//   [
//     // [
//     //   withCustomBabelConfigFile,
//     //   {
//     //     babelConfigFile: path.resolve("./babel.next.config.js"),
//     //     // webpack5: false,
//     //     env: {
//     //       // overridden by start script
//     //       CWD: path.resolve("./tests/project"),
//     //     },
//     //     webpack: (config, { isServer }) => {
//     //       if (!isServer) {
//     //         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//     //         config.node = { fs: "empty", child_process: "empty" };
//     //       }
//     //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
//     //       config.module.rules.push({
//     //         test: /\.svg$/,
//     //         issuer: {
//     //           test: /\.(js|ts)x?$/,
//     //         },
//     //         use: ["@svgr/webpack"],
//     //       });
//     //
//     //       // // Fix OpenSSL `ERR_OSSL_EVP_UNSUPPORTED` error on recent Node.js versions.
//     //       // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//     //       // config.output.hashFunction = "md5";
//     //
//     //       // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//     //       return config;
//     //     },
//     //   },
//     // ],
//     withVideos,
//   ],
//   {
//     distDir: "./build/client",
//   }
// );
