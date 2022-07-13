"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withNativeLocalizationAndroid_1 = require("./withNativeLocalizationAndroid");
const withNativeLocalizationIOS_1 = require("./withNativeLocalizationIOS");
const withNativeLocalization = (config, { translations }) => {
    config = withNativeLocalizationAndroid_1.withNativeLocalizationAndroid(config, { translations });
    config = withNativeLocalizationIOS_1.withNativeLocalizationIOS(config, { translations });
    return config;
};
exports.default = config_plugins_1.createRunOncePlugin(withNativeLocalization, 'expo-with_native_localization', '1.0.0');
