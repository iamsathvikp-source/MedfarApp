import noteTypes from "../data/noteType";
import { buildClinicalNote, generateId } from "./clinicalNote";

describe("clinicalNote utils", () => {
	it("generateId returns a v4-shaped id, different each time", () => {
		const a = generateId();
		const b = generateId();

		expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		expect(a).not.toBe(b);
	});

	it("buildClinicalNote trims input and attaches the full type object", () => {
		const note = buildClinicalNote(
			{ typeId: "CN003", date: " 2026-10-29 ", text: "  Lab ok.  " },
			noteTypes,
			"note-1",
		);

		expect(note).toEqual({
			id: "note-1",
			date: "2026-10-29",
			type: { id: "CN003", name: "Lab Results" },
			noteText: "Lab ok.",
		});
	});

	it("buildClinicalNote returns null for an unknown type", () => {
		expect(
			buildClinicalNote({ typeId: "NOPE", date: "2026-10-29", text: "x" }, noteTypes, "id"),
		).toBeNull();
	});
});
