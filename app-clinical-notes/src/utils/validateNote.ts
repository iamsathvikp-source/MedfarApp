import { parseISODate, todayISO } from "./date";

export const MAX_NOTE_LENGTH = 2000;

export interface NoteDraft {
	typeId: string | null;
	date: string;
	text: string;
}

export type NoteField = "typeId" | "date" | "text";
export type NoteErrors = Partial<Record<NoteField, string>>;

export const validateNote = (
	draft: NoteDraft,
	today: string = todayISO(),
): NoteErrors => {
	const errors: NoteErrors = {};

	if (!draft.typeId) {
		errors.typeId = "Please choose a note type.";
	}

	const date = draft.date.trim();
	if (!parseISODate(date)) {
		errors.date = "Enter a valid date as YYYY-MM-DD.";
	} else if (date > today) {
		errors.date = "The note date can't be in the future.";
	}

	const text = draft.text.trim();
	if (text.length === 0) {
		errors.text = "Note text can't be empty.";
	} else if (text.length > MAX_NOTE_LENGTH) {
		errors.text = `Keep the note under ${MAX_NOTE_LENGTH} characters.`;
	}

	return errors;
};

export const hasErrors = (errors: NoteErrors): boolean =>
	Object.keys(errors).length > 0;
