export const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error && error.message === "Patient not found") {
		return "This patient could not be found.";
	}

	return "We couldn't reach the server. Please try again.";
};
