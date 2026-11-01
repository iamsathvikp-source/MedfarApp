import { useCallback, useEffect, useRef, useState } from "react";

import client from "../client";
import type { ClinicalNote, PatientData } from "../data";
import { getErrorMessage } from "../utils/errors";
import { patientCache } from "./patientCache";

type LoadMode = "initial" | "refresh" | "silent";

export interface UsePatientResult {
	patient: PatientData | null;
	loading: boolean;
	refreshing: boolean;
	error: string | null;
	reload: () => void;
	refresh: () => void;
	refreshSilently: () => void;
	addNoteLocally: (note: ClinicalNote) => void;
}

export const usePatient = (patientId: string): UsePatientResult => {
	const [patient, setPatient] = useState<PatientData | null>(
		() => patientCache.get(patientId) ?? null,
	);
	const [loading, setLoading] = useState(() => !patientCache.get(patientId));
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
		if (mode !== "silent") setError(null);

		try {
			const patients = await client.fetchPatientData();
			if (!isLatest()) return;

			const found = patients.find(({ id }) => id === patientId);
			if (found) {
				patientCache.set(found);
				setPatient(found);
				setError(null);
			} else {
				setError("No patient record was found.");
			}
		} catch (caught) {
			if (!isLatest()) return;
			if (mode !== "silent") setError(getErrorMessage(caught));
		} finally {
			if (isLatest()) {
				setLoading(false);
				setRefreshing(false);
			}
		}
	}, [patientId]);

	useEffect(() => {
		isMounted.current = true;
		load(patientCache.get(patientId) ? "silent" : "initial");
		return () => {
			isMounted.current = false;
		};
	}, [load, patientId]);

	const addNoteLocally = useCallback((note: ClinicalNote) => {
		setPatient((current) => {
			if (!current) return current;
			const next = {
				...current,
				clinicalNotes: [...current.clinicalNotes, note],
			};
			patientCache.set(next);
			return next;
		});
	}, []);

	return {
		patient,
		loading,
		refreshing,
		error,
		reload: useCallback(() => load("initial"), [load]),
		refresh: useCallback(() => load("refresh"), [load]),
		refreshSilently: useCallback(() => load("silent"), [load]),
		addNoteLocally,
	};
};
