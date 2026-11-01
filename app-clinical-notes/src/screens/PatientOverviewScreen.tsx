import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState, type FC } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddNoteModal from "../components/AddNoteModal";
import Button from "../components/Button";
import ClinicalNote from "../components/ClinicalNote";
import ErrorBanner from "../components/ErrorBanner";
import NoteTypeFilter from "../components/NoteTypeFilter";
import PatientInfo from "../components/PatientInfo";
import StatusView from "../components/StatusView";
import type { ClinicalNote as ClinicalNoteData } from "../data";
import { useSharedNoteTypes } from "../hooks/NoteTypesContext";
import { usePatient } from "../hooks/usePatient";
import type { RootStackParamList } from "../navigation";
import { colors, spacing } from "../theme";
import {
	countNotesByType,
	filterNotesByType,
	sortNotesNewestFirst,
} from "../utils/notes";

type Props = NativeStackScreenProps<RootStackParamList, "PatientOverview">;

const PatientOverviewScreen: FC<Props> = ({ route }) => {
	const insets = useSafeAreaInsets();
	const {
		patient,
		loading,
		refreshing,
		error,
		reload,
		refresh,
		refreshSilently,
		addNoteLocally,
	} = usePatient(route.params.patientId);
	const noteTypes = useSharedNoteTypes();

	const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
	const [isModalVisible, setModalVisible] = useState(false);

	const allNotes = useMemo(
		() => sortNotesNewestFirst(patient?.clinicalNotes ?? []),
		[patient?.clinicalNotes],
	);
	const visibleNotes = useMemo(
		() => filterNotesByType(allNotes, selectedTypeId),
		[allNotes, selectedTypeId],
	);
	const filterOptions = useMemo(() => countNotesByType(allNotes), [allNotes]);

	const openModal = useCallback(() => setModalVisible(true), []);
	const closeModal = useCallback(() => setModalVisible(false), []);

	const handleNoteSaved = useCallback(
		(note: ClinicalNoteData) => {
			setModalVisible(false);
			addNoteLocally(note);
			setSelectedTypeId(null);
			refreshSilently();
		},
		[addNoteLocally, refreshSilently],
	);

	const renderNote = useCallback(
		({ item }: { item: ClinicalNoteData }) => <ClinicalNote note={item} />,
		[],
	);

	if (!patient) {
		if (loading) {
			return <StatusView loading message="Loading patient information…" />;
		}
		return (
			<StatusView
				title="Couldn't load the patient"
				message={error ?? "Something went wrong."}
				onRetry={reload}
			/>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={visibleNotes}
				keyExtractor={(note) => note.id}
				renderItem={renderNote}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: spacing.xl + insets.bottom },
				]}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={refresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
				ListHeaderComponent={
					<>
						{error && (
							<ErrorBanner
								message={`${error} Showing the last loaded data.`}
								actionLabel="Retry"
								onAction={refresh}
							/>
						)}
						<PatientInfo patient={patient} />
						<Text style={styles.sectionTitle} accessibilityRole="header">
							Clinical Notes
						</Text>
						{allNotes.length > 0 && (
							<NoteTypeFilter
								options={filterOptions}
								totalCount={allNotes.length}
								selectedTypeId={selectedTypeId}
								onChange={setSelectedTypeId}
							/>
						)}
					</>
				}
				ListEmptyComponent={
					<Text style={styles.empty}>
						{allNotes.length === 0
							? "No clinical notes yet."
							: "No notes of this type."}
					</Text>
				}
				ListFooterComponent={
					<Button
						testID="open-add-note"
						title="Add New Clinical Note"
						onPress={openModal}
						style={styles.addButton}
					/>
				}
			/>

			<AddNoteModal
				visible={isModalVisible}
				onClose={closeModal}
				patientId={patient.id}
				noteTypes={noteTypes.noteTypes}
				noteTypesLoading={noteTypes.loading}
				noteTypesError={noteTypes.error}
				onRetryNoteTypes={noteTypes.reload}
				onSaved={handleNoteSaved}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: spacing.lg,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: colors.text,
		marginBottom: spacing.md,
	},
	empty: {
		textAlign: "center",
		color: colors.textMuted,
		paddingVertical: spacing.xl,
	},
	addButton: {
		marginTop: spacing.md,
	},
});

export default PatientOverviewScreen;
