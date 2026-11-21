# Project Orbit · MoveActive prototype

Project Orbit is a clickable, simulated React Native MVP for internal playtesting. It uses sample data and does not connect to studio systems, Shopify, real inventory, checkout, payments, or commission services.

## Run on Android

Install Node.js (22.11 or newer), Android Studio, and the Android SDK. Start an Android emulator or connect an Android device with USB debugging enabled. From the project root:

```sh
npm install
npm run android
```

If the app is already installed and Metro is not open, run `npm start` in a separate terminal first. The `android` script builds and launches the app on the connected emulator or device.

## Run on iOS

The iOS project is included, but building it requires macOS and Xcode. From a Mac, install the CocoaPods dependencies and run:

```sh
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

## Prototype journeys

- Onboarding with area and interest selection
- Workout discovery and session detail
- Studio directory filters, studio profile, and affiliated instructor profile
- Product tags within sessions and a sample MoveActive shop
- Bag, example checkout, and demo order confirmation with no purchase
- Studio and instructor referral concept with sample attribution code
- Internal partner admin preview for studios and studio-led instructor affiliations

The screen flow and local interactions are composed in `App.tsx`. Reusable presentation components live in `src/components/OrbitUI.tsx`, sample studios, instructors, and products live in `src/data/mockData.ts`, and shared screen names are in `src/types.ts`. Place client approved imagery in `assets/images` using the file list in [assets/images/README.md](assets/images/README.md); the visual reference is [MoveActive Studio](https://move-active-studio.vercel.app/).

Community, bookings, self-service portals, independent instructor approval workflows, live inventory, production Shopify checkout, payments, and automated commissions are outside this prototype.
