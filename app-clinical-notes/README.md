# app-clinical-notes

React Native app for the Medfar Mobile Coding Challenge. The challenge instructions are in the [root readme](../readme.md).

> **Solution notes:** what existed, what changed and why, and the main decisions are in [SOLUTION.md](../SOLUTION.md). Every changed file also starts with a STARTER / ADDED / UPDATED comment block.

## Tech stack

- Expo SDK 57 (React Native 0.86, React 19) with TypeScript
- React Navigation (native stack)
- Async Storage (used by the mock data client to persist data)
- `@react-native-picker/picker`
- `@react-native-community/datetimepicker` (added for the native date picker)
- `@expo/vector-icons` (added for the search and sort icons)
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
├── App.tsx                        # Stack navigator under the Header, safe areas
├── app.json                       # Expo configuration
├── assets/                        # Icons and images
├── lib/                           # Compiled mock data client (regenerated)
└── src/
    ├── client/index.ts            # Ready-to-use client instance
    ├── navigation.ts              # Route names and params
    ├── screens/
    │   ├── PatientListScreen.tsx      # Extra: search, sort, 10 per page
    │   └── PatientOverviewScreen.tsx  # The brief's screen: states, list, modal
    ├── hooks/                     # Data fetching (components never call the client)
    │   ├── usePatients.ts         # All patients in one request
    │   ├── usePatient.ts
    │   ├── patientCache.ts        # Last known copy of each patient
    │   ├── useNoteTypes.ts
    │   ├── NoteTypesContext.tsx   # Note types loaded once at app start
    │   └── useSaveClinicalNote.ts
    ├── components/
    │   ├── Header.tsx             # "Health Clinic" title bar (+ back button)
    │   ├── PatientInfo.tsx        # Patient info + discharge summary card
    │   ├── ClinicalNote.tsx       # One clinical note card
    │   ├── NoteTypeFilter.tsx     # Filter chips
    │   ├── AddNoteModal.tsx       # Add New Clinical Note form
    │   ├── Button.tsx, Chip.tsx, SortSheet.tsx, StatusView.tsx, ErrorBanner.tsx
    ├── utils/                     # Pure logic + unit tests
    │   ├── date.ts, notes.ts, patients.ts, validateNote.ts, clinicalNote.ts, errors.ts
    ├── theme.ts                   # Colors and spacing
    └── data/                      # Mock data client source (+ tests)
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
