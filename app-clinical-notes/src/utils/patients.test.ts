import type { PatientData } from "../data";
import seed from "../data/patients";
import { filterPatients, pageCount, pageOf, sortPatients } from "./patients";

const patient = (
	name: string,
	age: number,
	dateOfAdmission: string,
): PatientData => ({ ...seed[0], id: name, name, age, dateOfAdmission });

const patients = [
	patient("Marie Tremblay", 67, "2023-08-02"),
	patient("Sophie Lavoie", 29, "2023-10-20"),
	patient("Ahmed Benali", 54, "2023-09-11"),
];

const names = (list: PatientData[]) => list.map((p) => p.name);

describe("sortPatients", () => {
	it("sorts by most recent admission first", () => {
		expect(names(sortPatients(patients, "admitted"))).toEqual([
			"Sophie Lavoie",
			"Ahmed Benali",
			"Marie Tremblay",
		]);
	});

	it("sorts by last name, ignoring accents and case", () => {
		const list = [...patients, patient("Élise lacroix", 40, "2023-01-01")];

		expect(names(sortPatients(list, "name"))).toEqual([
			"Ahmed Benali",
			"Élise lacroix",
			"Sophie Lavoie",
			"Marie Tremblay",
		]);
	});

	it("sorts by age, oldest first, then by name on ties", () => {
		const list = [...patients, patient("Paul Arsenault", 54, "2023-01-01")];

		expect(names(sortPatients(list, "age"))).toEqual([
			"Marie Tremblay",
			"Paul Arsenault",
			"Ahmed Benali",
			"Sophie Lavoie",
		]);
	});

	it("falls back to id so the order is total (paging relies on it)", () => {
		const twins = [
			{ ...patient("Ana Roy", 40, "2023-01-01"), id: "b" },
			{ ...patient("Ana Roy", 40, "2023-01-01"), id: "a" },
		];

		expect(sortPatients(twins, "age").map((p) => p.id)).toEqual(["a", "b"]);
	});

	it("does not mutate the input", () => {
		const copy = [...patients];

		sortPatients(patients, "name");

		expect(patients).toEqual(copy);
	});
});

describe("pageCount", () => {
	it("rounds up to whole pages", () => {
		expect(pageCount(24, 10)).toBe(3);
		expect(pageCount(20, 10)).toBe(2);
	});

	it("is 1 for an empty list", () => {
		expect(pageCount(0, 10)).toBe(1);
	});
});

describe("pageOf", () => {
	const items = Array.from({ length: 24 }, (_, i) => i);

	it("returns the items on a 0-based page", () => {
		expect(pageOf(items, 0, 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(pageOf(items, 2, 10)).toEqual([20, 21, 22, 23]);
	});

	it("returns nothing past the last page", () => {
		expect(pageOf(items, 3, 10)).toEqual([]);
	});
});

describe("filterPatients", () => {
	const list = [
		{ ...patient("Marie Tremblay", 67, "2023-08-02"), id: "5f2a-marie" },
		{ ...patient("Hélène Caron", 88, "2024-09-18"), id: "8c3e-helene" },
	];
	list[0].dischargeSummary = { ...list[0].dischargeSummary, diagnosis: "Pneumonia" };

	const found = (query: string) => names(filterPatients(list, query));

	it("returns everyone for an empty or blank query", () => {
		expect(found("")).toEqual(["Marie Tremblay", "Hélène Caron"]);
		expect(found("   ")).toEqual(["Marie Tremblay", "Hélène Caron"]);
	});

	it("ignores case and accents", () => {
		expect(found("HELENE")).toEqual(["Hélène Caron"]);
		expect(found("hélène")).toEqual(["Hélène Caron"]);
	});

	it("matches the diagnosis and the patient id", () => {
		expect(found("pneumo")).toEqual(["Marie Tremblay"]);
		expect(found("8c3e")).toEqual(["Hélène Caron"]);
	});

	it("needs every word, in any order", () => {
		expect(found("pneu marie")).toEqual(["Marie Tremblay"]);
		expect(found("pneu helene")).toEqual([]);
	});
});
