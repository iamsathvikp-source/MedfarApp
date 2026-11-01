import type { PatientData } from "../data";

export type PatientSortKey = "admitted" | "name" | "age";

export const PATIENT_SORT_OPTIONS: { key: PatientSortKey; label: string }[] = [
	{ key: "admitted", label: "Recently admitted" },
	{ key: "name", label: "Name (A–Z)" },
	{ key: "age", label: "Age (oldest)" },
];

const lastName = (name: string) => name.trim().split(/\s+/).pop() ?? name;

const byName = (a: PatientData, b: PatientData) =>
	lastName(a.name).localeCompare(lastName(b.name), undefined, {
		sensitivity: "base",
	}) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const comparators: Record<
	PatientSortKey,
	(a: PatientData, b: PatientData) => number
> = {
	admitted: (a, b) =>
		b.dateOfAdmission.localeCompare(a.dateOfAdmission) || byName(a, b),
	name: byName,
	age: (a, b) => b.age - a.age || byName(a, b),
};

export const sortPatients = (
	patients: PatientData[],
	key: PatientSortKey,
): PatientData[] =>
	[...patients].sort(
		(a, b) => comparators[key](a, b) || a.id.localeCompare(b.id),
	);

const normalize = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const filterPatients = (
	patients: PatientData[],
	query: string,
): PatientData[] => {
	const words = normalize(query).split(/\s+/).filter(Boolean);
	if (words.length === 0) return patients;

	return patients.filter((patient) => {
		const haystack = normalize(
			`${patient.name} ${patient.dischargeSummary.diagnosis} ${patient.id}`,
		);
		return words.every((word) => haystack.includes(word));
	});
};

export const pageCount = (total: number, pageSize: number): number =>
	Math.max(1, Math.ceil(total / pageSize));

export const pageOf = <T>(items: T[], page: number, pageSize: number): T[] =>
	items.slice(page * pageSize, (page + 1) * pageSize);
