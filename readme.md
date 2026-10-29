# Medfar Mobile Coding Challenge

This repository contains the Mobile Code Challenge for Medfar Clinical Solution. It includes a mock data Client that you will use for the challenge and all the assets exported from Figma.

Additionally, there is a React Native project with Expo and TypeScript already set up for your convenience in the `app-clinical-notes` directory. If you are comfortable with this setup, feel free to use it for the challenge. However, if you prefer to use your own setup, you are welcome to do so. The main goal is to complete the Mobile Code Challenge using either the provided setup or your preferred one. Good luck!

See the [app-clinical-notes readme](app-clinical-notes/README.md) for the setup instructions and the project structure.

## Goals

As part of the Medfar mobile app development, you have been assigned to implement the following flows:

1. Display Patient Information
2. Display Discharge Summary
3. Display a List of Clinical Notes
4. Enable Users to Add New Clinical Notes

To achieve this, the design team has provided the necessary screens on Figma, which can be accessed using the following link: [Figma Screens](https://www.figma.com/design/jPSwbel14b00bbboVn79wW/Clinical-Notes-App).

The design is made of two views:

- **Patient overview**: a single scrollable screen, under a "Health Clinic" header, that shows the patient information, the discharge summary and the list of clinical notes, followed by an "Add New Clinical Note" button. Flows 1 to 3 all live on this screen. The three overview frames in Figma are the same screen at different scroll positions.
- **Add New Clinical Note**: a modal opened from the overview.

The application should use the default font of the operating system. Icon/Images assets are available in the `/assets` directory.

Your colleagues have already created a mock data client to facilitate the development of these screens. The mock client allows you to fetch data without relying on real server communications, making future migration easier. To simulate a real network, every call waits a random delay of up to 3 seconds and occasionally fails with a synthetic error, so your UI should handle loading and error states.

If you are using this repository, you can import the mock data client from `src/data` (a ready-to-use instance is exported from `src/client`). Alternatively, if you prefer to use your own setup, you can copy the `lib/` directory and import it accordingly.

Your task is to implement the specified flows using the provided design and mock data client, ensuring a smooth and user-friendly experience for Medfar's mobile app users. Happy coding!

The mock client exposes the following interface:

```tsx
export default class Client {
  fetchPatientData(opts?: FetchParams): Promise<PatientData[]>;

  fetchClinicalNoteTypes(): Promise<ClinicalNoteType[]>;

  addNewClinicalNote(
    patientId: string,
    clinicalNote: ClinicalNote
  ): Promise<void>;
}

interface FetchParams {
  offset?: number;
  limit?: number;
  cursor?: string | null;
}

export interface ClinicalNote {
  id: string;
  date: string;
  type: ClinicalNoteType;
  noteText: string;
}

export interface ClinicalNoteType {
  id: string;
  name: string;
}

export interface DischargeSummary {
  date: string;
  diagnosis: string;
  medication: string[];
  instructions: string;
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  dateOfAdmission: string;
  admittingPhysician: string;
  dischargeSummary: DischargeSummary;
  nurse: string;
  clinic: string;
  clinicalNotes: ClinicalNote[];
}
```

## Suggested milestones

### Set Up Project and Environment

Use the provided project OR set up your own preferred project structure.
The provided project already includes React Navigation, Async Storage and the Picker component; add any other dependency you need.
Verify that the development environment is set up correctly and running smoothly.

### Mock Data Client Integration

If you decide to use your own set up, remember to import the mock data Client into the project from `lib` directory.
Ensure the client can fetch patient data and clinical note types successfully.
Use console.log statements to verify that the data is being fetched correctly.

### Build the Patient Overview Screen

Create a single scrollable screen that fetches the patient data with the mock data client and displays, from top to bottom:

1. **Header**: the "Health Clinic" title bar (a starter `Header` component is provided in `src/components`).
2. **Patient information**: name, patient ID, age, gender, date of admission, admitting physician, nurse and clinic (starter component: `PatientInfo`).
3. **Discharge summary**: date, diagnosis, medication and instructions, shown in the same card as the patient information.
4. **Clinical notes list**: one card per note showing the note type, note ID, date and note text (starter component: `ClinicalNote`).
5. **"Add New Clinical Note" button** at the end of the list, which opens the Add New Clinical Note modal.

Handle the loading and error states of the mock client, and make sure the list stays up to date after a note is added.

### Add New Clinical Note Modal

Create a modal that lets the user add a new clinical note for the displayed patient (starter component: `AddNoteModal`). It shows:

- **Patient ID**: read-only.
- **Note Type**: a picker populated with `fetchClinicalNoteTypes`. Figma shows a wheel picker on iOS and a dropdown on Android.
- **Date**: the date of the note.
- **Note Text**: a multiline text input.
- **"Add Note"** to save and **"Cancel"** to dismiss the modal.

Use the `addNewClinicalNote` method from the mock data client to save the new note.

### Navigation

The design has a single screen plus a modal, so you can present the Add New Clinical Note form with React Native's `Modal` or as a modal route with React Navigation (`presentation: "modal"`). Both are already installed; choose the approach you prefer and explain your choice.

### Styling and Theming

The provided Figma design includes all the necessary data, but you have the freedom to update the layout as you prefer, as long as it presents all the required information.

## Delivering the results

- Test the app on different devices and screen sizes to ensure responsiveness.
- Debug and fix any issues that may arise during testing.
- Documentation and Refactoring

Ensure the code is well-documented and easy to understand.

Refactor and optimize the code as needed to improve maintainability and performance.

Please document your changes and improvement. Provide adequate justifications.

### Final Review and Polish

Conduct a final review of the app to ensure all requirements are met.
Polish the app and make any final adjustments before submission.

Push your code in a branch called "TEST".

Create a pull request to merge the "TEST" branch in the main branch.

Notify the person that gave you the test that it is completed. Send that person any supporting documentation (e.g. a document explaining architecture choices, changes, and improvements)
