import { ConfigPlugin } from '@expo/config-plugins';
interface Translation {
    locale: string;
    appName: string;
}
export declare const withIOSInfoPlist: ConfigPlugin<{
    defaultAppName: string;
    defaultLocale: string;
}>;
export declare const withIOSXCodeProject: ConfigPlugin<{
    defaultLocale: string;
    translations: Translation[];
    isMultilingual: boolean;
}>;
export declare const withIOSTranslationsFiles: ConfigPlugin<{
    translations: Translation[];
}>;
export declare const withNativeLocalizationIOS: ConfigPlugin<{
    translations: Translation[];
}>;
export {};
