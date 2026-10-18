const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "// withApkName";

module.exports = function withApkName(config, options = {}) {
  const appName = options.appName || "Taskt";

  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      throw new Error("withApkName only supports a Groovy build.gradle");
    }

    // Skip if already injected, so repeated prebuilds do not duplicate it
    if (cfg.modResults.contents.includes(MARKER)) {
      return cfg;
    }

    const snippet = [
      "",
      MARKER,
      "android {",
      "    applicationVariants.all { variant ->",
      '        if (variant.buildType.name == "release") {',
      "            variant.outputs.all { output ->",
      '                output.outputFileName = "' +
        appName +
        '-${variant.versionName}.apk"',
      "            }",
      "        }",
      "    }",
      "}",
      "",
    ].join("\n");

    cfg.modResults.contents += snippet;
    return cfg;
  });
};