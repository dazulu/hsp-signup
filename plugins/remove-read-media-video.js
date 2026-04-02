const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Removes the READ_MEDIA_VIDEO permission injected automatically by
 * expo-media-library. The app only saves photos — it never reads or
 * processes video files.
 */
module.exports = function removeReadMediaVideo(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults;
    if (!manifest.manifest["uses-permission"]) {
      return modConfig;
    }

    manifest.manifest["uses-permission"] = manifest.manifest[
      "uses-permission"
    ].filter(
      (permission) =>
        permission.$?.["android:name"] !==
        "android.permission.READ_MEDIA_VIDEO",
    );

    return modConfig;
  });
};
