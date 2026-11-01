import type { FC } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface Props {
	onBack?: () => void;
}

const Header: FC<Props> = ({ onBack }) => {
	return (
		<View style={styles.header}>
			{onBack && (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Back to patients"
					onPress={onBack}
					hitSlop={8}
					style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
				>
					<Text style={styles.backText}>‹ Patients</Text>
				</Pressable>
			)}
			<Text style={styles.title} accessibilityRole="header">
				Health Clinic
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		backgroundColor: "#007bff",
		padding: 16,
		alignItems: "center",
	},
	title: {
		color: "#fff",
		fontSize: 24,
	},
	back: {
		position: "absolute",
		left: 16,
		top: 0,
		bottom: 0,
		justifyContent: "center",
	},
	backPressed: {
		opacity: 0.5,
	},
	backText: {
		color: "#fff",
		fontSize: 17,
	},
});

export default Header;
