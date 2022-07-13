import { ConfigPlugin } from '@expo/config-plugins';
import { Translation } from './withNativeLocalization.types';
export declare const withAndroidDefaultAppName: ConfigPlugin<{
    defaultAppName: string;
}>;
export declare const withAndroidTranslations: ConfigPlugin<{
    translations: Translation[];
}>;
export declare const withNativeLocalizationAndroid: ConfigPlugin<{
    translations: Translation[];
}>;
