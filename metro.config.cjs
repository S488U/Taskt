const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, {
// 	input: './global.css',
// 	// forceWriteFileSystem: true,
// });

module.exports = withNativewind(config);
