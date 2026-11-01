import type { ClinicalNote, ClinicalNoteType } from "../data";
import type { NoteDraft } from "./validateNote";

export const generateId = (): string =>
	"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
		const random = (Math.random() * 16) | 0;
		const value = char === "x" ? random : (random & 0x3) | 0x8;
		return value.toString(16);
	});

export const buildClinicalNote = (
	draft: NoteDraft,
	noteTypes: ClinicalNoteType[],
	id: string,
): ClinicalNote | null => {
	const type = noteTypes.find((noteType) => noteType.id === draft.typeId);

	if (!type) {
		return null;
	}

	return {
		id,
		date: draft.date.trim(),
		type,
		noteText: draft.text.trim(),
	};
};
