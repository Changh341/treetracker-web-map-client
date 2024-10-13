/* eslint-disable require-await */

const { withSentryConfig } = require('@sentry/nextjs');
const withImages = require('next-images');

const nextConfig = {
  ...withImages(),
  images: {
    domains: [
      'treetracker-production-images.s3.eu-central-1.amazonaws.com',
      'treetracker-dev-images.s3.eu-central-1.amazonaws.com',
      '180.earth',
      'purecatamphetamine.github.io',
      'treetracker-production.nyc3.digitaloceanspaces.com',
    ],
    disableStaticImages: true,
  },
  async rewrites() {
    return [
      {
        source: '/planters/:planterId(\\d{1,})/trees/:treeId(\\d{1,})',
        destination: '/trees/:treeId(\\d{1,})',
      },
      {
        source:
          '/organizations/:organizationId([0-9a-zA-Z-]{1,})/trees/:treeId(\\d{1,})',
        destination: '/trees/:treeId(\\d{1,})',
      },
      {
        source: '/wallets/:walletId([0-9a-zA-Z-]{1,})/tokens/:tokenId(.{36})',
        destination: '/tokens/:tokenId([a-z0-9-]{36})',
      },
      {
        source: '/map/:map_name(\\d{1,})',
        destination: '/?map=:map_name',
      },
      {
        source: '/wallets/:walletId([0-9a-zA-Z-]{1,})/tokens',
        destination: '/tokens/idfromquery',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path((?!trees).*)',
        has: [
          {
            type: 'query',
            key: 'treeid',
            value: '(?<treeId>(\\d{1,}))',
          },
        ],
        destination: '/trees/:treeId(\\d{1,})',
        permanent: true,
      },
      {
        source: '/:path((?!planters).*)',
        has: [
          {
            type: 'query',
            key: 'userid',
            value: '(?<planterId>(\\d{1,}))',
          },
        ],
        destination: '/planters/:planterId(\\d{1,})',
        permanent: true,
      },
      {
        source: '/:path((?!wallets).*)',
        has: [
          {
            type: 'query',
            key: 'wallet',
            value: '(?<walletId>(\\w{1,}))',
          },
        ],
        destination: '/wallets/:walletId(\\d{1,})',
        permanent: true,
      },
    ];
  },
  basePath: process.env.NEXT_PUBLIC_BASE,
  webpack(config) {
    // console.log(
    //   'next config object /n //////////////////////: /n',
    //   config,
    //   '/n//////////////////////////////',
    // );
    console.log(config.name, config.mode, config.devtool);
    config.module.rules.push(
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: { icon: true },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {},
          },
        ],
      },
    );
    return config;
  },
};

// Injected content via Sentry wizard below

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'howardchang',
  project: 'javascript',
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: false,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
