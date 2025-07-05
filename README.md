# Sky Social

A cross-platform social app built with Expo, React Native, and TypeScript, supporting Android, iOS, and Web.

---

## Project Structure

```
sky-social/
│
├── android/         # Native Android project (Gradle, Java/Kotlin, resources)
├── ios/             # Native iOS project (Xcode, Swift, resources)
├── assets/          # App icons, images, and static assets
├── src/             # Main application source code
│   ├── app/         # App entry, routing, and screen definitions (Expo Router)
│   ├── components/  # Reusable UI and feature components
│   ├── constants/   # App-wide constants (e.g., colors)
│   ├── contexts/    # React context providers (Auth, Settings, etc.)
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility libraries (API, storage, etc.)
│   ├── platform/    # Platform detection helpers
│   ├── store/       # State management (e.g., Zustand stores)
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility/helper functions
│   └── global.css   # Tailwind and global styles
│
├── package.json     # Project metadata and scripts
├── app.json         # Expo app configuration
├── tsconfig.json    # TypeScript configuration
├── tailwind.config.js # Tailwind CSS config
└── README.md        # Project overview and instructions
```

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For native builds:
  - Android Studio (for Android)
  - Xcode (for iOS, macOS only)
  - [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`)

### 2. Install Dependencies

```sh
npm install
# or
yarn install
```

### 3. Run the App

#### Web

```sh
npm run dev
# or
yarn dev
```

#### Android

```sh
npm run android
# or
yarn android
```

#### iOS

```sh
npm run ios
# or
yarn ios
```

> **Note:** For iOS, run `cd ios && pod install` if you encounter missing pod dependencies.

---

## Contributing

1. Fork the repository and create your branch from `master`.
2. Follow the code style (TypeScript, Prettier, Tailwind).
3. Add/modify components in `src/components/`, screens in `src/app/`, and utilities in `src/lib/` or `src/utils/`.
4. Test your changes on all platforms (web, Android, iOS) if possible.
5. Submit a pull request with a clear description.

---

## Useful Scripts

- `npm run dev` – Start Expo in development mode (web, Android, iOS)
- `npm run android` – Run on Android device/emulator
- `npm run ios` – Run on iOS simulator (macOS only)
- `npm run build:web` – Build for web
- `npm run lint` – Lint the codebase

---

## Directory Details

- **src/app/**: App entry and routing (Expo Router). Each folder is a route or screen.
- **src/components/**: UI and feature components, organized by domain (e.g., `embeds/`, `profile/`, `ui/`).
- **src/contexts/**: React context providers for global state (auth, settings, etc.).
- **src/lib/**: API clients, storage managers, and other libraries.
- **src/constants/**: Color palettes and other constants.
- **src/hooks/**: Custom React hooks.
- **src/types/**: TypeScript types and interfaces.
- **src/utils/**: Utility functions for formatting, style, etc.

---

## Notes

- The project uses [Expo Router](https://expo.github.io/router/docs) for navigation and routing.
- Styling is handled with [Tailwind CSS](https://tailwindcss.com/) and [NativeWind](https://www.nativewind.dev/).
- State management uses React Context and [Zustand](https://zustand-demo.pmnd.rs/).
- For authentication and API, see `src/contexts/AuthContext.tsx` and `src/lib/atproto.ts`.
