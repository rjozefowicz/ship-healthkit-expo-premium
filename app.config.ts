export default {
  expo: {
    name: 'Health Stack Companion',
    slug: 'ship-healthkit-premium',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme: 'healthstack',
    ios: {
      bundleIdentifier: 'com.example.healthstack',
      supportsTablet: false,
      deploymentTarget: '16.0',
      entitlements: {
        'com.apple.security.application-groups': ['group.com.example.healthstack'],
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSSupportsLiveActivities: true,
        UIBackgroundModes: ['fetch'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0B1220',
      },
      package: 'com.example.healthstack',
    },
    extra: {
      eas: {
        build: {
          experimental: {
            ios: {
              appExtensions: [
                {
                  targetName: 'HealthStackWatch',
                  bundleIdentifier: 'com.example.healthstack.watchkitapp',
                  entitlements: {
                    'com.apple.security.application-groups': [
                      'group.com.example.healthstack',
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    plugins: [
      [
        '@kingstinct/react-native-healthkit',
        {
          NSHealthShareUsageDescription:
            'This app reads your steps, sleep, and heart rate locally to power the dashboard, widgets, and Watch companion. Data stays on your device.',
          NSHealthUpdateUsageDescription:
            'This app can save workouts and water intake you log so they appear in Apple Health and count toward your Activity rings.',
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#0B1220',
          image: './assets/splash.png',
          imageWidth: 200,
          resizeMode: 'contain',
          dark: {
            backgroundColor: '#0B1220',
            image: './assets/splash.png',
          },
        },
      ],
      [
        'expo-widgets',
        {
          bundleIdentifier: 'com.example.healthstack.widgets',
          groupIdentifier: 'group.com.example.healthstack',
          enablePushNotifications: false,
        },
      ],
      './plugins/withCompanionWidget',
      './plugins/withCompanionNative',
    ],
  },
};
