import type { ClinicalNoteType } from ".";

const noteTypes: ClinicalNoteType[] = [
	{ id: "CN001", name: "Admission Note" },
	{ id: "CN002", name: "Progress Note" },
	{ id: "CN003", name: "Lab Results" },
	{ id: "CN004", name: "Consultation" },
	{ id: "CN005", name: "Discharge Note" },
];

export default noteTypes;
