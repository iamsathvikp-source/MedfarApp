import { useCallback, useEffect, useRef, useState } from "react";

import client from "../client";
import type { ClinicalNoteType } from "../data";
import { getErrorMessage } from "../utils/errors";

export interface UseNoteTypesResult {
	noteTypes: ClinicalNoteType[];
	loading: boolean;
	error: string | null;
	reload: () => void;
}

export const useNoteTypes = (): UseNoteTypesResult => {
	const [noteTypes, setNoteTypes] = useState<ClinicalNoteType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const latestRequestId = useRef(0);
	const isMounted = useRef(true);

	const load = useCallback(async () => {
		const requestId = ++latestRequestId.current;
		const isLatest = () =>
			isMounted.current && requestId === latestRequestId.current;

		setLoading(true);
		setError(null);

		try {
			const types = await client.fetchClinicalNoteTypes();
			if (!isLatest()) return;
			setNoteTypes(types);
		} catch (caught) {
			if (!isLatest()) return;
			setError(getErrorMessage(caught));
		} finally {
			if (isLatest()) setLoading(false);
		}
	}, []);

	useEffect(() => {
		isMounted.current = true;
		load();
		return () => {
			isMounted.current = false;
		};
	}, [load]);

	return { noteTypes, loading, error, reload: load };
};
