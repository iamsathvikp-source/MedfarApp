import type { FC } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "../theme";

interface Props {
	label: string;
	selected: boolean;
	onPress: () => void;
}

const Chip: FC<Props> = ({ label, selected, onPress }) => (
	<Pressable
		accessibilityRole="button"
		accessibilityState={{ selected }}
		onPress={onPress}
		style={[styles.chip, selected && styles.chipSelected]}
	>
		<Text style={[styles.chipText, selected && styles.chipTextSelected]}>
			{label}
		</Text>
	</Pressable>
);

const styles = StyleSheet.create({
	chip: {
		borderRadius: radius.pill,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.card,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	chipSelected: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	chipText: {
		color: colors.text,
		fontSize: 13,
	},
	chipTextSelected: {
		color: colors.white,
		fontWeight: "600",
	},
});

export default Chip;
