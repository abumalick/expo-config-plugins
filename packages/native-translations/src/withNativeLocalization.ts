import {ConfigPlugin, createRunOncePlugin} from '@expo/config-plugins'
import {Translation} from './withNativeLocalization.types'
import {withNativeLocalizationAndroid} from './withNativeLocalizationAndroid'
import {withNativeLocalizationIOS} from './withNativeLocalizationIOS'

const withNativeLocalization: ConfigPlugin<{
  translations: Translation[]
}> = (config, {translations}) => {
  config = withNativeLocalizationAndroid(config, {translations})
  config = withNativeLocalizationIOS(config, {translations})
  return config
}

export default createRunOncePlugin(
  withNativeLocalization,
  'expo-with_native_localization',
  '1.0.0',
)
