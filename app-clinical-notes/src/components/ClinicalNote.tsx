import { memo, type FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ClinicalNote as ClinicalNoteType } from "../data";
import { colors, radius, spacing } from "../theme";
import { formatDate } from "../utils/date";

interface Props {
	note: ClinicalNoteType;
}

const ClinicalNote: FC<Props> = ({ note }) => {
	const date = formatDate(note.date);

	return (
		<View
			style={styles.card}
			accessible
			accessibilityLabel={`${note.type.name}, ${date}. ${note.noteText}`}
		>
			<View style={styles.topRow}>
				<View style={styles.typePill}>
					<Text style={styles.typeText}>{note.type.name}</Text>
				</View>
				<Text style={styles.date}>{date}</Text>
			</View>

			<Text style={styles.text}>{note.noteText}</Text>

			<Text style={styles.id} selectable>
				ID: {note.id}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.card,
		borderRadius: radius.card,
		padding: spacing.lg,
		marginBottom: spacing.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	typePill: {
		backgroundColor: colors.chipBackground,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		flexShrink: 1,
	},
	typeText: {
		color: colors.primary,
		fontWeight: "600",
		fontSize: 13,
	},
	date: {
		color: colors.textMuted,
		fontSize: 13,
	},
	text: {
		color: colors.text,
		fontSize: 15,
		lineHeight: 21,
	},
	id: {
		marginTop: spacing.sm,
		color: colors.textMuted,
		fontSize: 11,
	},
});

export default memo(ClinicalNote);
