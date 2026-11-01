import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Header from "./src/components/Header";
import { NoteTypesProvider } from "./src/hooks/NoteTypesContext";
import type { RootStackParamList } from "./src/navigation";
import PatientListScreen from "./src/screens/PatientListScreen";
import PatientOverviewScreen from "./src/screens/PatientOverviewScreen";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => (
	<SafeAreaProvider>
		<StatusBar style="light" />
		<NoteTypesProvider>
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={{
						header: ({ navigation, back }) => (
							<SafeAreaView style={styles.top} edges={["top"]}>
								<Header onBack={back ? navigation.goBack : undefined} />
							</SafeAreaView>
						),
						contentStyle: styles.body,
					}}
				>
					<Stack.Screen name="PatientList" component={PatientListScreen} />
					<Stack.Screen
						name="PatientOverview"
						component={PatientOverviewScreen}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</NoteTypesProvider>
	</SafeAreaProvider>
);

const styles = StyleSheet.create({
	top: {
		backgroundColor: colors.primary,
	},
	body: {
		backgroundColor: colors.background,
	},
});

export default App;
