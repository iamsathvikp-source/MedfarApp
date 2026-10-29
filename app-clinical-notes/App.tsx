import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const App = () => (
	<SafeAreaProvider>
		<SafeAreaView style={styles.container} />
	</SafeAreaProvider>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 16,
	},
});

export default App;
