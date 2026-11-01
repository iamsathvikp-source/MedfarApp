import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
	it("hides the mock client's synthetic error behind a friendly message", () => {
		expect(getErrorMessage(new Error("A synthetic error happened"))).toMatch(/try again/i);
	});

	it("explains a missing patient", () => {
		expect(getErrorMessage(new Error("Patient not found"))).toMatch(/could not be found/);
	});

	it("handles non-Error throws", () => {
		expect(getErrorMessage("boom")).toMatch(/try again/i);
	});
});
