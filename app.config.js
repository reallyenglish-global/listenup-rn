// CI-only versionCode override; local/preview configuration remains unchanged.
module.exports = ({ config }) => {
  const code = process.env.PLAY_VERSION_CODE;
  if (!code) return config;
  if (!/^[1-9][0-9]*$/.test(code) || Number(code) > 2100000000) {
    throw new Error('Invalid PLAY_VERSION_CODE');
  }
  return { ...config, android: { ...config.android, versionCode: Number(code) } };
};
