const { withGradleProperties } = require("expo/config-plugins");

const DEFAULTS = {
  "org.gradle.jvmargs":
    "-Xmx3072m -XX:MaxMetaspaceSize=768m -Dfile.encoding=UTF-8",
  "org.gradle.workers.max": "2",
  "org.gradle.caching": "true",
  "org.gradle.configuration-cache": "false",
  reactNativeArchitectures: "arm64-v8a,x86_64",
};

function setProperty(props, key, value) {
  const existing = props.find((p) => p.type === "property" && p.key === key);
  if (existing) {
    existing.value = value;
  } else {
    props.push({ type: "property", key, value });
  }
}

module.exports = function withGradleTuning(config, overrides = {}) {
  return withGradleProperties(config, (cfg) => {
    const values = { ...DEFAULTS, ...overrides };

    for (const [key, value] of Object.entries(values)) {
      setProperty(cfg.modResults, key, value);
    }
    return cfg;
  });
};