/* eslint-disable no-shadow */
import {
  ConfigPlugin,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject,
} from '@expo/config-plugins'
import fs from 'fs'
import {generateXCodeId} from './utils'

interface Translation {
  locale: string
  appName: string
}

export const withIOSInfoPlist: ConfigPlugin<{
  defaultAppName: string
  defaultLocale: string
}> = (config, {defaultAppName, defaultLocale}) => {
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleDevelopmentRegion = defaultLocale
    config.modResults.CFBundleDisplayName = defaultAppName
    return config
  })
  return config
}

export const withIOSXCodeProject: ConfigPlugin<{
  defaultLocale: string
  translations: Translation[]
  isMultilingual: boolean
}> = (config, {defaultLocale, translations, isMultilingual}) => {
  config = withXcodeProject(config, (config) => {
    const translationsWithIds: Array<
      Translation & {
        id: string
      }
    > = translations.map((translation) => ({
      ...translation,
      id: generateXCodeId(),
    }))
    const xcodeProject = config.modResults
    const {objects, rootObject: rootObjectName} = xcodeProject.hash.project

    const PBXProject: {
      developmentRegion: string
      knownRegions: string[]
    } = objects.PBXProject[rootObjectName]
    PBXProject.developmentRegion = defaultLocale
    PBXProject.knownRegions = PBXProject.knownRegions
      .filter((region) => region !== 'en')
      .concat(translations.map(({locale}) => locale))

    if (!isMultilingual) {
      // No need to create translations files and all the stuff
      return config
    }

    const buildFiledId = generateXCodeId()
    const strFileRef = generateXCodeId()

    const PBXBuildFile = objects.PBXBuildFile
    PBXBuildFile[buildFiledId] = {
      isa: 'PBXBuildFile',
      fileRef: strFileRef,
      fileRef_comment: 'InfoPlist.strings',
    }
    PBXBuildFile[buildFiledId + '_comment'] = 'InfoPlist.strings in Resources'

    const PBXFileReference = objects.PBXFileReference
    translationsWithIds.forEach(({locale, id}) => {
      PBXFileReference[id] = {
        isa: 'PBXFileReference',
        lastKnownFileType: 'text.plist.strings',
        name: locale,
        path: `${locale}.lproj/InfoPlist.strings`,
        sourceTree: '"<group>"',
      }
      PBXFileReference[id + '_comment'] = locale
    })

    const PBXGroup = objects.PBXGroup
    // TODO: Can we find this ID from somewhere?
    PBXGroup['13B07FAE1A68108700A75B9A'].children.push({
      value: strFileRef,
      comment: 'InfoPlist.strings',
    })

    const PBXResourcesBuildPhase = objects.PBXResourcesBuildPhase
    // TODO: Can we find this ID from somewhere?
    PBXResourcesBuildPhase['13B07F8E1A680F5B00A75B9A'].files.push({
      value: buildFiledId,
      comment: 'InfoPlist.strings in Resources',
    })

    objects.PBXVariantGroup = {
      [strFileRef]: {
        isa: 'PBXVariantGroup',
        children: translationsWithIds.map(({id, locale}) => ({
          value: id,
          comment: locale,
        })),

        name: 'InfoPlist.strings',
        sourceTree: '"<group>"',
      },
      [strFileRef + '_comment']: 'InfoPlist.strings',
    }
    return config
  })
  return config
}

export const withIOSTranslationsFiles: ConfigPlugin<{
  translations: Translation[]
}> = (config, {translations}) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const resPath = config.modRequest.platformProjectRoot
      translations.forEach(({locale, appName}) => {
        const localizedFolderPath = `${resPath}/${locale}.lproj`
        const localizedStringsPath = `${localizedFolderPath}/InfoPlist.strings`
        if (fs.existsSync(localizedStringsPath)) {
          throw new Error(
            `InfoPlist.strings already exists for locale ${locale}, this plugin does not support updating existing file`,
          )
        }
        if (!fs.existsSync(localizedFolderPath)) {
          fs.mkdirSync(localizedFolderPath)
        }
        const fileContents = `"CFBundleDisplayName" = "${appName}";
"CFBundleName" = "${appName}";
`
        fs.writeFileSync(localizedStringsPath, fileContents, 'utf8')
      })

      return config
    },
  ])
}

export const withNativeLocalizationIOS: ConfigPlugin<{
  translations: Translation[]
}> = (config, {translations}) => {
  const {appName: defaultAppName, locale: defaultLocale} = translations[0]
  const isMultilingual = translations.length > 1

  config = withIOSInfoPlist(config, {defaultAppName, defaultLocale})
  config = withIOSXCodeProject(config, {
    defaultLocale,
    translations,
    isMultilingual,
  })
  if (isMultilingual) {
    config = withIOSTranslationsFiles(config, {translations})
  }

  return config
}
