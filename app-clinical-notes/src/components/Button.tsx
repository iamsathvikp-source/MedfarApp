import type { FC } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	type StyleProp,
	type ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "../theme";

interface Props {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "text";
	disabled?: boolean;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const Button: FC<Props> = ({
	title,
	onPress,
	variant = "primary",
	disabled = false,
	loading = false,
	style,
	testID,
}) => {
	const look = variants[variant];
	const isDisabled = disabled || loading;

	return (
		<Pressable
			testID={testID}
			accessibilityRole="button"
			accessibilityState={{ disabled: isDisabled, busy: loading }}
			onPress={onPress}
			disabled={isDisabled}
			style={({ pressed }) => [
				styles.base,
				look.container,
				pressed && look.pressed,
				isDisabled && styles.disabled,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator color={look.labelColor} />
			) : (
				<Text style={[styles.label, { color: look.labelColor }]}>{title}</Text>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	base: {
		minHeight: 48,
		borderRadius: radius.card,
		paddingHorizontal: spacing.lg,
		alignItems: "center",
		justifyContent: "center",
	},
	primary: {
		backgroundColor: colors.primary,
	},
	primaryPressed: {
		backgroundColor: colors.primaryPressed,
	},
	secondary: {
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	secondaryPressed: {
		backgroundColor: colors.chipBackground,
	},
	textPressed: {
		opacity: 0.5,
	},
	disabled: {
		opacity: 0.5,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
	},
});

const variants: Record<
	NonNullable<Props["variant"]>,
	{ container?: ViewStyle; pressed: ViewStyle; labelColor: string }
> = {
	primary: {
		container: styles.primary,
		pressed: styles.primaryPressed,
		labelColor: colors.white,
	},
	secondary: {
		container: styles.secondary,
		pressed: styles.secondaryPressed,
		labelColor: colors.primary,
	},
	text: {
		pressed: styles.textPressed,
		labelColor: colors.primary,
	},
};

export default Button;
