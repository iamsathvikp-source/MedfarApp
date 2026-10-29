# app-clinical-notes

Starter React Native project for the Medfar Mobile Coding Challenge. The challenge instructions, goals and delivery steps are in the [root readme](../readme.md).

## Tech stack

- Expo SDK 57 (React Native 0.86, React 19) with TypeScript
- React Navigation (native stack)
- Async Storage (used by the mock data client to persist data)
- `@react-native-picker/picker`
- Jest with the `jest-expo` preset

## Getting started

You will need a current [Node.js LTS](https://nodejs.org/) release.

```sh
cd app-clinical-notes
npm install
npm start
```

From the Expo CLI you can open the app in the iOS Simulator (`i`), an Android emulator (`a`), a web browser (`w`), or on a physical device with [Expo Go](https://expo.dev/go).

## Scripts

| Command             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `npm start`         | Start the Expo dev server                                    |
| `npm run ios`       | Start the dev server and open the iOS Simulator              |
| `npm run android`   | Start the dev server and open an Android emulator            |
| `npm run web`       | Start the dev server and open the app in a web browser       |
| `npm test`          | Run the unit tests                                           |
| `npm run build:lib` | Compile `src/data` into the standalone `lib/` directory      |

## Project structure

```
app-clinical-notes/
├── App.tsx                  # App entry component
├── app.json                 # Expo configuration
├── assets/                  # Icons and images
├── lib/                     # Compiled mock data client, for use in your own setup
└── src/
    ├── client/
    │   └── index.ts         # Ready-to-use instance of the mock data client
    ├── components/          # Starter components
    │   ├── Header.tsx       # "Health Clinic" title bar
    │   ├── PatientInfo.tsx  # Patient information and discharge summary
    │   ├── ClinicalNote.tsx # A single clinical note card
    │   └── AddNoteModal.tsx # Add New Clinical Note modal
    └── data/                # Mock data client source
        ├── index.tsx        # Client class and data types
        ├── patients.ts      # Seed patient data
        ├── noteType.ts      # Seed clinical note types
        ├── index.test.ts    # Client unit tests
        └── __mocks__/       # Async Storage mock for Jest
```

## Mock data client

Import the ready-to-use client instance from `src/client`, and the data types from `src/data`:

```ts
import client from "./src/client";
import { PatientData } from "./src/data";

const patients: PatientData[] = await client.fetchPatientData();
```

The client stores its data in Async Storage and resets it to the seed data every time a `Client` is constructed, so notes you add do not survive an app reload.

If you use your own setup instead of this project, copy the `lib/` directory and import the client from it. `lib/` depends on `@react-native-async-storage/async-storage`, so add that package to your project. If you change `src/data`, run `npm run build:lib` to regenerate `lib/`.
