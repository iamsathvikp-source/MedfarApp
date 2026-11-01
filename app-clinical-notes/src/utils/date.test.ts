import {
	formatDate,
	parseISODate,
	toISODate,
	todayISO,
} from "./date";

describe("date utils", () => {
	describe("parseISODate", () => {
		it("parses a valid date in LOCAL time (no off-by-one-day)", () => {
			const date = parseISODate("2023-07-15");

			expect(date?.getFullYear()).toBe(2023);
			expect(date?.getMonth()).toBe(6);
			expect(date?.getDate()).toBe(15);
		});

		it.each(["2023-02-31", "2023-13-01", "2023-7-15", "15/07/2023", "", "abc"])(
			"rejects %p",
			(value) => {
				expect(parseISODate(value)).toBeNull();
			},
		);

		it("accepts Feb 29 only in a leap year", () => {
			expect(parseISODate("2024-02-29")).not.toBeNull();
			expect(parseISODate("2023-02-29")).toBeNull();
		});
	});

	describe("formatDate", () => {
		it("formats as an unambiguous 'Mon D, YYYY'", () => {
			expect(formatDate("2023-07-15")).toBe("Jul 15, 2023");
			expect(formatDate("2024-01-01")).toBe("Jan 1, 2024");
		});

		it("returns malformed values unchanged instead of 'Invalid Date'", () => {
			expect(formatDate("not-a-date")).toBe("not-a-date");
		});
	});

	describe("toISODate / todayISO", () => {
		it("zero-pads month and day", () => {
			expect(toISODate(new Date(2023, 0, 5))).toBe("2023-01-05");
		});

		it("uses the injected 'now'", () => {
			expect(todayISO(new Date(2026, 9, 30))).toBe("2026-10-30");
		});
	});
});
