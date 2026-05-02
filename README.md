# Swayam Shiksha Mobile App

Indian EdTech App for JEE, NEET & UPSC preparation — built with Expo React Native.

## Features
- 5 tabs: Home, Courses, Live Classes, Tests, Profile
- Google Drive video playback (in-app, no download)
- PDF viewer via Google Drive
- Live stream join (Google Meet / YouTube Live)
- MCQ Test series with scoring
- Auth (login/register)

## Setup

```bash
npm install
npx expo start
```

## Build APK (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Environment

Set `EXPO_PUBLIC_DOMAIN` to your API server domain.

## API Server
Backend: Express + PostgreSQL (Drizzle ORM)
