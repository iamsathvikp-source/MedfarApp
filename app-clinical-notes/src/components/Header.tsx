import type { FC } from "react";
import { View, Text, StyleSheet } from "react-native";

const Header: FC = () => {
	return (
		<View style={styles.header}>
			<Text style={styles.title}>Health Clinic</Text>
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
});

export default Header;
