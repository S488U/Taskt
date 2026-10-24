const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "// withReleaseConfig";

module.exports = function withApkName(config, options = {}) {
  const appName = options.appName || "Taskt";

  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      throw new Error("withApkName only supports a Groovy build.gradle");
    }

    if (cfg.modResults.contents.includes(MARKER)) {
      return cfg;
    }

    const snippet = [
      "",
      MARKER,
      "android {",
      "    signingConfigs {",
      "        release {",
      "            if (findProperty('TASKT_RELEASE_STORE_FILE')) {",
      "                storeFile file(TASKT_RELEASE_STORE_FILE)",
      "                storePassword TASKT_RELEASE_STORE_PASSWORD",
      "                keyAlias TASKT_RELEASE_KEY_ALIAS",
      "                keyPassword TASKT_RELEASE_KEY_PASSWORD",
      "            }",
      "        }",
      "    }",
      "    buildTypes {",
      "        release {",
      "            if (findProperty('TASKT_RELEASE_STORE_FILE')) {",
      "                signingConfig signingConfigs.release",
      "            }",
      "        }",
      "    }",
      "    def enableSplit = (findProperty('enableSplitApks') ?: 'false').toBoolean()",
      "    if (enableSplit) {",
      "        splits {",
      "            abi {",
      "                reset()",
      "                enable true",
      "                universalApk false",
      "                include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'",
      "            }",
      "        }",
      "    }",
      "    applicationVariants.all { variant ->",
      '        if (variant.buildType.name == "release") {',
      "            variant.outputs.all { output ->",
      "                def abi = output.getFilter(com.android.build.OutputFile.ABI)",
      "                if (abi != null) {",
      '                    output.outputFileName = (abi == "arm64-v8a" ? "' +
        appName +
        '.apk" : "' +
        appName +
        '-${abi}.apk")',
      "                } else {",
      '                    output.outputFileName = "' +
        appName +
        '-${variant.versionName}.apk"',
      "                }",
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
