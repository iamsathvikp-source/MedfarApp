import type { ClinicalNote } from "../data";
import noteTypes from "../data/noteType";
import { countNotesByType, filterNotesByType, sortNotesNewestFirst } from "./notes";

const [admission, progress, lab] = noteTypes;

const note = (id: string, date: string, type = progress): ClinicalNote => ({
	id,
	date,
	type,
	noteText: `note ${id}`,
});

describe("notes utils", () => {
	describe("sortNotesNewestFirst", () => {
		it("puts the newest date first", () => {
			const notes = [note("a", "2023-07-15"), note("b", "2023-07-17"), note("c", "2023-07-16")];

			expect(sortNotesNewestFirst(notes).map((n) => n.id)).toEqual(["b", "c", "a"]);
		});

		it("shows the most recently ADDED note first when dates are equal", () => {
			const notes = [note("older", "2023-07-15"), note("newer", "2023-07-15")];

			expect(sortNotesNewestFirst(notes).map((n) => n.id)).toEqual(["newer", "older"]);
		});

		it("does not mutate the input (it's React state)", () => {
			const notes = [note("a", "2023-07-15"), note("b", "2023-07-17")];
			const copy = [...notes];

			sortNotesNewestFirst(notes);

			expect(notes).toEqual(copy);
		});
	});

	describe("filterNotesByType", () => {
		const notes = [note("a", "2023-07-15", admission), note("b", "2023-07-16", lab)];

		it("returns everything for 'All' (null)", () => {
			expect(filterNotesByType(notes, null)).toBe(notes);
		});

		it("keeps only the selected type", () => {
			expect(filterNotesByType(notes, lab.id).map((n) => n.id)).toEqual(["b"]);
		});
	});

	describe("countNotesByType", () => {
		it("counts per type in first-seen order", () => {
			const notes = [
				note("a", "2023-07-15", lab),
				note("b", "2023-07-16", admission),
				note("c", "2023-07-17", lab),
			];

			expect(countNotesByType(notes)).toEqual([
				{ type: lab, count: 2 },
				{ type: admission, count: 1 },
			]);
		});
	});
});
