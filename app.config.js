import "dotenv/config";

const apiUrl = process.env.API_URL;
if (!apiUrl) {
  throw new Error("Missing API_URL environment variable! Build aborted.");
}

export default {
  expo: {
    name: "U dead??",
    slug: "udead",
    version: "1.0.0",
    scheme: "udead",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1b91ff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.udead.app",
      usesAppleSignIn: true,
      privacyManifests: {
        NSPrivacyTracking: false,
        NSPrivacyTrackingDomains: [],
        NSPrivacyCollectedDataTypes: [
          {
            NSPrivacyCollectedDataType:
              "NSPrivacyCollectedDataTypeEmailAddress",
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              "NSPrivacyCollectedDataTypePurposeAppFunctionality",
            ],
          },
          {
            NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeName",
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              "NSPrivacyCollectedDataTypePurposeAppFunctionality",
            ],
          },
          {
            NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeUserID",
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              "NSPrivacyCollectedDataTypePurposeAppFunctionality",
            ],
          },
          {
            NSPrivacyCollectedDataType:
              "NSPrivacyCollectedDataTypeOtherUserContent",
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              "NSPrivacyCollectedDataTypePurposeAppFunctionality",
            ],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1b91ff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.udead.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#FF3B30",
          sounds: [],
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.GOOGLE_REVERSED_CLIENT_ID,
        },
      ],
    ],
    extra: {
      apiUrl,
      googleIosClientId: process.env.GOOGLE_CLIENT_ID_IOS,
      googleAndroidClientId: process.env.GOOGLE_CLIENT_ID_ANDROID,
      googleWebClientId: process.env.GOOGLE_CLIENT_ID_WEB,
      eas: {
        projectId: "cab5f6b7-40a4-4539-93c6-3ff4711c811e",
      },
    },
  },
};
