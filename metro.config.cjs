const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql");
// module.exports = withNativeWind(config, {
// 	input: './global.css',
// 	// forceWriteFileSystem: true,
// });

module.exports = withNativewind(config);
