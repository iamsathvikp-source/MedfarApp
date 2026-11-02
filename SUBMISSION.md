# Medfar Mobile Coding Challenge: Submission

Hi,

The Mobile Coding Challenge is complete. The code is on the `TEST` branch of
this repository, with a pull request to merge it into `main`.

This document summarises the architecture choices, the changes I made and the
improvements I'd make next. [SOLUTION.md](SOLUTION.md) has the full detail,
and every file I touched starts with a comment block marked
**STARTER / ADDED / UPDATED / IMPLEMENTED** so the reasoning sits next to the
code.

## What was delivered

All four flows from the brief:

| Flow | Where |
|---|---|
| 1. Patient information | `PatientInfo` card on the Patient Overview screen |
| 2. Discharge summary | Same card, below the patient information |
| 3. List of clinical notes | One `ClinicalNote` card per note, newest first, filterable by type |
| 4. Add a new clinical note | `AddNoteModal`: read-only patient ID, type picker, date picker, note text, Add Note / Cancel |

Loading and error states are handled on every call to the mock client
(random delay of up to 3s, occasional failures), and the list updates as soon
as a note is saved.

Beyond the brief, I added a patient list with search, sorting and pagination
(10 per page), plus 23 extra seed patients so the list has something to show.
The Patient Overview screen itself is unchanged by these extras.

## How to run it

```sh
cd app-clinical-notes
npm install
npm start          # press i for the iOS Simulator, a for an Android emulator
npm test           # 60 unit tests
npx tsc --noEmit   # type check (strict mode)
```

## Architecture

```
App.tsx                 Stack navigator under the "Health Clinic" header
src/
  screens/              Decide what to show (loading / error / data / empty)
  hooks/                Own all data fetching; components never call the client
  components/           Only draw what they are given
  utils/                Pure, unit-tested logic: dates, sorting, filtering, validation, errors
  data/                 Mock data client (starter, with bug fixes)
```

The rule throughout: **hooks own the data, screens decide what to show,
components only draw.** Anything with real logic is a pure function in
`utils/` with tests.

## Key decisions

- **React Native `Modal` for Add Note, not a navigation modal route.** The
  form belongs to one screen and needs live values from it (note types, a
  callback to update the list). Navigation params should be serializable, so
  passing callbacks through a route is an anti-pattern. `onRequestClose` makes
  the Android back button act as Cancel.
- **No state library.** `useState` inside custom hooks is enough for two
  screens. Note types are loaded once at app start into a small React context.
  The hooks return a `data / loading / error / refetch` shape, so moving to
  React Query later is straightforward.
- **One `FlatList` for the overview.** Patient card as the header, notes as
  items, the Add button as the footer: one scroll container, virtualized
  notes, built-in pull-to-refresh.
- **New note shown right after a confirmed save.** Once
  `addNewClinicalNote` succeeds, the note is added to the screen and the
  patient is refetched quietly in the background. This is not optimistic:
  nothing appears until the save is confirmed.
- **Race conditions handled.** Each request carries an id and only the latest
  response may update state; a ref stops a double tap from saving two notes.
- **Dates built in local time.** `new Date("2023-07-15")` parses as UTC, which
  is July 14 in Montréal. All dates are built from their parts and shown as
  `Jul 15, 2023` to avoid 07/08 vs 08/07 confusion. Tests pass in UTC, Toronto
  and UTC+14.
- **Platform conventions from the Figma.** Wheel picker on iOS, dropdown on
  Android; native date picker with future dates blocked; iOS text buttons vs
  an Android filled button.

## Error and loading states

| Situation | What the user sees |
|---|---|
| First load | Full-screen spinner |
| First load fails | Plain-language message + Try again |
| Refresh fails while data is shown | Data stays, red banner + Retry |
| Save fails | Modal stays open with the text kept, banner explains |
| No notes / none for this filter | Empty-state message |

Technical error messages are never shown to the user.

## Bugs fixed in the starter

1. Storage writes in the client constructor were not awaited. Added a `ready`
   promise every method awaits.
2. `addNewClinicalNote` went through `fetchPatientData`, so each save rolled
   the random delay and failure twice. It now reads storage directly.
3. The patient's notes array was mutated in place. It now builds a new array.
4. Mojibake in seed data (`InfirmiÃ¨re HÃ©lÃ¨ne` → `Infirmière Hélène`).
5. A literal `\n` in a note displayed as a backslash and an n.

The client's public API is unchanged, and fixes 2, 4 and 5 have regression
tests.

## Deviations from the Figma

The brief allows layout changes as long as all information is present. Every
required field is shown. The main changes:

- **Notes newest first** instead of oldest first, so a clinician sees the
  latest note without scrolling.
- **Note type must be chosen** instead of being preselected, so a note can't
  be saved with the wrong type by accident.
- **Date defaults to today**, since most notes are written the same day.
- **"Add New Clinical Note" is a filled button**, as it is the main action on
  the screen.

[SOLUTION.md](SOLUTION.md) lists every deviation with its reasoning.

## Testing and verification

- 60 unit tests, all passing: the starter's client tests plus regression
  tests, and tests for dates, sorting, search, pagination, validation and
  error messages.
- `tsc --noEmit` passes in strict mode.
- `expo export` bundles for both iOS and Android without errors.

## Next steps with more time

1. Component and hook tests with React Native Testing Library.
2. React Query for caching and retry with backoff.
3. Server-side note pagination once the API supports it.
4. French / English localization, since the clinic is in Québec.
5. Dark mode.
6. Smoother keyboard handling on Android edge-to-edge.

Thanks for the challenge. I'm happy to walk through any part of it.
