/* eslint-disable no-shadow */
import {
  ConfigPlugin,
  withDangerousMod,
  withStringsXml,
} from '@expo/config-plugins'
import fs from 'fs'
import {Translation} from './withNativeLocalization.types'

export const withAndroidDefaultAppName: ConfigPlugin<{
  defaultAppName: string
}> = (config, {defaultAppName}) => {
  return withStringsXml(config, (config) => {
    const strings = config.modResults.resources.string
    const appNameString = strings?.find((s) => s.$.name === 'app_name')
    if (!appNameString) {
      throw new Error(`Didn't find app_name string in strings.xml`)
    }
    appNameString._ = defaultAppName
    return config
  })
}

export const withAndroidTranslations: ConfigPlugin<{
  translations: Translation[]
}> = (config, {translations}) => {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const resPath = `${config.modRequest.platformProjectRoot}/app/src/main/res/`
      translations.forEach(({locale, appName}, index) => {
        if (index === 0) return // Default language is handled by withDefaultAppName
        const localizedFolderPath = `${resPath}/values-b+${locale}`
        const localizedStringsPath = `${localizedFolderPath}/strings.xml`
        if (fs.existsSync(localizedStringsPath)) {
          throw new Error(
            `strings.xml already exists for locale ${locale}, this plugin does not support updating existing file`,
          )
        }
        if (!fs.existsSync(localizedFolderPath)) {
          fs.mkdirSync(localizedFolderPath)
        }
        const fileContents = `<resources>
    <string name="app_name">${appName.replace(`'`, `\\'`)}</string>
</resources>
`
        fs.writeFileSync(localizedStringsPath, fileContents, 'utf8')
      })

      return config
    },
  ])
}

export const withNativeLocalizationAndroid: ConfigPlugin<{
  translations: Translation[]
}> = (config, {translations}) => {
  const defaultAppName = translations[0].appName

  config = withAndroidDefaultAppName(config, {defaultAppName})
  if (translations.length > 1) {
    config = withAndroidTranslations(config, {translations})
  }

  return config
}
