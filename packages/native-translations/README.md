# expo-native-translations

Expo Config Plugin to configure native translations when the native code is generated (`expo prebuild`).

Adding this plugin lets you address two limitations of expo based apps:

- Use special scripting languages for your app name (Arabic, etc.)
- Use native translations for your app name

## Expo installation

> Tested against Expo SDK 45

This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

- First install the package with yarn, npm, or [`expo install`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
expo install expo-native-translations
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-native-translations",
        {
          "translations": [
            { "locale": "ar", "appName": "تجرب" },
            { "locale": "en", "appName": "Plugin app" }
          ]
        }
      ]
    ]
  }
}
```

**The first element is the default language. You need to have at least one element in your translations array.**

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.
