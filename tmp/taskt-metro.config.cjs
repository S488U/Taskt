const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql");
// module.exports = withNativeWind(config, {
// 	input: './global.css',
// 	// forceWriteFileSystem: true,
// });

const finalConfig = withNativewind(config);

const originalResolveRequest = finalConfig.resolver.resolveRequest;
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
	// Prevent react-native-css from hijacking react-native / safe-area imports from node_modules
	if (
		(moduleName === "react-native" || moduleName === "react-native-safe-area-context") &&
		context.originModulePath.includes("node_modules")
	) {
		const parentResolver = config.resolver?.resolveRequest ?? context.resolveRequest;
		return parentResolver(context, moduleName, platform);
	}
	return originalResolveRequest(context, moduleName, platform);
};

module.exports = finalConfig;

