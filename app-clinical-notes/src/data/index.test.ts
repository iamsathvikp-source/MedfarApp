import Client, { type ClinicalNote } from "./";
import noteTypeData from "./noteType";
import patientData from "./patients";

import AsyncStorage from "@react-native-async-storage/async-storage";

const PATIENT_ID = "d33ddc07-c051-4b7f-9999-c3eaf651a4c1";

const NO_ERROR_RANDOM = 0.5;
const SYNTHETIC_ERROR_RANDOM = 0.1;

const settle = async <T>(promise: Promise<T>): Promise<T> => {
	await jest.runAllTimersAsync();
	return promise;
};

describe("Client", () => {
	let client: Client;

	beforeEach(async () => {
		jest.useFakeTimers();
		jest.spyOn(Math, "random").mockReturnValue(NO_ERROR_RANDOM);
		jest.spyOn(console, "log").mockImplementation(() => {});

		await AsyncStorage.clear();
		client = new Client();
		await client.resetState();
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.useRealTimers();
	});

	describe("seed data", () => {
		it("uses a known ClinicalNoteType object for every clinical note", () => {
			const notes = patientData.flatMap((patient) => patient.clinicalNotes);

			expect(notes.length).toBeGreaterThan(0);
			notes.forEach((note) => {
				expect(noteTypeData).toContainEqual(note.type);
			});
		});

		it("has no mis-encoded (mojibake) characters", () => {
			const seedText = JSON.stringify(patientData);

			expect(seedText).not.toMatch(/Ã./);
			expect(patientData[0].nurse).toBe("Infirmière Hélène");
			expect(patientData[0].clinic).toBe("Clinique Sainte-Anne-de-Beaupré");
		});

		it("uses real line breaks, not a literal backslash-n", () => {
			const notes = patientData.flatMap((patient) => patient.clinicalNotes);

			notes.forEach((note) => {
				expect(note.noteText).not.toContain("\\n");
			});
		});
	});

	describe("resetState", () => {
		it("should set patientData and clinicalNoteTypes in AsyncStorage", async () => {
			await client.resetState();

			expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
			expect(AsyncStorage.setItem).toHaveBeenCalledWith(
				"patientData",
				JSON.stringify(patientData),
			);
			expect(AsyncStorage.setItem).toHaveBeenCalledWith(
				"clinicalNoteTypes",
				JSON.stringify(noteTypeData),
			);
		});
	});

	describe("fetchPatientData", () => {
		it("should fetch patient data from AsyncStorage", async () => {
			const data = await settle(client.fetchPatientData());

			expect(AsyncStorage.getItem).toHaveBeenCalledWith("patientData");
			expect(data).toEqual(patientData);
		});

		describe("pagination", () => {
			const patients = ["p1", "p2", "p3"].map((id) => ({
				...patientData[0],
				id,
			}));

			beforeEach(async () => {
				await AsyncStorage.setItem("patientData", JSON.stringify(patients));
			});

			it("should apply offset and limit", async () => {
				const data = await settle(
					client.fetchPatientData({ offset: 1, limit: 1 }),
				);

				expect(data).toEqual([patients[1]]);
			});

			it("should return the patients after the cursor", async () => {
				const data = await settle(client.fetchPatientData({ cursor: "p1" }));

				expect(data).toEqual([patients[1], patients[2]]);
			});
		});

		it("should return an empty array if patient data is not available", async () => {
			await AsyncStorage.clear();

			const data = await settle(client.fetchPatientData());

			expect(data).toEqual([]);
		});

		it("should reject with a synthetic error when the random delay is too short", async () => {
			jest.spyOn(Math, "random").mockReturnValue(SYNTHETIC_ERROR_RANDOM);

			await expect(client.fetchPatientData()).rejects.toThrow(
				"A synthetic error happened",
			);
		});
	});

	describe("addNewClinicalNote", () => {
		const clinicalNote: ClinicalNote = {
			id: "note-id",
			date: "2023-07-22",
			type: noteTypeData[0],
			noteText: "Test clinical note",
		};

		it("should add a new clinical note to the patient data", async () => {
			await settle(client.addNewClinicalNote(PATIENT_ID, clinicalNote));

			const data = await settle(client.fetchPatientData());
			const patient = data.find((p) => p.id === PATIENT_ID);

			expect(patient?.clinicalNotes).toContainEqual(clinicalNote);
			expect(patient?.clinicalNotes).toHaveLength(
				patientData[0].clinicalNotes.length + 1,
			);
		});

		it("should simulate only one network call per save", async () => {
			await settle(client.addNewClinicalNote(PATIENT_ID, clinicalNote));

			expect(Math.random).toHaveBeenCalledTimes(1);
		});

		it("should not mutate the seed data", async () => {
			const before = patientData[0].clinicalNotes.length;

			await settle(client.addNewClinicalNote(PATIENT_ID, clinicalNote));

			expect(patientData[0].clinicalNotes).toHaveLength(before);
		});

		it("should reject when the patient does not exist", async () => {
			const promise = client.addNewClinicalNote("unknown-id", clinicalNote);
			const assertion = expect(promise).rejects.toThrow("Patient not found");

			await jest.runAllTimersAsync();
			await assertion;
			expect(AsyncStorage.setItem).not.toHaveBeenCalled();
		});
	});

	describe("fetchClinicalNoteTypes", () => {
		it("should fetch clinical note types from AsyncStorage", async () => {
			const data = await settle(client.fetchClinicalNoteTypes());

			expect(AsyncStorage.getItem).toHaveBeenCalledWith("clinicalNoteTypes");
			expect(data).toEqual(noteTypeData);
		});

		it("should return an empty array if clinical note types are not available", async () => {
			await AsyncStorage.clear();

			const data = await settle(client.fetchClinicalNoteTypes());

			expect(data).toEqual([]);
		});
	});
});
