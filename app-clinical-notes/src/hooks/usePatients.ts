import { useCallback, useEffect, useRef, useState } from "react";

import client from "../client";
import type { PatientData } from "../data";
import { getErrorMessage } from "../utils/errors";
import { patientCache } from "./patientCache";

export const PAGE_SIZE = 10;

type LoadMode = "initial" | "refresh";

export interface UsePatientsResult {
	patients: PatientData[] | null;
	loading: boolean;
	refreshing: boolean;
	error: string | null;
	reload: () => void;
	refresh: () => void;
}

export const usePatients = (): UsePatientsResult => {
	const [patients, setPatients] = useState<PatientData[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const latestRequestId = useRef(0);
	const isMounted = useRef(true);

	const load = useCallback(async (mode: LoadMode) => {
		const requestId = ++latestRequestId.current;
		const isLatest = () =>
			isMounted.current && requestId === latestRequestId.current;

		if (mode === "initial") setLoading(true);
		if (mode === "refresh") setRefreshing(true);
		setError(null);

		try {
			const result = await client.fetchPatientData();
			if (!isLatest()) return;
			patientCache.setMany(result);
			setPatients(result);
		} catch (caught) {
			if (!isLatest()) return;
			setError(getErrorMessage(caught));
		} finally {
			if (isLatest()) {
				setLoading(false);
				setRefreshing(false);
			}
		}
	}, []);

	useEffect(() => {
		isMounted.current = true;
		load("initial");
		return () => {
			isMounted.current = false;
		};
	}, [load]);

	return {
		patients,
		loading,
		refreshing,
		error,
		reload: useCallback(() => load("initial"), [load]),
		refresh: useCallback(() => load("refresh"), [load]),
	};
};
