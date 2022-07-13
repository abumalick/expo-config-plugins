"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNativeLocalizationIOS = exports.withIOSTranslationsFiles = exports.withIOSXCodeProject = exports.withIOSInfoPlist = void 0;
/* eslint-disable no-shadow */
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const withIOSInfoPlist = (config, { defaultAppName, defaultLocale }) => {
    config = config_plugins_1.withInfoPlist(config, (config) => {
        config.modResults.CFBundleDevelopmentRegion = defaultLocale;
        config.modResults.CFBundleDisplayName = defaultAppName;
        return config;
    });
    return config;
};
exports.withIOSInfoPlist = withIOSInfoPlist;
const withIOSXCodeProject = (config, { defaultLocale, translations, isMultilingual }) => {
    config = config_plugins_1.withXcodeProject(config, (config) => {
        const translationsWithIds = translations.map((translation) => ({
            ...translation,
            id: utils_1.generateXCodeId(),
        }));
        const xcodeProject = config.modResults;
        const { objects, rootObject: rootObjectName } = xcodeProject.hash.project;
        const PBXProject = objects.PBXProject[rootObjectName];
        PBXProject.developmentRegion = defaultLocale;
        PBXProject.knownRegions = PBXProject.knownRegions
            .filter((region) => region !== 'en')
            .concat(translations.map(({ locale }) => locale));
        if (!isMultilingual) {
            // No need to create translations files and all the stuff
            return config;
        }
        const buildFiledId = utils_1.generateXCodeId();
        const strFileRef = utils_1.generateXCodeId();
        const PBXBuildFile = objects.PBXBuildFile;
        PBXBuildFile[buildFiledId] = {
            isa: 'PBXBuildFile',
            fileRef: strFileRef,
            fileRef_comment: 'InfoPlist.strings',
        };
        PBXBuildFile[buildFiledId + '_comment'] = 'InfoPlist.strings in Resources';
        const PBXFileReference = objects.PBXFileReference;
        translationsWithIds.forEach(({ locale, id }) => {
            PBXFileReference[id] = {
                isa: 'PBXFileReference',
                lastKnownFileType: 'text.plist.strings',
                name: locale,
                path: `${locale}.lproj/InfoPlist.strings`,
                sourceTree: '"<group>"',
            };
            PBXFileReference[id + '_comment'] = locale;
        });
        const PBXGroup = objects.PBXGroup;
        // TODO: Can we find this ID from somewhere?
        PBXGroup['13B07FAE1A68108700A75B9A'].children.push({
            value: strFileRef,
            comment: 'InfoPlist.strings',
        });
        const PBXResourcesBuildPhase = objects.PBXResourcesBuildPhase;
        // TODO: Can we find this ID from somewhere?
        PBXResourcesBuildPhase['13B07F8E1A680F5B00A75B9A'].files.push({
            value: buildFiledId,
            comment: 'InfoPlist.strings in Resources',
        });
        objects.PBXVariantGroup = {
            [strFileRef]: {
                isa: 'PBXVariantGroup',
                children: translationsWithIds.map(({ id, locale }) => ({
                    value: id,
                    comment: locale,
                })),
                name: 'InfoPlist.strings',
                sourceTree: '"<group>"',
            },
            [strFileRef + '_comment']: 'InfoPlist.strings',
        };
        return config;
    });
    return config;
};
exports.withIOSXCodeProject = withIOSXCodeProject;
const withIOSTranslationsFiles = (config, { translations }) => {
    return config_plugins_1.withDangerousMod(config, [
        'ios',
        (config) => {
            const resPath = config.modRequest.platformProjectRoot;
            translations.forEach(({ locale, appName }) => {
                const localizedFolderPath = `${resPath}/${locale}.lproj`;
                const localizedStringsPath = `${localizedFolderPath}/InfoPlist.strings`;
                if (fs_1.default.existsSync(localizedStringsPath)) {
                    throw new Error(`InfoPlist.strings already exists for locale ${locale}, this plugin does not support updating existing file`);
                }
                if (!fs_1.default.existsSync(localizedFolderPath)) {
                    fs_1.default.mkdirSync(localizedFolderPath);
                }
                const fileContents = `"CFBundleDisplayName" = "${appName}";
"CFBundleName" = "${appName}";
`;
                fs_1.default.writeFileSync(localizedStringsPath, fileContents, 'utf8');
            });
            return config;
        },
    ]);
};
exports.withIOSTranslationsFiles = withIOSTranslationsFiles;
const withNativeLocalizationIOS = (config, { translations }) => {
    const { appName: defaultAppName, locale: defaultLocale } = translations[0];
    const isMultilingual = translations.length > 1;
    config = exports.withIOSInfoPlist(config, { defaultAppName, defaultLocale });
    config = exports.withIOSXCodeProject(config, {
        defaultLocale,
        translations,
        isMultilingual,
    });
    if (isMultilingual) {
        config = exports.withIOSTranslationsFiles(config, { translations });
    }
    return config;
};
exports.withNativeLocalizationIOS = withNativeLocalizationIOS;
