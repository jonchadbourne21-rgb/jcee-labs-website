# AEGIS ClaimOS mobile app

The AEGIS ClaimOS native MVP is an **Expo SDK 54** app for iOS, Android, and web. It demonstrates Field Adjuster and Policyholder journeys. The local role switcher is deliberately non-production: **production identity, authentication, tenant isolation, and server-enforced authorization are not implemented.**

## Install and run

```bash
pnpm --dir mobile install
export EXPO_PUBLIC_API_URL=http://localhost:8000
pnpm --dir mobile start
```

`EXPO_PUBLIC_API_URL` must include the protocol and point to the FastAPI server. The development fallback is `http://localhost:8000`. Restart Expo after changing the variable because it is bundled into the client.

## Expo Go

Start the Metro server and scan its QR code using Expo Go:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.25:8000 pnpm --dir mobile start
```

Expo Go is intended for development on supported iOS and Android devices rather than a signed store release.

## Android

For an Android emulator, `10.0.2.2` targets the host computer:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000 pnpm --dir mobile android
```

A real Android device must use the host machine's reachable LAN address instead.

## iOS

With Xcode/iOS Simulator configured on macOS:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000 pnpm --dir mobile ios
```

A physical iPhone using Expo Go must use the machine's LAN address, not `localhost`.

## Web

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000 pnpm --dir mobile web
EXPO_PUBLIC_API_URL=http://localhost:8000 pnpm --dir mobile build:web
```

`build:web` runs `expo export --platform web` and writes the static bundle to `mobile/dist`.

## Physical-device networking

A phone cannot reach the development computer through its loopback interface. Bind FastAPI to `0.0.0.0`, connect both devices to the same trusted LAN, and use the computer's private-LAN address in `EXPO_PUBLIC_API_URL`, for example `http://192.168.1.25:8000`. Permit the port through the local development firewall when necessary. Do not expose an unauthenticated development API on a public network.

The Home screen calls `/health` and `/api/dashboard`, and visibly reports connectivity errors. Claims uses `GET /api/claims` and detail uses `GET /api/claims/{id}`.

## Demo flow and offline behavior

1. Use **Settings** to choose Field Adjuster or Policyholder and read the explicit demo-identity warning.
2. Select **Reset demo claim** to call `POST /api/demo/reset`, then open the returned Kitchen Water Damage claim.
3. Pull to refresh **Claims**, which renders the queue through `FlatList`.
4. A Field Adjuster can run analysis, add a field note, complete tasks, verify VOW status, and capture or choose a photo.
5. Failed note and task actions are persisted with AsyncStorage and can be retried in **Inbox**.
6. Photo selections store **local pending metadata only**. The app never claims photo bytes reached the backend, because object storage is not configured.
7. Policyholders see plain-language milestones and requested tasks; internal notes are never displayed.

## Validation

```bash
pnpm --dir mobile check
pnpm --dir mobile lint
pnpm --dir mobile test
pnpm --dir mobile build:web
```
