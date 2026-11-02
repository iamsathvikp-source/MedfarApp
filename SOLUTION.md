# Clinical Notes: Solution Notes

This is the document that goes with the `TEST` branch. It explains what the
starter gave us, what I built or changed, and why. Every file I touched also
has a comment block at the top marked **STARTER / ADDED / UPDATED /
IMPLEMENTED**, so you can read the reasoning right next to the code.

## How to run it

```sh
cd app-clinical-notes
npm install
npm start          # then press i (iOS simulator) or a (Android emulator)
npm test           # 60 unit tests
npx tsc --noEmit   # type check
```

Things to try once it's running:

0. The app opens on a patient list (an extra, see
   [Beyond the brief](#beyond-the-brief)), 10 per page: use **Next ›** at
   the bottom. Try the search box and the sort icon, then tap a patient to open the overview
   the brief describes; it shows instantly. **‹ Patients**, iOS swipe-back or
   Android back return to the list.
1. The first load shows a spinner (the mock client waits up to 3s).
2. About 1 load in 6 fails on purpose. You'll see an error with **Try again**.
3. Pull down to refresh. If that refresh fails, the data stays on screen and a
   small red banner appears instead.
4. Tap a filter chip (e.g. "Lab Results") to filter the notes.
5. Tap **Add New Clinical Note**. Tap **Add Note** without choosing a type to
   see validation. Open the date picker: dates after today can't be picked.
   Fill it in properly and save. The new note appears at the top.
6. If a save fails, the modal stays open with everything you typed.
7. Type something, then **Cancel**: it asks before discarding.
8. On Android, the back button behaves like Cancel.

## What already existed (the starter)

| Piece | State in the starter |
|---|---|
| Expo 57 / RN 0.86 / React 19 / TS project, Jest setup | Complete |
| Mock data client (`src/data`) + its tests | Complete, with a few bugs (below) |
| `Header` component | Complete, but never rendered |
| `PatientInfo`, `ClinicalNote` | Empty `<View>` with typed props |
| `AddNoteModal` | Empty RN `<Modal>` with typed props |
| `App.tsx` | Empty `SafeAreaView` (white screen) |
| React Navigation, Picker, Async Storage | Installed |

## What I built

```
App.tsx                         UPDATED  stack navigator under the Header, safe areas
src/
  navigation.ts                 ADDED    route names + params
  screens/
    PatientOverviewScreen.tsx   ADDED    the brief's screen; picks what to show
    PatientListScreen.tsx       ADDED    extra: all patients, sortable
  hooks/                        ADDED    all data fetching lives here
    usePatient.ts                        load / refresh / stale-response guard
    usePatients.ts                       all patients in one request
    patientCache.ts                      last known copy of each patient
    useNoteTypes.ts                      types for the picker
    NoteTypesContext.tsx                 loads the types once at app start
    useSaveClinicalNote.ts               save + double-tap guard
  components/
    Header.tsx                  UPDATED  a11y role + optional back button
    PatientInfo.tsx             IMPLEMENTED  patient info + discharge summary
    ClinicalNote.tsx            IMPLEMENTED  one note card (memoized)
    AddNoteModal.tsx            IMPLEMENTED  the form
    NoteTypeFilter.tsx          ADDED    filter chips
    Button.tsx, Chip.tsx, SortSheet.tsx, StatusView.tsx, ErrorBanner.tsx   ADDED  shared UI
  utils/                        ADDED    pure, unit-tested logic
    date.ts, notes.ts, patients.ts, validateNote.ts, clinicalNote.ts, errors.ts
  theme.ts                      ADDED    shared colors / spacing
  data/index.tsx, patients.ts   UPDATED  bug fixes (below), 23 extra seed patients
lib/                            REGENERATED with npm run build:lib
```

**The rule I followed:** hooks own the data, the screen decides what to show,
components only draw. Anything with real logic (dates, sorting, filtering,
validation) is a pure function in `utils/` with tests.

## Key decisions

### RN `Modal` instead of a React Navigation modal route
- The form belongs to one screen (the overview) and can't be reached any
  other way, so it doesn't need to be a route.
- The form needs live things from the screen (the note types, a callback to
  update the list). Navigation params should be serializable, so passing
  callbacks through them is an anti-pattern.
- The starter already provided an RN Modal.
- `onRequestClose` makes the Android back button work as Cancel.
- A stack navigator now exists for the extra patient list, and none of the
  above changed. I'd switch only if "add a note" needed a deep link or could
  be opened from elsewhere. The change is contained to `AddNoteModal` and the
  screen.

### No state library
`useState` inside custom hooks. Two screens don't need Redux. The note
types, shared across screens, live in a small React context
(`NoteTypesContext`), and the last known copy of each patient in a plain
`Map` (`patientCache`) that the overview reads when it opens. In a real app I'd use React Query (caching,
retries, background refetch); the hooks already return a similar shape
(`data / loading / error / refetch`) so the swap is easy.

### One `FlatList` for the whole screen
Patient card in `ListHeaderComponent`, notes as items, button in
`ListFooterComponent`. One scroll container, virtualized notes, free
pull-to-refresh, and no "FlatList inside ScrollView" warning.

### Showing the new note right after a confirmed save
After `addNewClinicalNote` succeeds, the note is added to the screen
immediately, then the patient is refetched quietly in the background.
Why not just refetch? The refetch can take 3s and fails 1 time in 6. The save
already succeeded, so making the user wait (or see an error) for data we
already have is bad UX. This is not optimistic: nothing shows until the
server confirms.

### Loading and error states
| Situation | What the user sees |
|---|---|
| First load | Full-screen spinner |
| First load fails | Full-screen message + Try again |
| Refresh fails, data already shown | Data stays, red banner + Retry |
| Opening a patient from the list | Shown instantly from the list's copy; refreshed silently |
| Note types loading / failed | Spinner / error + Try again inside the modal |
| Save fails | Modal stays open, text kept, banner explains |
| No notes / none for this filter | Empty message |

Technical errors ("A synthetic error happened") are never shown to the user;
`utils/errors.ts` turns them into plain sentences.

### Race conditions
The mock waits a random time, so responses can arrive out of order. Each
request in the hooks gets an id and only the latest one may update state.
Hooks also don't set state after unmount. Saving uses a ref so a fast double
tap can't create two notes.

### Validation (`utils/validateNote.ts`)
- Note type required.
- Date must be a real `YYYY-MM-DD` date and not in the future (a note records
  something that happened). Past dates are allowed.
- Text trimmed, not empty, max 2000 characters.
- All errors show at once after the first tap on Add Note, and each clears as
  the user fixes that field.

### Dates
`new Date("2023-07-15")` is parsed as UTC, which is July **14** in Montréal.
All dates are built in local time from their parts, and shown as
`Jul 15, 2023` (spelled-out month, so no 07/08 vs 08/07 confusion between
English and French Canada). Tests run green in UTC, Toronto and UTC+14.

### Pickers and platform conventions (from the Figma)
- **Note type:** `@react-native-picker/picker`, a wheel on iOS by default and
  `mode="dropdown"` on Android.
- **Date:** a "Select date" field that opens the native picker
  (`@react-native-community/datetimepicker` 9.1.0, the version Expo SDK 57
  pins): a spinner on iOS, the Material calendar dialog on Android.
  `maximumDate` is today, so future dates can't be picked at all, and
  validation still checks it as a second line of defence.
- **Buttons:** iOS gets plain blue text buttons stacked ("Add Note" over
  "Cancel"); Android gets a filled "ADD NOTE" with a text "Cancel".

My first version used a typed `YYYY-MM-DD` field to avoid a new native
dependency. After comparing with the Figma, I switched: the design clearly
shows a picker, and typing dates on a phone invites mistakes.

## Deviations from the Figma (and why)

The brief allows layout changes as long as all the information is present.
Every required field is shown. These are the places I chose differently:

| Figma | What I did | Why |
|---|---|---|
| Notes **oldest first** (Admission → Discharge) | **Newest first** | A clinician opening a chart needs the latest note first. With 5 notes it barely matters; with 50 it means scrolling to the bottom every time. Same-date notes show the most recently added first, so a note you just saved is always at the top. |
| Note type **preselected** ("Admission Note") | Starts on "Select a note type…" and is required | If a type is preselected, a nurse in a hurry can save the wrong type without ever touching the picker. Forcing a choice is a small cost for correct records. |
| Date field empty ("Select date") | Starts on today | Most notes are written the same day, so this saves a tap. It's still a picker and still easy to change. |
| "Label: value" inline text in cards | Aligned label / value rows | Easier to scan for one field ("which physician?"). Same information. |
| Medications joined with commas | One bullet per medication | Doses like "75 mg twice daily, 500 mg as needed" blur together in one line. |
| Note type in quotes as a title, "Note ID:" / "Date:" / "Note Text:" labels | Type as a coloured pill, date on the same line, ID small at the bottom | You scan notes by type and date, so those are most visible. The ID is kept (and copyable) but de-emphasised. |
| "Add New Clinical Note" as a text link | Filled button | It's the main action on the screen, so it should look like one. Still at the end of the list, where Figma puts it. |
| No filter | Note type filter chips | Extra. Helps once there are many notes; never offers a filter that shows nothing. |
| Nurse "Emily Clark", clinic "ABC Medical Center" | Whatever the client returns | Those are mockup values. The app shows real data. |
| App opens on the overview | App opens on a patient list | Extra, see below. The overview itself is still the brief's screen, under the same "Health Clinic" header. |

## Beyond the brief

The brief describes one patient on one screen. I added a little on top,
without changing that screen:

- **More seed patients.** `patients.ts` now has 24 patients instead of 1
  (John Doe is still first, and the starter tests still use him). Three are
  written out in full; 20 more are written compactly and expanded by a small
  `toPatient()` helper, with fixed ids so the seed is identical on every run.
  Each has a full discharge summary and 3–4 notes using the existing note
  types. `lib/` was regenerated.
- **Patient list.** With more than one patient, the app needed a way to pick
  one. The list shows name, age, gender, admission date and diagnosis, with
  the same loading / error / pull-to-refresh handling as the overview.
- **Pagination: 10 per page, "‹ Prev · Page 2 of 3 · Next ›".** All
  patients are fetched in **one** request and paged on the phone
  (`utils/patients.ts`: `pageOf`, `pageCount`). The header shows
  "11–20 of 24". A page change scrolls back to the top; a sort change goes
  back to page 1; if a refresh returns fewer patients, the page is clamped
  so it never points past the end.
- **Why page on the phone, and not ask the client page by page?** I built
  server paging first (cursor-based infinite scroll, sorting moved into the
  client) and replaced it:
  - Every request to the mock can take 3s and fails 1 time in 6. With
    server paging, every page turn was another chance to wait or fail. Now
    there's one request; after it, Next / Prev and sorting are instant and
    can't fail.
  - The client returns no total, so server paging can't say "of 3" without
    an extra call. With everything loaded, the total is known.
  - Sorting stays correct across pages, because every patient is present.
    (Sorting only the loaded pages would put an "Adams" from page 3 below a
    "Tremblay" on page 1.)
  - It kept the client's public API exactly as the starter had it.
  - **The trade-off:** this doesn't scale to thousands of patients. A
    clinic's list of current patients is small, so it fits here. For a large
    list I'd switch back to server paging: the client already supports
    `offset` / `limit` / `cursor`, and it would need a `sort` param so the
    order is decided where all the data is.
- **Search.** A search icon next to the "Patients" title; tapping it opens
  a focused search box under the title, which closes again when left empty.
  While it holds a query it stays open, so a filtered list never hides its
  filter, and the count says what's applied ("1–3 of 3 matching "pneu""). It filters as you type, by name, diagnosis or patient ID
  (`filterPatients` in `utils/patients.ts`). It
  ignores case and accents ("helene" finds "Hélène"), and every word must
  match, in any order ("pneu marie"). It filters the patients already
  loaded, so there's no request, no delay and no failure. A new search goes
  back to page 1, and an empty result says what was searched for.
- **Sorting.** Recently admitted (default), Name A–Z (by last name, accent-
  and case-insensitive), Age oldest first. A sort icon next to the search
  box opens a "Sort by" bottom sheet (`components/SortSheet.tsx`, built on
  RN `Modal`: the backdrop fades while the sheet slides up), with a
  checkmark on the current sort. Ties fall back to the id, so the order is total and a patient can't jump
  between pages from one render to the next.
- **New dependency: `@expo/vector-icons`** for the search, sort, clear and
  checkmark icons. It's Expo's standard icon set (installed with
  `npx expo install` so the version matches SDK 57), and the assets folder
  has no icons for these.
- **Opening a patient is instant.** The list has already downloaded each
  patient in full, so the overview starts from that copy (`patientCache`, a
  tiny stand-in for React Query's cache) and refreshes silently in the
  background. Before, every open was a fresh fetch behind a spinner, and 1
  open in 6 ended on "Couldn't load the patient": the mock's random failure,
  which I confirmed by logging the thrown error. A failed background
  refresh is swallowed (the data is seconds old). Saving a note updates the
  cached copy too, so reopening the patient shows it.
- **Navigation.** React Navigation's native stack (already installed). The
  header is still the starter `Header`, which gained an optional
  **‹ Patients** back button. Only `patientId` is passed as a route param.
- **Found while testing: note types loaded once.** With the list in place,
  each overview fetched the note types again. Tapping "Add New Clinical
  Note" right after opening a patient showed "Loading note types…" for up to
  3s with "Add Note" disabled. I measured the modal itself first: it is on
  screen ~0.6s after the tap, which is just the slide animation. The fix was
  to load the types once at app start (`NoteTypesContext`), so they're ready
  while the user is still on the list.
- **Found while testing: Note Text "not tappable" at first.** The real
  cause was a layout jump: when the types arrived, the short "Loading…" row
  was replaced by the 216pt iOS wheel, pushing Note Text down, so a tap
  aimed at it landed on the date field. The loading and error states now
  take the picker's height, so nothing below moves.

## Data handling and performance

- **Fetching one patient:** the client has no `fetchPatient(id)`, so the
  overview fetches the list and picks the patient by id. With a real API
  this would be `GET /patients/:id`.
- **Note types** are fetched once per app session, not once per patient.
- **Patients are paginated** 10 per page, on the phone, from one request.
  See [Beyond the brief](#beyond-the-brief) for why, and when I'd change it.
- **Clinical notes are not paginated, honestly:** they come embedded in the
  patient and the API has no way to page them, so paging them on the phone
  would be fake. What I did instead: `FlatList` virtualization (only visible
  cards render), `React.memo` on note cards, and `useMemo` for sort/filter.
  For a real backend I'd ask for
  `GET /patients/:id/notes?cursor=...&limit=20&type=...` and hook it to
  `onEndReached`.
- **Sorting:** newest first; same-date notes show the most recently added first.
- **Filtering:** by note type, with counts; only types that exist are offered.

## Bugs found in the starter (and fixed)

1. **Unawaited storage writes.** The `Client` constructor called
   `resetState()` without awaiting it, and `resetState()` didn't await its two
   `setItem` calls. It worked only because the random delay gave storage time.
   Fixed with a `ready` promise every method awaits.
2. **Saves rolled the failure dice twice.** `addNewClinicalNote` called
   `fetchPatientData`, which runs the random delay/failure again: one save could
   take ~6s and failed about twice as often. It now reads storage directly.
   *Regression test: fails on the starter, passes now.*
3. **Shared-array mutation.** The patient was shallow-copied and then `push()`
   was called on the original notes array. Now builds a new array.
4. **Mojibake in seed data.** `InfirmiÃ¨re HÃ©lÃ¨ne` and
   `Sainte-Anne-de-BeauprÃ©` were UTF-8 read as Latin-1. Fixed to
   `Infirmière Hélène` / `Beaupré`. *Regression test.*
5. **Literal `\n` in a note.** The discharge note contained `\\n`, so the UI
   printed a backslash and an n. Now a real line break. *Regression test.*

The public API of the client is unchanged. `lib/` was regenerated with
`npm run build:lib`.

Also noticed, left alone: the seed patient "John Doe" has gender "Female".
That's data, not code, so I didn't change it.

## Tests (60, all passing)

- `src/data/index.test.ts`: the starter's tests (unchanged) + 4 new ones for
  the fixes above.
- `src/utils/patients.test.ts`: each patient sort order, accents/case, ties
  (the order is total), search (blank query, accents, diagnosis and ID,
  multi-word), and paging (`pageCount`, `pageOf`, empty list, past the last
  page).
- `src/utils/*.test.ts` (others): dates (incl. timezone and impossible dates
  like Feb 31), note sorting/filtering, validation rules, note building,
  error messages.

I kept tests on pure logic because `@testing-library/react-native` isn't in
the starter. With more time I'd add it and test the hooks (stale responses,
refresh failure keeps data) and the modal flow (validation, failed save keeps
text).

## Verified

- `tsc --noEmit` passes (strict mode).
- `npm test`: 60/60.
- `expo export` bundles for both iOS and Android with no errors.

## With more time

1. Component and hook tests with React Native Testing Library.
2. React Query for caching / retry with backoff.
3. Real note pagination once the API supports it.
4. `react-native-keyboard-controller` for smoother keyboard handling on
   Android's edge-to-edge mode.
5. Localization (FR/EN), since the clinic is in Québec.
6. Dark mode (the app is forced to light in `app.json` today).
