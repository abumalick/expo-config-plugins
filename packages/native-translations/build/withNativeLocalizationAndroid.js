"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNativeLocalizationAndroid = exports.withAndroidTranslations = exports.withAndroidDefaultAppName = void 0;
/* eslint-disable no-shadow */
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const withAndroidDefaultAppName = (config, { defaultAppName }) => {
    return config_plugins_1.withStringsXml(config, (config) => {
        const strings = config.modResults.resources.string;
        const appNameString = strings === null || strings === void 0 ? void 0 : strings.find((s) => s.$.name === 'app_name');
        if (!appNameString) {
            throw new Error(`Didn't find app_name string in strings.xml`);
        }
        appNameString._ = defaultAppName;
        return config;
    });
};
exports.withAndroidDefaultAppName = withAndroidDefaultAppName;
const withAndroidTranslations = (config, { translations }) => {
    return config_plugins_1.withDangerousMod(config, [
        'android',
        (config) => {
            const resPath = `${config.modRequest.platformProjectRoot}/app/src/main/res/`;
            translations.forEach(({ locale, appName }, index) => {
                if (index === 0)
                    return; // Default language is handled by withDefaultAppName
                const localizedFolderPath = `${resPath}/values-b+${locale}`;
                const localizedStringsPath = `${localizedFolderPath}/strings.xml`;
                if (fs_1.default.existsSync(localizedStringsPath)) {
                    throw new Error(`strings.xml already exists for locale ${locale}, this plugin does not support updating existing file`);
                }
                if (!fs_1.default.existsSync(localizedFolderPath)) {
                    fs_1.default.mkdirSync(localizedFolderPath);
                }
                const fileContents = `<resources>
    <string name="app_name">${appName.replace(`'`, `\\'`)}</string>
</resources>
`;
                fs_1.default.writeFileSync(localizedStringsPath, fileContents, 'utf8');
            });
            return config;
        },
    ]);
};
exports.withAndroidTranslations = withAndroidTranslations;
const withNativeLocalizationAndroid = (config, { translations }) => {
    const defaultAppName = translations[0].appName;
    config = exports.withAndroidDefaultAppName(config, { defaultAppName });
    if (translations.length > 1) {
        config = exports.withAndroidTranslations(config, { translations });
    }
    return config;
};
exports.withNativeLocalizationAndroid = withNativeLocalizationAndroid;
