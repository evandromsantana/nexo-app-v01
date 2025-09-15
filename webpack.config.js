const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Adiciona um alias para forçar o uso de react-native-web-maps na web
  config.resolve.alias['react-native-maps'] = 'react-native-web-maps';

  return config;
};
