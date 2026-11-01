import DateTimePicker, {
	DateTimePickerAndroid,
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useRef, useState, type FC } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import type { ClinicalNote, ClinicalNoteType } from "../data";
import { useSaveClinicalNote } from "../hooks/useSaveClinicalNote";
import { colors, radius, spacing } from "../theme";
import { buildClinicalNote, generateId } from "../utils/clinicalNote";
import { formatDate, parseISODate, toISODate, todayISO } from "../utils/date";
import {
	hasErrors,
	MAX_NOTE_LENGTH,
	validateNote,
	type NoteErrors,
	type NoteField,
} from "../utils/validateNote";
import Button from "./Button";
import ErrorBanner from "./ErrorBanner";

interface Props {
	visible: boolean;
	onClose: () => void;
	patientId: string;
	noteTypes: ClinicalNoteType[];
	onSaved: (note: ClinicalNote) => void;
	noteTypesLoading?: boolean;
	noteTypesError?: string | null;
	onRetryNoteTypes?: () => void;
}

const AddNoteModal: FC<Props> = ({
	visible,
	onClose,
	patientId,
	noteTypes,
	onSaved,
	noteTypesLoading = false,
	noteTypesError = null,
	onRetryNoteTypes,
}) => {
	const [typeId, setTypeId] = useState<string | null>(null);
	const [date, setDate] = useState(todayISO());
	const [text, setText] = useState("");
	const [errors, setErrors] = useState<NoteErrors>({});
	const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);

	const noteId = useRef(generateId());
	const { save, saving, error: saveError, clearError } = useSaveClinicalNote();

	useEffect(() => {
		if (visible) {
			setTypeId(null);
			setDate(todayISO());
			setText("");
			setErrors({});
			setShowIOSDatePicker(false);
			clearError();
			noteId.current = generateId();
		}
	}, [visible, clearError]);

	const clearFieldError = (field: NoteField) => {
		setErrors((current) => {
			if (!current[field]) return current;
			const next = { ...current };
			delete next[field];
			return next;
		});
	};

	const handleCancel = () => {
		if (saving) return;

		if (text.trim().length === 0) {
			onClose();
			return;
		}

		Alert.alert("Discard this note?", "The text you typed will be lost.", [
			{ text: "Keep editing", style: "cancel" },
			{ text: "Discard", style: "destructive", onPress: onClose },
		]);
	};

	const handleSubmit = async () => {
		const draft = { typeId, date, text };
		const validationErrors = validateNote(draft);
		setErrors(validationErrors);
		if (hasErrors(validationErrors)) return;

		const note = buildClinicalNote(draft, noteTypes, noteId.current);
		if (!note) {
			setErrors({ typeId: "Please choose a note type." });
			return;
		}

		const saved = await save(patientId, note);
		if (saved) onSaved(note);
	};

	const today = todayISO();
	const typesReady = !noteTypesLoading && !noteTypesError;
	const selectedDate = parseISODate(date) ?? new Date();
	const maximumDate = parseISODate(today) ?? new Date();

	const handleDateChange = (event: DateTimePickerEvent, picked?: Date) => {
		if (event.type === "set" && picked) {
			setDate(toISODate(picked));
			clearFieldError("date");
		}
	};

	const openDatePicker = () => {
		if (saving) return;

		if (Platform.OS === "android") {
			DateTimePickerAndroid.open({
				value: selectedDate,
				mode: "date",
				maximumDate,
				onChange: handleDateChange,
			});
		} else {
			setShowIOSDatePicker((visibleNow) => !visibleNow);
		}
	};

	const renderNoteTypeField = () => {
		if (noteTypesLoading) {
			return (
				<View
					style={[styles.pickerBox, styles.pickerPlaceholder, styles.pickerLoading]}
				>
					<ActivityIndicator color={colors.primary} />
					<Text style={styles.hint}>Loading note types…</Text>
				</View>
			);
		}

		if (noteTypesError) {
			return (
				<View style={styles.pickerPlaceholder}>
					<ErrorBanner
						message={noteTypesError}
						actionLabel="Try again"
						onAction={onRetryNoteTypes}
					/>
				</View>
			);
		}

		return (
			<View style={[styles.pickerBox, errors.typeId && styles.inputError]}>
				<Picker
					testID="note-type-picker"
					accessibilityLabel="Note type"
					selectedValue={typeId ?? ""}
					onValueChange={(value) => {
						setTypeId(value ? String(value) : null);
						clearFieldError("typeId");
					}}
					mode="dropdown"
					enabled={!saving}
					itemStyle={styles.pickerItem}
				>
					<Picker.Item
						label="Select a note type…"
						value=""
						color={colors.textMuted}
					/>
					{noteTypes.map((type) => (
						<Picker.Item key={type.id} label={type.name} value={type.id} />
					))}
				</Picker>
			</View>
		);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			onRequestClose={handleCancel}
		>
			<SafeAreaProvider>
				<SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
					<KeyboardAvoidingView
						style={styles.flex}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
					>
						<View style={styles.titleBar}>
							<Text style={styles.title} accessibilityRole="header">
								Add New Clinical Note
							</Text>
						</View>

						<ScrollView
							style={styles.flex}
							contentContainerStyle={styles.content}
							keyboardShouldPersistTaps="handled"
						>
							{saveError && (
								<ErrorBanner
									message={`${saveError} Your note has not been lost.`}
								/>
							)}

							<Text style={styles.label}>Patient ID</Text>
							<View style={styles.readOnly}>
								<Text style={styles.readOnlyText} selectable>
									{patientId}
								</Text>
							</View>

							<Text style={styles.label}>Note Type</Text>
							{renderNoteTypeField()}
							{errors.typeId && (
								<Text style={styles.errorText}>{errors.typeId}</Text>
							)}

							<Text style={styles.label}>Date</Text>
							<Pressable
								testID="note-date-field"
								accessibilityRole="button"
								accessibilityLabel={`Note date, ${formatDate(date)}. Tap to change.`}
								onPress={openDatePicker}
								disabled={saving}
								style={[styles.input, styles.dateField, errors.date && styles.inputError]}
							>
								<Text style={styles.dateText}>
									{date ? formatDate(date) : "Select date"}
								</Text>
								<Text style={styles.link}>
									{showIOSDatePicker ? "Done" : "Change"}
								</Text>
							</Pressable>
							{Platform.OS === "ios" && showIOSDatePicker && (
								<DateTimePicker
									value={selectedDate}
									mode="date"
									display="spinner"
									maximumDate={maximumDate}
									onChange={handleDateChange}
								/>
							)}
							{errors.date && (
								<Text style={styles.errorText}>{errors.date}</Text>
							)}

							<Text style={styles.label}>Note Text</Text>
							<TextInput
								testID="note-text-input"
								accessibilityLabel="Note text"
								style={[
									styles.input,
									styles.textArea,
									errors.text && styles.inputError,
								]}
								value={text}
								onChangeText={(value) => {
									setText(value);
									clearFieldError("text");
								}}
								placeholder="Write the clinical note…"
								placeholderTextColor={colors.textMuted}
								multiline
								textAlignVertical="top"
								maxLength={MAX_NOTE_LENGTH}
								editable={!saving}
							/>
							<View style={styles.counterRow}>
								{errors.text ? (
									<Text style={styles.errorText}>{errors.text}</Text>
								) : (
									<View />
								)}
								<Text style={styles.hint}>
									{text.length}/{MAX_NOTE_LENGTH}
								</Text>
							</View>
						</ScrollView>

						<View style={styles.footer}>
							<Button
								testID="add-note-submit"
								title={Platform.OS === "android" ? "ADD NOTE" : "Add Note"}
								variant={Platform.OS === "android" ? "primary" : "text"}
								onPress={handleSubmit}
								loading={saving}
								disabled={!typesReady}
							/>
							<Button
								title="Cancel"
								variant="text"
								onPress={handleCancel}
								disabled={saving}
							/>
						</View>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</SafeAreaProvider>
		</Modal>
	);
};

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	titleBar: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.lg,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.border,
		backgroundColor: colors.card,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		color: colors.text,
		textAlign: "center",
	},
	content: {
		padding: spacing.lg,
		paddingBottom: spacing.xl,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.text,
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
	},
	readOnly: {
		backgroundColor: colors.border,
		borderRadius: radius.card,
		padding: spacing.md,
	},
	readOnlyText: {
		color: colors.textMuted,
		fontSize: 14,
	},
	pickerBox: {
		backgroundColor: colors.card,
		borderRadius: radius.card,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: "hidden",
	},
	pickerItem: {
		fontSize: 17,
		color: colors.text,
	},
	pickerPlaceholder: {
		minHeight: Platform.OS === "ios" ? 216 : 56,
		justifyContent: "center",
	},
	pickerLoading: {
		alignItems: "center",
		gap: spacing.sm,
	},
	input: {
		backgroundColor: colors.card,
		borderRadius: radius.card,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		fontSize: 16,
		color: colors.text,
	},
	inputError: {
		borderColor: colors.danger,
	},
	dateField: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	dateText: {
		fontSize: 16,
		color: colors.text,
	},
	textArea: {
		minHeight: 140,
	},
	counterRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginTop: spacing.xs,
		gap: spacing.sm,
	},
	hint: {
		fontSize: 13,
		color: colors.textMuted,
	},
	link: {
		fontSize: 13,
		color: colors.primary,
		fontWeight: "600",
	},
	errorText: {
		flexShrink: 1,
		fontSize: 13,
		color: colors.danger,
		marginTop: spacing.xs,
	},
	footer: {
		gap: spacing.xs,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.border,
		backgroundColor: colors.card,
	},
});

export default AddNoteModal;
