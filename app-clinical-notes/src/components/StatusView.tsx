import type { FC } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";
import Button from "./Button";

interface Props {
	loading?: boolean;
	title?: string;
	message?: string;
	onRetry?: () => void;
}

const StatusView: FC<Props> = ({ loading = false, title, message, onRetry }) => (
	<View style={styles.container} accessibilityLiveRegion="polite">
		{loading && <ActivityIndicator size="large" color={colors.primary} />}
		{title && <Text style={styles.title}>{title}</Text>}
		{message && <Text style={styles.message}>{message}</Text>}
		{onRetry && !loading && (
			<Button title="Try again" onPress={onRetry} style={styles.button} />
		)}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.xl,
		gap: spacing.md,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.text,
		textAlign: "center",
	},
	message: {
		fontSize: 15,
		color: colors.textMuted,
		textAlign: "center",
	},
	button: {
		alignSelf: "stretch",
		marginTop: spacing.sm,
	},
});

export default StatusView;
