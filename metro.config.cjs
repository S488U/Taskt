const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql");

const finalConfig = withNativewind(config, { input: "./global.css" });

// ---------------------------------------------------------------------------
// FIX: Prevent react-native-css (used by NativeWind) from hijacking
// 'react-native' imports inside node_modules (e.g. expo-asset, expo-font).
// The react-native-css proxy is missing 'AssetRegistry', which causes
// 'TypeError: Cannot read property getAssetByID of undefined' for fonts and icons.
// ---------------------------------------------------------------------------
const originalResolveRequest = finalConfig.resolver.resolveRequest;
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
	if (
		(moduleName === "react-native" || moduleName === "react-native-safe-area-context") &&
		context.originModulePath.includes("node_modules")
	) {
		const parentResolver = config.resolver?.resolveRequest ?? context.resolveRequest;
		return parentResolver(context, moduleName, platform);
	}
	return originalResolveRequest
		? originalResolveRequest(context, moduleName, platform)
		: context.resolveRequest(context, moduleName, platform);
};
// ---------------------------------------------------------------------------

module.exports = finalConfig;
