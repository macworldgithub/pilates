# Project Orbit · MoveActive prototype

React Native internal MVP connected to **https://pilates-backend-sigma.vercel.app/api/v1** in both development and release builds. The backend is in `../pilates-backend`.

## Current deployment prerequisite

The audit on 23 November 2026 found that the hosted API's Vercel rewrite adds `path` to request queries. Strict backend validation rejects catalog, referral and order/admin list requests with `400: property path should not exist`. The fix is prepared in `../pilates-backend/src/serverless.ts` with regression tests. Deploy the updated backend source before playtesting. Merely redeploying the old source will retain the error.

See `../API_INTEGRATION_AUDIT.md` for scope coverage, evidence and the deployment checklist. The configured host remains the supplied deployment; the app shows connection errors instead of substituting local records.

## Run

Use Node.js 22.11 or newer and install dependencies with `npm ci`.

Android requires Android Studio, an emulator or a USB-connected device:

```sh
npm start
# In a second terminal:
npm run android
```

iOS requires macOS, Xcode and CocoaPods:

```sh
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

Rebuild native apps after installing `react-native-keychain`; a Metro reload does not link native modules. No local backend or LAN-address configuration is required with the deployed HTTPS API.

## Sign-in and navigation

Every fresh app launch opens **staff/admin sign-in**, including when a previous session is restored.

| Role | Username | Prototype password | Destination |
| --- | --- | --- | --- |
| Staff | `staff` | `OrbitStaff123!` | Location/interests/format onboarding on first sign-in, otherwise Discover |
| Admin | `admin` | `OrbitAdmin123!` | Partner admin with studios, instructors and affiliations |

The server validates credentials. Failed logins cannot open app navigation. Staff cannot access admin management. Admins can preview the consumer app and return to management without another login. Sign-out returns to the sign-in gate, revoking admin tokens where applicable. Expired protected API access returns to sign-in with a retry action.

An anonymous backend session still holds the device's profile, bag and demo orders; it is not a guest entry point in the UI. Tokens use device secure storage when available and memory for the current run if the native module is unavailable. Session data is retained on staff logout. Admin tokens remain in memory until logout or process exit.

## Backend-driven journeys

- Onboarding area, coordinates, interests, formats and hero artwork from `/config`; selections saved to `/sessions/me`.
- Fresh workouts, format/level/search filters, workout detail, affiliated instructors and tagged products.
- Studio directory, format/nearest/search filters, branding, address, instructors, selected sessions and outbound website/booking links.
- Instructor profiles reached through studios and workouts, with affiliations, content and referral codes.
- Separate D2C shop, backend collections, search, product images, variants, simulated availability, bundle components and backend prices.
- Persistent bag quantities/removal/clear, server quotes, demo discounts, warehouse collection/delivery concepts and idempotent simulated orders.
- Session-private order history and freshly fetched order detail.
- Studio/instructor recommendation code/link display and backend attribution applied to the next demo order.
- Admin creation/editing of studio and instructor records; configurable images, links, formats, partner type, publication, independent approval and affiliations.

All displayed business records and prices come from the API. Runtime code does not import local fallback records. Images resolve relative `/media/images/*` paths against the deployed host, with a visible loading/error fallback. Empty API results stay empty. Discovery requests only the data needed by the active screen, reducing unnecessary calls and rate-limit pressure.

The area selector uses backend-provided sample coordinates rather than device GPS. Session playback, workshop illustrations and membership remain labelled concepts. Seeded videos and outbound bookings use example.com destinations. The checkout example form stays local; no personal details or payment information are submitted.

## Scope boundary

The developer brief requests a clickable simulated prototype. Checkout never charges, ships or changes inventory; referral codes do not calculate commissions. Production Shopify, subscription billing, real videos/bookings, B2B ordering, studio inventory, community, self-service portals and automated payouts remain deferred. No backend reseeding is needed for this integration fix.

## Verification

```sh
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

The backend additionally contains HTTP integration tests and a repeatable hosted check:

```sh
cd ../pilates-backend
npm test
# After deploying the updated backend:
npm run verify:deployed -- --checkout --report docs/deployed-api-verification.json
```

The hosted check reads seeded catalog/admin records, uses disposable consumer sessions and creates one explicitly simulated order when `--checkout` is supplied. It never modifies seeded catalog records, accepts no payment data, and revokes its test sessions/admin token afterward. The sample order/event remains in internal audit history.
