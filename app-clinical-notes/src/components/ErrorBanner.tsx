import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface Props {
	message: string;
	actionLabel?: string;
	onAction?: () => void;
}

const ErrorBanner: FC<Props> = ({ message, actionLabel, onAction }) => (
	<View style={styles.banner} accessibilityRole="alert">
		<Text style={styles.message}>{message}</Text>
		{actionLabel && onAction && (
			<Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
				<Text style={styles.action}>{actionLabel}</Text>
			</Pressable>
		)}
	</View>
);

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		backgroundColor: colors.dangerBackground,
		borderRadius: radius.card,
		padding: spacing.md,
		marginBottom: spacing.md,
	},
	message: {
		flex: 1,
		color: colors.danger,
		fontSize: 14,
	},
	action: {
		color: colors.danger,
		fontWeight: "700",
		fontSize: 14,
	},
});

export default ErrorBanner;
