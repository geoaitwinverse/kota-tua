/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      })
    );
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
