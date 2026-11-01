const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const toISODate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const todayISO = (now: Date = new Date()): string => toISODate(now);

export const parseISODate = (value: string): Date | null => {
	if (!ISO_DATE_PATTERN.test(value)) {
		return null;
	}

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	const isSameDate =
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day;

	return isSameDate ? date : null;
};

export const formatDate = (value: string): string => {
	const date = parseISODate(value);

	if (!date) {
		return value;
	}

	return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
