# Taskt

A minimal, offline-first task and habit manager built with Expo and React Native.

Most todo apps either require an account just to write a note, or mess up date/time calculations when you travel between timezones. Taskt stores everything locally on your device, works completely offline, and uses the modern Temporal API so your dates and recurring schedules behave predictably regardless of your locale. Offline usability and privacy come first.

---

## Why another task app?

- **Zero account lock-in:** Everything lives on your phone in a local SQLite database. No forced sign-up, no tracking.
- **Proper timezone & locale support:** Uses the modern JS Temporal API instead of legacy `Date()` hacks, so schedules don't drift across timezones.
- **Both one-time & recurring tasks:** Supports single deadlines as well as repeating schedules (daily, custom weekday pickers).
- **Standalone Date & Time pickers:** Native custom wheel and calendar pickers built directly with Temporal and Reanimated, avoiding buggy OS-level picker dialogs.
- **Offline notifications that work:** Scheduled local reminders via `expo-notifications`, complete with a background exemption shortcut so aggressive Android battery savers don't kill your alerts.
- **Fast UI:** Styled with Tailwind CSS (NativeWind) with a clean, distraction-free layout.

---

## Tech Stack

- **Framework:** [Expo](https://expo.dev) (SDK 58) / React Native 0.88
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS v4)
- **Local Database:** SQLite via [Drizzle ORM](https://orm.drizzle.team)
- **Dates & Times:** Temporal API (`@js-temporal/polyfill`)
- **Package Manager:** [Bun](https://bun.sh)

---

## Development

### Prerequisites

- [Bun](https://bun.sh) & Node.js
- Android Studio / Android SDK & JDK 17
- An Android device with USB debugging enabled or an Android emulator

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/S488U/Taskt.git
   cd Taskt
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the Expo development server:
   ```bash
   bun run android
   ```

---

## Building the APK Locally

If you want to compile a standalone Release APK locally without EAS:

1. **Generate the Android project:**
   ```bash
   bun run prebuild
   ```
   This generates a clean `android/` directory with our custom Gradle tuning and APK naming plugins applied.

2. **Assemble the Release APK:**

   - **For physical devices (arm64-v8a)** — faster build and smaller file size:
     ```bash
     bun run phone
     ```

   - **For emulators / Genymotion (x86_64):**
     ```bash
     bun run genymotion
     ```

   - **For all architectures:**
     ```bash
     bun run local
     ```

3. **Locate your APK:**

   The compiled APK will be output to:
   ```text
   android/app/build/outputs/apk/release/Taskt-<version>.apk
   ```

---

## License

This project is open-source under the [MIT License](LICENSE).
