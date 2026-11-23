# Project Orbit · MoveActive prototype

Project Orbit is a React Native MVP connected to the NestJS / Express / MongoDB API in `../pilates-backend`. Studio, instructor, workout, product, variant, cart, referral, onboarding and demo-order data come from the API. Commerce remains simulated: no live Shopify checkout, payments, inventory writes or commissions.

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

The screen flow and API-driven interactions are composed in `App.tsx`. Shared presentation styles live in `src/components/OrbitUI.tsx`; dynamic cards and internal management live in `OrbitCards.tsx` and `AdminPanel.tsx`. API contracts, requests and host configuration live in `src/api`. Business records are seeded by `../pilates-backend/src/ui-seed-data.ts`. Images come from the backend's `imageUrl` fields and `/media/images/*` routes. `src/data/artwork.ts` only resolves relative media paths against the API host; it contains no local artwork or record-ID mappings. Onboarding areas, interest options, hero images and available referral codes also come from the API.

Community, bookings, self-service portals, independent instructor approval workflows, live inventory, production Shopify checkout, payments, and automated commissions are outside this prototype.

## Start the connected prototype

Start the backend first:

```powershell
cd D:\mvp\pilates-backend
npm ci
npm run seed
npm run build
npm start
```

From a second terminal, run `npm run android` in `D:\mvp\pilates`. Rebuild the native app after installing dependencies: session tokens now use `react-native-keychain`, so a Metro reload alone will not add the native module. On macOS, install CocoaPods dependencies before rebuilding iOS.

The default development API in [config.ts](src/api/config.ts) is `http://10.0.2.2:4000/api/v1` for an Android emulator and `http://localhost:4000/api/v1` for an iOS simulator. A physical device needs your computer's LAN IP in that file and backend `HOST=0.0.0.0`; restart the backend after changing `.env`. Release builds need a deployed HTTPS endpoint configured in the same file.

The first launch creates a prototype session and securely stores its token. Later launches restore onboarding and the server-side bag/order history. Expired sessions are replaced on reconnection. Loading, offline errors, empty search results and unavailable variants are shown explicitly. The area selector uses sample Melbourne-area coordinates rather than device GPS.

Admin uses the fixed prototype login: **username `admin`**, **password `OrbitAdmin123!`**. These credentials are hardcoded in the backend's `src/admin-auth.ts`. The mobile login form submits them to `POST /admin/auth/login`; verification happens on the server, which returns an eight-hour admin access token. The token is kept in memory, cleared when leaving the admin screen, and revoked by the Log out button. A rejected login never opens the admin records. Studios and instructors can be created/edited; affiliations can be created/removed. The backend validates every write.

Sample UI content: Core Collective, The Pilates Room, Form & Flow Studio, Mia Chen, Reformer Reset, Full Body Mat Flow, pink/blue crew grip socks (AUD 22.95), Espresso mat (AUD 109.00), and Starter Bundle (AUD 129.00). Apply `MIA10` from Studio connection for attribution; it is not a discount code. Demo discounts are `WELCOME15` and `SEASON10` in the bag. Checkout quotes and totals come from the server, and retries reuse an idempotency key.

Run `npm test -- --runInBand`, `npx tsc --noEmit`, and `npm run lint` for frontend verification. The backend has its own HTTP tests, including an end-to-end journey using these exact UI records, under `../pilates-backend/test`.
