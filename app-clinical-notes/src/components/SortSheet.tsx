import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import {
	Animated,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, spacing } from "../theme";

interface Option<K extends string> {
	key: K;
	label: string;
}

interface Props<K extends string> {
	visible: boolean;
	options: Option<K>[];
	selected: K;
	onSelect: (key: K) => void;
	onClose: () => void;
}

const SHEET_OFFSCREEN = 400;

const SortSheet = <K extends string>({
	visible,
	options,
	selected,
	onSelect,
	onClose,
}: Props<K>) => {
	const insets = useSafeAreaInsets();
	const translateY = useRef(new Animated.Value(SHEET_OFFSCREEN)).current;

	useEffect(() => {
		if (visible) {
			translateY.setValue(SHEET_OFFSCREEN);
			Animated.spring(translateY, {
				toValue: 0,
				useNativeDriver: true,
				bounciness: 0,
			}).start();
		}
	}, [visible, translateY]);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				style={styles.backdrop}
				onPress={onClose}
				accessibilityLabel="Close sort options"
			/>
			<Animated.View
				style={[
					styles.sheet,
					{
						paddingBottom: spacing.lg + insets.bottom,
						transform: [{ translateY }],
					},
				]}
			>
				<View style={styles.handle} />
				<Text style={styles.title} accessibilityRole="header">
					Sort by
				</Text>
				{options.map(({ key, label }) => {
					const isSelected = key === selected;
					return (
						<Pressable
							key={key}
							accessibilityRole="radio"
							accessibilityState={{ checked: isSelected }}
							onPress={() => {
								onSelect(key);
								onClose();
							}}
							style={({ pressed }) => [
								styles.option,
								pressed && styles.optionPressed,
							]}
						>
							<Text
								style={[
									styles.optionText,
									isSelected && styles.optionTextSelected,
								]}
							>
								{label}
							</Text>
							{isSelected && (
								<Ionicons name="checkmark" size={22} color={colors.primary} />
							)}
						</Pressable>
					);
				})}
			</Animated.View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.35)",
	},
	sheet: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.card,
		borderTopLeftRadius: radius.card * 2,
		borderTopRightRadius: radius.card * 2,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.sm,
	},
	handle: {
		alignSelf: "center",
		width: 36,
		height: 5,
		borderRadius: radius.pill,
		backgroundColor: colors.border,
		marginBottom: spacing.md,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: colors.text,
		marginBottom: spacing.sm,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		minHeight: 48,
		paddingHorizontal: spacing.sm,
		borderRadius: radius.card,
	},
	optionPressed: {
		backgroundColor: colors.chipBackground,
	},
	optionText: {
		fontSize: 16,
		color: colors.text,
	},
	optionTextSelected: {
		color: colors.primary,
		fontWeight: "600",
	},
});

export default SortSheet;
