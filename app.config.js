import "dotenv/config";

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
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.udead.app",
      infoPlist: {
        NSUserTrackingUsageDescription:
          "We need permission to schedule reminders when it's time to check in.",
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.udead.app",
      permissions: ["RECEIVE_BOOT_COMPLETED", "VIBRATE", "NOTIFICATIONS"],
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
      apiUrl: process.env.API_URL || "http://localhost:3000/api/v1",
      googleIosClientId: process.env.GOOGLE_CLIENT_ID_IOS,
      googleAndroidClientId: process.env.GOOGLE_CLIENT_ID_ANDROID,
      googleWebClientId: process.env.GOOGLE_CLIENT_ID_WEB,
    },
  },
};
