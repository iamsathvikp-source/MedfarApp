import noteTypeData from "./noteType";
import patientData from "./patients";

import AsyncStorage from "@react-native-async-storage/async-storage";

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

const randomFuzz = () =>
	new Promise((resolve, reject) => {
		const randomDelay = Math.random() * 3000;

		if (randomDelay < 500) {
			reject(new Error("A synthetic error happened"));
			return;
		}

		setTimeout(resolve, randomDelay);
	});

interface FetchParams {
	offset?: number;
	limit?: number;
	cursor?: string | null;
}

const slice = <T extends Array<PatientData>>(list: T, opts: FetchParams) => {
	if (opts.cursor) {
		const index = list.findIndex(({ id }) => id === opts.cursor);
		list.splice(0, index + 1);
	} else {
		if (opts.offset) {
			list.splice(0, opts.offset);
		}
	}

	if (opts.limit) {
		list.splice(opts.limit);
	}
};

export default class Client {
	constructor() {
		this.resetState();
	}

	async resetState() {
		AsyncStorage.setItem("patientData", JSON.stringify(patientData));
		AsyncStorage.setItem("clinicalNoteTypes", JSON.stringify(noteTypeData));
	}

	async fetchPatientData(opts?: FetchParams): Promise<PatientData[]> {
		await randomFuzz();

		console.log("Fetching patient data...");

		const data = await AsyncStorage.getItem("patientData");

		if (!data) {
			return [];
		}

		const patientData = JSON.parse(data) as null | PatientData[];

		if (!patientData) {
			return [];
		}

		if (opts) {
			slice(patientData, opts);
		}

		return patientData;
	}

	async addNewClinicalNote(
		patientId: string,
		clinicalNote: ClinicalNote,
	): Promise<void> {
		await randomFuzz();

		console.log(`Adding new clinical note for patient with ID: ${patientId}`);

		const patientData = await this.fetchPatientData();

		const patientIndex = patientData.findIndex(
			(patient) => patient.id === patientId,
		);
		if (patientIndex === -1) {
			throw new Error("Patient not found");
		}

		const updatedPatient = { ...patientData[patientIndex] };
		updatedPatient.clinicalNotes.push(clinicalNote);

		patientData[patientIndex] = updatedPatient;

		const updatedPatientData = JSON.stringify(patientData);

		await AsyncStorage.setItem("patientData", updatedPatientData);
	}

	async fetchClinicalNoteTypes(): Promise<ClinicalNoteType[]> {
		await randomFuzz();

		console.log("Fetching clinical note types...");

		const data = await AsyncStorage.getItem("clinicalNoteTypes");

		if (!data) {
			return [];
		}

		const clinicalNoteTypes = JSON.parse(data) as null | ClinicalNoteType[];

		if (!clinicalNoteTypes) {
			return [];
		}

		return clinicalNoteTypes;
	}
}
