import type { ClinicalNote, ClinicalNoteType } from "../data";

export const sortNotesNewestFirst = (notes: ClinicalNote[]): ClinicalNote[] =>
	notes
		.map((note, index) => ({ note, index }))
		.sort(
			(a, b) => b.note.date.localeCompare(a.note.date) || b.index - a.index,
		)
		.map(({ note }) => note);

export const filterNotesByType = (
	notes: ClinicalNote[],
	typeId: string | null,
): ClinicalNote[] =>
	typeId === null ? notes : notes.filter((note) => note.type.id === typeId);

export const countNotesByType = (
	notes: ClinicalNote[],
): { type: ClinicalNoteType; count: number }[] => {
	const counts = new Map<string, { type: ClinicalNoteType; count: number }>();

	notes.forEach((note) => {
		const entry = counts.get(note.type.id);
		if (entry) {
			entry.count += 1;
		} else {
			counts.set(note.type.id, { type: note.type, count: 1 });
		}
	});

	return [...counts.values()];
};
