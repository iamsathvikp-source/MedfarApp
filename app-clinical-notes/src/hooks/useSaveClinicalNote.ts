import { useCallback, useEffect, useRef, useState } from "react";

import client from "../client";
import type { ClinicalNote } from "../data";
import { getErrorMessage } from "../utils/errors";

export interface UseSaveClinicalNoteResult {
	save: (patientId: string, note: ClinicalNote) => Promise<boolean>;
	saving: boolean;
	error: string | null;
	clearError: () => void;
}

export const useSaveClinicalNote = (): UseSaveClinicalNoteResult => {
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const inFlight = useRef(false);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const save = useCallback(
		async (patientId: string, note: ClinicalNote): Promise<boolean> => {
			if (inFlight.current) return false;

			inFlight.current = true;
			setSaving(true);
			setError(null);

			try {
				await client.addNewClinicalNote(patientId, note);
				return true;
			} catch (caught) {
				if (isMounted.current) setError(getErrorMessage(caught));
				return false;
			} finally {
				inFlight.current = false;
				if (isMounted.current) setSaving(false);
			}
		},
		[],
	);

	const clearError = useCallback(() => setError(null), []);

	return { save, saving, error, clearError };
};
