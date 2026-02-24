# U dead?? 💀

**"Don't ghost your loved ones"**

A Dead Man's Switch app built with React Native (Expo). Check in periodically or your emergency contacts get notified.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- iOS Simulator (Mac) or Android Emulator
- Backend running at `http://localhost:3000/api/v1`

### Installation

```bash
# Install dependencies
npm install

# Start the Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

---

## 📱 Testing the App

### 1. **Start Backend**
Make sure your fake backend is running at `http://localhost:3000/api/v1`

### 2. **Launch App**
```bash
npm start
```
Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web browser

### 3. **Test Flow**

#### **A. Sign In**
- Tap "Sign in with Google" or "Sign in with Apple"
- Mock authentication will create a test user

#### **B. First-Run Experience**
- Alert prompts to add emergency contact
- Tap "OK" → Add Contact screen appears
- Fill in:
  - Name: "Mom"
  - Email: "mom@example.com"
  - Message: "Hey Mom, if you're reading this..."
- Tap "Save"

#### **C. Main Screen (Home)**
- See giant green pulsing button ("I'M ALIVE")
- Timer shows: "47h 59m" (or similar)
- **Long-press** the button for 1.5 seconds
  - Feel haptic feedback at 0.5s, 1.0s, 1.5s
  - Progress ring animates around button
  - Success! Check-in recorded

#### **D. Check Status**
- Pull down to refresh
- Timer updates
- Scroll down to see check-in history

#### **E. Settings**
- Tap ⚙️ in top-left corner
- **Change Check-in Period:**
  - Select different period (6h, 12h, 24h, 48h, 72h, 1 week)
- **Add More Contacts:**
  - Tap "+ Add" under Emergency Contacts
  - Fill form → Save
- **Edit Contact:**
  - Tap ✏️ on contact card
  - Modify → Save
- **Delete Contact:**
  - Tap 🗑 → Confirm deletion
- **Logout:**
  - Tap "Logout" → Confirm

---

## 🎨 UI States to Test

### Button States
Test each status state by manipulating backend time:

1. **Safe (Green)**
   - More than 12 hours remaining
   - Slow breathing animation (2s cycle)
   - Text: "I'M ALIVE"

2. **Warning (Amber)**
   - 1-12 hours remaining
   - Medium pulse (1.5s cycle)
   - Text: "U THERE?"

3. **Critical (Red)**
   - Less than 1 hour remaining
   - Fast pulse (0.8s cycle)
   - Text: "LAST CHANCE"

4. **Dead (Gray)**
   - Deadline passed
   - No animation
   - Text: "YOU'RE DEAD"
   - Subtitle: "Tap to revive"

### Dark Mode
- Change device settings to dark mode
- App automatically adapts
- Colors switch:
  - Background: #1C1C1E
  - Cards: #2C2C2E
  - Text: #FFFFFF

---

## 🧪 API Testing

All endpoints are tested and working:

```bash
# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token":"test"}'

# Test check-in (requires token)
curl -X POST http://localhost:3000/api/v1/check-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test status
curl -X GET http://localhost:3000/api/v1/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CheckInButton    # 280px pulsing circle
│   ├── HistoryTimeline  # Check-in log display
│   └── ContactCard      # Emergency contact card
├── screens/             # App screens
│   ├── WelcomeScreen    # OAuth sign-in
│   ├── HomeScreen       # Main check-in UI
│   ├── SettingsScreen   # Settings modal
│   └── AddContactScreen # Add/edit contact form
├── services/            # Business logic
│   ├── api.ts           # API client (11 endpoints)
│   ├── auth.ts          # OAuth helpers
│   └── pushNotifications.ts # Local push scheduling
├── hooks/
│   └── useStatus.ts     # Poll /status every 30s
├── context/
│   └── AuthContext.tsx  # Global auth state
├── navigation/
│   └── AppNavigator.tsx # Navigation structure
└── utils/
    └── colors.ts        # Design tokens
```

---

## 🎯 Known Limitations

1. **OAuth Not Fully Implemented**
   - Google/Apple Sign-In uses mock tokens
   - Real OAuth requires EAS build + native config

2. **Push Notifications**
   - Local notifications work
   - Remote push requires Expo project ID

3. **No Persistence**
   - App state resets on reload (relies on backend)

---

## 🛠 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Routing
- **react-native-reanimated** - Animations
- **expo-notifications** - Push notifications
- **expo-haptics** - Vibration feedback
- **axios** - HTTP client
- **expo-secure-store** - JWT storage

---

## ✅ Build Status

- ✅ TypeScript: 0 errors
- ✅ All screens implemented
- ✅ All components working
- ✅ API integration complete
- ✅ Animations functional
- ✅ Dark mode supported
- ✅ Ready for testing!

---

## 🚨 Troubleshooting

### "Metro bundler won't start"
```bash
npm start -- --reset-cache
```

### "Cannot connect to localhost:3000"
- iOS Simulator: Use `http://localhost:3000`
- Android Emulator: Use `http://10.0.2.2:3000`
- Physical device: Use your computer's IP address

### "TypeScript errors"
```bash
npx tsc --noEmit
```

### "Reanimated warnings"
Ignore worklet warnings - animations still work.

---

## 📝 Next Steps

To deploy to production:

1. Configure real OAuth (Google/Apple)
2. Set up Expo project ID for push
3. Create app icons/splash screens
4. Run EAS Build for native binaries
5. Submit to App Store / Play Store

---

**Built with Claude Code** 🤖
