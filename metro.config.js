const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adiciona 'react-native' às condições de resolução do Metro.
// Isso permite que ele encontre os exports específicos para react-native nos pacotes.
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
