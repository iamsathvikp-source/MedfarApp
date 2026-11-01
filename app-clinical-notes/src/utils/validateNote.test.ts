import { hasErrors, MAX_NOTE_LENGTH, validateNote, type NoteDraft } from "./validateNote";

const TODAY = "2026-10-30";

const validDraft: NoteDraft = {
	typeId: "CN002",
	date: "2026-10-29",
	text: "Patient resting comfortably.",
};

describe("validateNote", () => {
	it("accepts a valid draft", () => {
		expect(validateNote(validDraft, TODAY)).toEqual({});
		expect(hasErrors(validateNote(validDraft, TODAY))).toBe(false);
	});

	it("accepts today's date", () => {
		expect(validateNote({ ...validDraft, date: TODAY }, TODAY)).toEqual({});
	});

	it("requires a note type", () => {
		expect(validateNote({ ...validDraft, typeId: null }, TODAY).typeId).toBeDefined();
	});

	it("rejects a malformed or impossible date", () => {
		expect(validateNote({ ...validDraft, date: "2026/10/29" }, TODAY).date).toBeDefined();
		expect(validateNote({ ...validDraft, date: "2026-02-30" }, TODAY).date).toBeDefined();
	});

	it("rejects a future date", () => {
		const errors = validateNote({ ...validDraft, date: "2026-10-31" }, TODAY);

		expect(errors.date).toMatch(/future/);
	});

	it("rejects empty or whitespace-only text", () => {
		expect(validateNote({ ...validDraft, text: "" }, TODAY).text).toBeDefined();
		expect(validateNote({ ...validDraft, text: "   \n  " }, TODAY).text).toBeDefined();
	});

	it("rejects text over the max length", () => {
		const text = "a".repeat(MAX_NOTE_LENGTH + 1);

		expect(validateNote({ ...validDraft, text }, TODAY).text).toBeDefined();
	});

	it("reports every problem at once, not one at a time", () => {
		const errors = validateNote({ typeId: null, date: "", text: "" }, TODAY);

		expect(Object.keys(errors).sort()).toEqual(["date", "text", "typeId"]);
	});
});
