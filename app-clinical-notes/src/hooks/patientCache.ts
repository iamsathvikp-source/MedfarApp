import type { PatientData } from "../data";

const cache = new Map<string, PatientData>();

export const patientCache = {
	get: (id: string) => cache.get(id),
	set: (patient: PatientData) => {
		cache.set(patient.id, patient);
	},
	setMany: (patients: PatientData[]) => {
		patients.forEach((patient) => cache.set(patient.id, patient));
	},
};
