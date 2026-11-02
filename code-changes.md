# Code changes: app-clinical-notes

Everything changed since the initial commit (`186b684`), up to and including commit `feb331d` ("submit final code for review") on branch `TEST-SATHVIK`, plus uncommitted edits to README.md and the new SOLUTION.md.

## Project context

- Expo SDK 57 / React Native 0.86 / React 19 app written in TypeScript, using React Navigation native-stack.
- `src/data/index.tsx` is a mock API client backed by AsyncStorage. Its `randomFuzz()` adds a random 0–3 s delay and fails about 1 in 6 calls on purpose.
- Tests: `npx jest` (jest-expo preset); 7 suites, 60 tests, all passing. Type-check: `npx tsc --noEmit` is clean.
- Left out on purpose: `app-clinical-notes/lib/` (compiled from `src/data` by `npm run build:lib`) and `package-lock.json`.

## Files changed

```
 app-clinical-notes/App.tsx                               |  42 +++++-
 app-clinical-notes/README.md                             |  50 ++++---
 app-clinical-notes/app.json                              |  69 ++++-----
 app-clinical-notes/package.json                          |  78 +++++-----
 app-clinical-notes/src/components/AddNoteModal.tsx       | 434 ++++++++++++++++++++++++++++++++++++++++++++++++++++-
 app-clinical-notes/src/components/Button.tsx             | 113 ++++++++++++++
 app-clinical-notes/src/components/Chip.tsx               |  48 ++++++
 app-clinical-notes/src/components/ClinicalNote.tsx       |  78 +++++++++-
 app-clinical-notes/src/components/ErrorBanner.tsx        |  45 ++++++
 app-clinical-notes/src/components/Header.tsx             |  37 ++++-
 app-clinical-notes/src/components/NoteTypeFilter.tsx     |  49 ++++++
 app-clinical-notes/src/components/PatientInfo.tsx        | 120 ++++++++++++++-
 app-clinical-notes/src/components/SortSheet.tsx          | 166 +++++++++++++++++++++
 app-clinical-notes/src/components/StatusView.tsx         |  50 +++++++
 app-clinical-notes/src/data/index.test.ts                |  33 ++++-
 app-clinical-notes/src/data/index.tsx                    |  42 ++++--
 app-clinical-notes/src/data/patients.ts                  | 443 ++++++++++++++++++++++++++++++++++++++++++++++++++++++-
 app-clinical-notes/src/hooks/NoteTypesContext.tsx        |  19 +++
 app-clinical-notes/src/hooks/patientCache.ts             |  13 ++
 app-clinical-notes/src/hooks/useNoteTypes.ts             |  51 +++++++
 app-clinical-notes/src/hooks/usePatient.ts               |  94 ++++++++++++
 app-clinical-notes/src/hooks/usePatients.ts              |  71 +++++++++
 app-clinical-notes/src/hooks/useSaveClinicalNote.ts      |  53 +++++++
 app-clinical-notes/src/navigation.ts                     |   4 +
 app-clinical-notes/src/screens/PatientListScreen.tsx     | 402 ++++++++++++++++++++++++++++++++++++++++++++++++++
 app-clinical-notes/src/screens/PatientOverviewScreen.tsx | 179 ++++++++++++++++++++++
 app-clinical-notes/src/theme.ts                          |  26 ++++
 app-clinical-notes/src/utils/clinicalNote.test.ts        |  33 +++++
 app-clinical-notes/src/utils/clinicalNote.ts             |  28 ++++
 app-clinical-notes/src/utils/date.test.ts                |  51 +++++++
 app-clinical-notes/src/utils/date.ts                     |  41 +++++
 app-clinical-notes/src/utils/errors.test.ts              |  15 ++
 app-clinical-notes/src/utils/errors.ts                   |   7 +
 app-clinical-notes/src/utils/notes.test.ts               |  64 ++++++++
 app-clinical-notes/src/utils/notes.ts                    |  32 ++++
 app-clinical-notes/src/utils/patients.test.ts            | 120 +++++++++++++++
 app-clinical-notes/src/utils/patients.ts                 |  58 ++++++++
 app-clinical-notes/src/utils/validateNote.test.ts        |  52 +++++++
 app-clinical-notes/src/utils/validateNote.ts             |  42 ++++++
 39 files changed, 3221 insertions(+), 131 deletions(-)
SOLUTION.md (new, uncommitted)
```

## Unified diff

New files appear as all-added hunks (`--- /dev/null`).

````diff
diff --git a/app-clinical-notes/App.tsx b/app-clinical-notes/App.tsx
index 2d4fc7b..8918e78 100644
--- a/app-clinical-notes/App.tsx
+++ b/app-clinical-notes/App.tsx
@@ -1,18 +1,50 @@
+import { NavigationContainer } from "@react-navigation/native";
+import { createNativeStackNavigator } from "@react-navigation/native-stack";
+import { StatusBar } from "expo-status-bar";
 import { StyleSheet } from "react-native";
 import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
 
+import Header from "./src/components/Header";
+import { NoteTypesProvider } from "./src/hooks/NoteTypesContext";
+import type { RootStackParamList } from "./src/navigation";
+import PatientListScreen from "./src/screens/PatientListScreen";
+import PatientOverviewScreen from "./src/screens/PatientOverviewScreen";
+import { colors } from "./src/theme";
+
+const Stack = createNativeStackNavigator<RootStackParamList>();
+
 const App = () => (
 	<SafeAreaProvider>
-		<SafeAreaView style={styles.container} />
+		<StatusBar style="light" />
+		<NoteTypesProvider>
+			<NavigationContainer>
+				<Stack.Navigator
+					screenOptions={{
+						header: ({ navigation, back }) => (
+							<SafeAreaView style={styles.top} edges={["top"]}>
+								<Header onBack={back ? navigation.goBack : undefined} />
+							</SafeAreaView>
+						),
+						contentStyle: styles.body,
+					}}
+				>
+					<Stack.Screen name="PatientList" component={PatientListScreen} />
+					<Stack.Screen
+						name="PatientOverview"
+						component={PatientOverviewScreen}
+					/>
+				</Stack.Navigator>
+			</NavigationContainer>
+		</NoteTypesProvider>
 	</SafeAreaProvider>
 );
 
 const styles = StyleSheet.create({
-	container: {
-		flex: 1,
+	top: {
+		backgroundColor: colors.primary,
 	},
-	content: {
-		padding: 16,
+	body: {
+		backgroundColor: colors.background,
 	},
 });
 
diff --git a/app-clinical-notes/README.md b/app-clinical-notes/README.md
index cd04dbc..ff75cd5 100644
--- a/app-clinical-notes/README.md
+++ b/app-clinical-notes/README.md
@@ -1,6 +1,8 @@
 # app-clinical-notes
 
-Starter React Native project for the Medfar Mobile Coding Challenge. The challenge instructions, goals and delivery steps are in the [root readme](../readme.md).
+React Native app for the Medfar Mobile Coding Challenge. The challenge instructions are in the [root readme](../readme.md).
+
+> **Solution notes:** what existed, what changed and why, and the main decisions are in [SOLUTION.md](../SOLUTION.md). Every changed file also starts with a STARTER / ADDED / UPDATED comment block.
 
 ## Tech stack
 
@@ -8,6 +10,8 @@ Starter React Native project for the Medfar Mobile Coding Challenge. The challen
 - React Navigation (native stack)
 - Async Storage (used by the mock data client to persist data)
 - `@react-native-picker/picker`
+- `@react-native-community/datetimepicker` (added for the native date picker)
+- `@expo/vector-icons` (added for the search and sort icons)
 - Jest with the `jest-expo` preset
 
 ## Getting started
@@ -37,24 +41,34 @@ From the Expo CLI you can open the app in the iOS Simulator (`i`), an Android em
 
 ```
 app-clinical-notes/
-├── App.tsx                  # App entry component
-├── app.json                 # Expo configuration
-├── assets/                  # Icons and images
-├── lib/                     # Compiled mock data client, for use in your own setup
+├── App.tsx                        # Stack navigator under the Header, safe areas
+├── app.json                       # Expo configuration
+├── assets/                        # Icons and images
+├── lib/                           # Compiled mock data client (regenerated)
 └── src/
-    ├── client/
-    │   └── index.ts         # Ready-to-use instance of the mock data client
-    ├── components/          # Starter components
-    │   ├── Header.tsx       # "Health Clinic" title bar
-    │   ├── PatientInfo.tsx  # Patient information and discharge summary
-    │   ├── ClinicalNote.tsx # A single clinical note card
-    │   └── AddNoteModal.tsx # Add New Clinical Note modal
-    └── data/                # Mock data client source
-        ├── index.tsx        # Client class and data types
-        ├── patients.ts      # Seed patient data
-        ├── noteType.ts      # Seed clinical note types
-        ├── index.test.ts    # Client unit tests
-        └── __mocks__/       # Async Storage mock for Jest
+    ├── client/index.ts            # Ready-to-use client instance
+    ├── navigation.ts              # Route names and params
+    ├── screens/
+    │   ├── PatientListScreen.tsx      # Extra: search, sort, 10 per page
+    │   └── PatientOverviewScreen.tsx  # The brief's screen: states, list, modal
+    ├── hooks/                     # Data fetching (components never call the client)
+    │   ├── usePatients.ts         # All patients in one request
+    │   ├── usePatient.ts
+    │   ├── patientCache.ts        # Last known copy of each patient
+    │   ├── useNoteTypes.ts
+    │   ├── NoteTypesContext.tsx   # Note types loaded once at app start
+    │   └── useSaveClinicalNote.ts
+    ├── components/
+    │   ├── Header.tsx             # "Health Clinic" title bar (+ back button)
+    │   ├── PatientInfo.tsx        # Patient info + discharge summary card
+    │   ├── ClinicalNote.tsx       # One clinical note card
+    │   ├── NoteTypeFilter.tsx     # Filter chips
+    │   ├── AddNoteModal.tsx       # Add New Clinical Note form
+    │   ├── Button.tsx, Chip.tsx, SortSheet.tsx, StatusView.tsx, ErrorBanner.tsx
+    ├── utils/                     # Pure logic + unit tests
+    │   ├── date.ts, notes.ts, patients.ts, validateNote.ts, clinicalNote.ts, errors.ts
+    ├── theme.ts                   # Colors and spacing
+    └── data/                      # Mock data client source (+ tests)
 ```
 
 ## Mock data client
diff --git a/app-clinical-notes/app.json b/app-clinical-notes/app.json
index d517c04..a9d1448 100644
--- a/app-clinical-notes/app.json
+++ b/app-clinical-notes/app.json
@@ -1,35 +1,38 @@
 {
-	"expo": {
-		"name": "app-clinical-notes",
-		"slug": "app-clinical-notes",
-		"version": "1.0.0",
-		"orientation": "portrait",
-		"icon": "./assets/icon.png",
-		"userInterfaceStyle": "light",
-		"assetBundlePatterns": ["**/*"],
-		"ios": {
-			"supportsTablet": true
-		},
-		"android": {
-			"adaptiveIcon": {
-				"foregroundImage": "./assets/adaptive-icon.png",
-				"backgroundColor": "#ffffff"
-			}
-		},
-		"web": {
-			"favicon": "./assets/favicon.png"
-		},
-		"plugins": [
-			"expo-status-bar",
-			[
-				"expo-splash-screen",
-				{
-					"image": "./assets/splash.png",
-					"resizeMode": "contain",
-					"backgroundColor": "#ffffff",
-					"imageWidth": 200
-				}
-			]
-		]
-	}
+  "expo": {
+    "name": "app-clinical-notes",
+    "slug": "app-clinical-notes",
+    "version": "1.0.0",
+    "orientation": "portrait",
+    "icon": "./assets/icon.png",
+    "userInterfaceStyle": "light",
+    "assetBundlePatterns": [
+      "**/*"
+    ],
+    "ios": {
+      "supportsTablet": true
+    },
+    "android": {
+      "adaptiveIcon": {
+        "foregroundImage": "./assets/adaptive-icon.png",
+        "backgroundColor": "#ffffff"
+      }
+    },
+    "web": {
+      "favicon": "./assets/favicon.png"
+    },
+    "plugins": [
+      "expo-status-bar",
+      [
+        "expo-splash-screen",
+        {
+          "image": "./assets/splash.png",
+          "resizeMode": "contain",
+          "backgroundColor": "#ffffff",
+          "imageWidth": 200
+        }
+      ],
+      "@react-native-community/datetimepicker"
+    ]
+  }
 }
diff --git a/app-clinical-notes/package.json b/app-clinical-notes/package.json
index a734fec..4eac3ff 100644
--- a/app-clinical-notes/package.json
+++ b/app-clinical-notes/package.json
@@ -1,40 +1,42 @@
 {
-	"name": "app-clinical-notes",
-	"version": "1.0.0",
-	"main": "expo/AppEntry.js",
-	"scripts": {
-		"start": "expo start",
-		"android": "expo start --android",
-		"ios": "expo start --ios",
-		"web": "expo start --web",
-		"test": "jest",
-		"build:lib": "tsc -p src/data/tsconfig.json"
-	},
-	"dependencies": {
-		"@react-native-async-storage/async-storage": "2.2.0",
-		"@react-native-picker/picker": "2.11.4",
-		"@react-navigation/native": "^7.4.1",
-		"@react-navigation/native-stack": "^7.19.2",
-		"expo": "~57.0.24",
-		"expo-splash-screen": "~57.0.9",
-		"expo-status-bar": "~57.0.1",
-		"react": "19.2.3",
-		"react-dom": "19.2.3",
-		"react-native": "0.86.3",
-		"react-native-safe-area-context": "~5.7.0",
-		"react-native-screens": "~4.26.0",
-		"react-native-web": "^0.21.2"
-	},
-	"devDependencies": {
-		"@babel/core": "^7.29.0",
-		"@types/jest": "29.5.14",
-		"@types/react": "~19.2.4",
-		"jest": "~29.7.0",
-		"jest-expo": "^57.0.5",
-		"typescript": "~6.0.3"
-	},
-	"private": true,
-	"jest": {
-		"preset": "jest-expo"
-	}
+  "name": "app-clinical-notes",
+  "version": "1.0.0",
+  "main": "expo/AppEntry.js",
+  "scripts": {
+    "start": "expo start",
+    "android": "expo start --android",
+    "ios": "expo start --ios",
+    "web": "expo start --web",
+    "test": "jest",
+    "build:lib": "tsc -p src/data/tsconfig.json"
+  },
+  "dependencies": {
+    "@expo/vector-icons": "^15.0.2",
+    "@react-native-async-storage/async-storage": "2.2.0",
+    "@react-native-community/datetimepicker": "9.1.0",
+    "@react-native-picker/picker": "2.11.4",
+    "@react-navigation/native": "^7.4.1",
+    "@react-navigation/native-stack": "^7.19.2",
+    "expo": "~57.0.24",
+    "expo-splash-screen": "~57.0.9",
+    "expo-status-bar": "~57.0.1",
+    "react": "19.2.3",
+    "react-dom": "19.2.3",
+    "react-native": "0.86.3",
+    "react-native-safe-area-context": "~5.7.0",
+    "react-native-screens": "~4.26.0",
+    "react-native-web": "^0.21.2"
+  },
+  "devDependencies": {
+    "@babel/core": "^7.29.0",
+    "@types/jest": "29.5.14",
+    "@types/react": "~19.2.4",
+    "jest": "~29.7.0",
+    "jest-expo": "^57.0.5",
+    "typescript": "~6.0.3"
+  },
+  "private": true,
+  "jest": {
+    "preset": "jest-expo"
+  }
 }
diff --git a/app-clinical-notes/src/components/AddNoteModal.tsx b/app-clinical-notes/src/components/AddNoteModal.tsx
index 60aa719..8623d48 100644
--- a/app-clinical-notes/src/components/AddNoteModal.tsx
+++ b/app-clinical-notes/src/components/AddNoteModal.tsx
@@ -1,16 +1,440 @@
-import type { FC } from "react";
-import { Modal } from "react-native";
-import type { ClinicalNoteType } from "../data";
+import DateTimePicker, {
+	DateTimePickerAndroid,
+	type DateTimePickerEvent,
+} from "@react-native-community/datetimepicker";
+import { Picker } from "@react-native-picker/picker";
+import { useEffect, useRef, useState, type FC } from "react";
+import {
+	ActivityIndicator,
+	Alert,
+	KeyboardAvoidingView,
+	Modal,
+	Platform,
+	Pressable,
+	ScrollView,
+	StyleSheet,
+	Text,
+	TextInput,
+	View,
+} from "react-native";
+import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
+
+import type { ClinicalNote, ClinicalNoteType } from "../data";
+import { useSaveClinicalNote } from "../hooks/useSaveClinicalNote";
+import { colors, radius, spacing } from "../theme";
+import { buildClinicalNote, generateId } from "../utils/clinicalNote";
+import { formatDate, parseISODate, toISODate, todayISO } from "../utils/date";
+import {
+	hasErrors,
+	MAX_NOTE_LENGTH,
+	validateNote,
+	type NoteErrors,
+	type NoteField,
+} from "../utils/validateNote";
+import Button from "./Button";
+import ErrorBanner from "./ErrorBanner";
 
 interface Props {
 	visible: boolean;
 	onClose: () => void;
 	patientId: string;
 	noteTypes: ClinicalNoteType[];
+	onSaved: (note: ClinicalNote) => void;
+	noteTypesLoading?: boolean;
+	noteTypesError?: string | null;
+	onRetryNoteTypes?: () => void;
 }
 
-const AddNoteModal: FC<Props> = ({ visible }) => {
-	return <Modal visible={visible} animationType="slide"></Modal>;
+const AddNoteModal: FC<Props> = ({
+	visible,
+	onClose,
+	patientId,
+	noteTypes,
+	onSaved,
+	noteTypesLoading = false,
+	noteTypesError = null,
+	onRetryNoteTypes,
+}) => {
+	const [typeId, setTypeId] = useState<string | null>(null);
+	const [date, setDate] = useState(todayISO());
+	const [text, setText] = useState("");
+	const [errors, setErrors] = useState<NoteErrors>({});
+	const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
+
+	const noteId = useRef(generateId());
+	const { save, saving, error: saveError, clearError } = useSaveClinicalNote();
+
+	useEffect(() => {
+		if (visible) {
+			setTypeId(null);
+			setDate(todayISO());
+			setText("");
+			setErrors({});
+			setShowIOSDatePicker(false);
+			clearError();
+			noteId.current = generateId();
+		}
+	}, [visible, clearError]);
+
+	const clearFieldError = (field: NoteField) => {
+		setErrors((current) => {
+			if (!current[field]) return current;
+			const next = { ...current };
+			delete next[field];
+			return next;
+		});
+	};
+
+	const handleCancel = () => {
+		if (saving) return;
+
+		if (text.trim().length === 0) {
+			onClose();
+			return;
+		}
+
+		Alert.alert("Discard this note?", "The text you typed will be lost.", [
+			{ text: "Keep editing", style: "cancel" },
+			{ text: "Discard", style: "destructive", onPress: onClose },
+		]);
+	};
+
+	const handleSubmit = async () => {
+		const draft = { typeId, date, text };
+		const validationErrors = validateNote(draft);
+		setErrors(validationErrors);
+		if (hasErrors(validationErrors)) return;
+
+		const note = buildClinicalNote(draft, noteTypes, noteId.current);
+		if (!note) {
+			setErrors({ typeId: "Please choose a note type." });
+			return;
+		}
+
+		const saved = await save(patientId, note);
+		if (saved) onSaved(note);
+	};
+
+	const today = todayISO();
+	const typesReady = !noteTypesLoading && !noteTypesError;
+	const selectedDate = parseISODate(date) ?? new Date();
+	const maximumDate = parseISODate(today) ?? new Date();
+
+	const handleDateChange = (event: DateTimePickerEvent, picked?: Date) => {
+		if (event.type === "set" && picked) {
+			setDate(toISODate(picked));
+			clearFieldError("date");
+		}
+	};
+
+	const openDatePicker = () => {
+		if (saving) return;
+
+		if (Platform.OS === "android") {
+			DateTimePickerAndroid.open({
+				value: selectedDate,
+				mode: "date",
+				maximumDate,
+				onChange: handleDateChange,
+			});
+		} else {
+			setShowIOSDatePicker((visibleNow) => !visibleNow);
+		}
+	};
+
+	const renderNoteTypeField = () => {
+		if (noteTypesLoading) {
+			return (
+				<View
+					style={[styles.pickerBox, styles.pickerPlaceholder, styles.pickerLoading]}
+				>
+					<ActivityIndicator color={colors.primary} />
+					<Text style={styles.hint}>Loading note types…</Text>
+				</View>
+			);
+		}
+
+		if (noteTypesError) {
+			return (
+				<View style={styles.pickerPlaceholder}>
+					<ErrorBanner
+						message={noteTypesError}
+						actionLabel="Try again"
+						onAction={onRetryNoteTypes}
+					/>
+				</View>
+			);
+		}
+
+		return (
+			<View style={[styles.pickerBox, errors.typeId && styles.inputError]}>
+				<Picker
+					testID="note-type-picker"
+					accessibilityLabel="Note type"
+					selectedValue={typeId ?? ""}
+					onValueChange={(value) => {
+						setTypeId(value ? String(value) : null);
+						clearFieldError("typeId");
+					}}
+					mode="dropdown"
+					enabled={!saving}
+					itemStyle={styles.pickerItem}
+				>
+					<Picker.Item
+						label="Select a note type…"
+						value=""
+						color={colors.textMuted}
+					/>
+					{noteTypes.map((type) => (
+						<Picker.Item key={type.id} label={type.name} value={type.id} />
+					))}
+				</Picker>
+			</View>
+		);
+	};
+
+	return (
+		<Modal
+			visible={visible}
+			animationType="slide"
+			onRequestClose={handleCancel}
+		>
+			<SafeAreaProvider>
+				<SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
+					<KeyboardAvoidingView
+						style={styles.flex}
+						behavior={Platform.OS === "ios" ? "padding" : "height"}
+					>
+						<View style={styles.titleBar}>
+							<Text style={styles.title} accessibilityRole="header">
+								Add New Clinical Note
+							</Text>
+						</View>
+
+						<ScrollView
+							style={styles.flex}
+							contentContainerStyle={styles.content}
+							keyboardShouldPersistTaps="handled"
+						>
+							{saveError && (
+								<ErrorBanner
+									message={`${saveError} Your note has not been lost.`}
+								/>
+							)}
+
+							<Text style={styles.label}>Patient ID</Text>
+							<View style={styles.readOnly}>
+								<Text style={styles.readOnlyText} selectable>
+									{patientId}
+								</Text>
+							</View>
+
+							<Text style={styles.label}>Note Type</Text>
+							{renderNoteTypeField()}
+							{errors.typeId && (
+								<Text style={styles.errorText}>{errors.typeId}</Text>
+							)}
+
+							<Text style={styles.label}>Date</Text>
+							<Pressable
+								testID="note-date-field"
+								accessibilityRole="button"
+								accessibilityLabel={`Note date, ${formatDate(date)}. Tap to change.`}
+								onPress={openDatePicker}
+								disabled={saving}
+								style={[styles.input, styles.dateField, errors.date && styles.inputError]}
+							>
+								<Text style={styles.dateText}>
+									{date ? formatDate(date) : "Select date"}
+								</Text>
+								<Text style={styles.link}>
+									{showIOSDatePicker ? "Done" : "Change"}
+								</Text>
+							</Pressable>
+							{Platform.OS === "ios" && showIOSDatePicker && (
+								<DateTimePicker
+									value={selectedDate}
+									mode="date"
+									display="spinner"
+									maximumDate={maximumDate}
+									onChange={handleDateChange}
+								/>
+							)}
+							{errors.date && (
+								<Text style={styles.errorText}>{errors.date}</Text>
+							)}
+
+							<Text style={styles.label}>Note Text</Text>
+							<TextInput
+								testID="note-text-input"
+								accessibilityLabel="Note text"
+								style={[
+									styles.input,
+									styles.textArea,
+									errors.text && styles.inputError,
+								]}
+								value={text}
+								onChangeText={(value) => {
+									setText(value);
+									clearFieldError("text");
+								}}
+								placeholder="Write the clinical note…"
+								placeholderTextColor={colors.textMuted}
+								multiline
+								textAlignVertical="top"
+								maxLength={MAX_NOTE_LENGTH}
+								editable={!saving}
+							/>
+							<View style={styles.counterRow}>
+								{errors.text ? (
+									<Text style={styles.errorText}>{errors.text}</Text>
+								) : (
+									<View />
+								)}
+								<Text style={styles.hint}>
+									{text.length}/{MAX_NOTE_LENGTH}
+								</Text>
+							</View>
+						</ScrollView>
+
+						<View style={styles.footer}>
+							<Button
+								testID="add-note-submit"
+								title={Platform.OS === "android" ? "ADD NOTE" : "Add Note"}
+								variant={Platform.OS === "android" ? "primary" : "text"}
+								onPress={handleSubmit}
+								loading={saving}
+								disabled={!typesReady}
+							/>
+							<Button
+								title="Cancel"
+								variant="text"
+								onPress={handleCancel}
+								disabled={saving}
+							/>
+						</View>
+					</KeyboardAvoidingView>
+				</SafeAreaView>
+			</SafeAreaProvider>
+		</Modal>
+	);
 };
 
+const styles = StyleSheet.create({
+	flex: {
+		flex: 1,
+	},
+	safeArea: {
+		flex: 1,
+		backgroundColor: colors.background,
+	},
+	titleBar: {
+		paddingHorizontal: spacing.lg,
+		paddingVertical: spacing.lg,
+		borderBottomWidth: StyleSheet.hairlineWidth,
+		borderBottomColor: colors.border,
+		backgroundColor: colors.card,
+	},
+	title: {
+		fontSize: 20,
+		fontWeight: "700",
+		color: colors.text,
+		textAlign: "center",
+	},
+	content: {
+		padding: spacing.lg,
+		paddingBottom: spacing.xl,
+	},
+	label: {
+		fontSize: 14,
+		fontWeight: "600",
+		color: colors.text,
+		marginTop: spacing.lg,
+		marginBottom: spacing.sm,
+	},
+	readOnly: {
+		backgroundColor: colors.border,
+		borderRadius: radius.card,
+		padding: spacing.md,
+	},
+	readOnlyText: {
+		color: colors.textMuted,
+		fontSize: 14,
+	},
+	pickerBox: {
+		backgroundColor: colors.card,
+		borderRadius: radius.card,
+		borderWidth: 1,
+		borderColor: colors.border,
+		overflow: "hidden",
+	},
+	pickerItem: {
+		fontSize: 17,
+		color: colors.text,
+	},
+	pickerPlaceholder: {
+		minHeight: Platform.OS === "ios" ? 216 : 56,
+		justifyContent: "center",
+	},
+	pickerLoading: {
+		alignItems: "center",
+		gap: spacing.sm,
+	},
+	input: {
+		backgroundColor: colors.card,
+		borderRadius: radius.card,
+		borderWidth: 1,
+		borderColor: colors.border,
+		paddingHorizontal: spacing.md,
+		paddingVertical: spacing.md,
+		fontSize: 16,
+		color: colors.text,
+	},
+	inputError: {
+		borderColor: colors.danger,
+	},
+	dateField: {
+		flexDirection: "row",
+		alignItems: "center",
+		justifyContent: "space-between",
+	},
+	dateText: {
+		fontSize: 16,
+		color: colors.text,
+	},
+	textArea: {
+		minHeight: 140,
+	},
+	counterRow: {
+		flexDirection: "row",
+		justifyContent: "space-between",
+		alignItems: "flex-start",
+		marginTop: spacing.xs,
+		gap: spacing.sm,
+	},
+	hint: {
+		fontSize: 13,
+		color: colors.textMuted,
+	},
+	link: {
+		fontSize: 13,
+		color: colors.primary,
+		fontWeight: "600",
+	},
+	errorText: {
+		flexShrink: 1,
+		fontSize: 13,
+		color: colors.danger,
+		marginTop: spacing.xs,
+	},
+	footer: {
+		gap: spacing.xs,
+		paddingHorizontal: spacing.lg,
+		paddingVertical: spacing.sm,
+		borderTopWidth: StyleSheet.hairlineWidth,
+		borderTopColor: colors.border,
+		backgroundColor: colors.card,
+	},
+});
+
 export default AddNoteModal;
diff --git a/app-clinical-notes/src/components/Button.tsx b/app-clinical-notes/src/components/Button.tsx
new file mode 100644
index 0000000..a54bc50
--- /dev/null
+++ b/app-clinical-notes/src/components/Button.tsx
@@ -0,0 +1,113 @@
+import type { FC } from "react";
+import {
+	ActivityIndicator,
+	Pressable,
+	StyleSheet,
+	Text,
+	type StyleProp,
+	type ViewStyle,
+} from "react-native";
+
+import { colors, radius, spacing } from "../theme";
+
+interface Props {
+	title: string;
+	onPress: () => void;
+	variant?: "primary" | "secondary" | "text";
+	disabled?: boolean;
+	loading?: boolean;
+	style?: StyleProp<ViewStyle>;
+	testID?: string;
+}
+
+const Button: FC<Props> = ({
+	title,
+	onPress,
+	variant = "primary",
+	disabled = false,
+	loading = false,
+	style,
+	testID,
+}) => {
+	const look = variants[variant];
+	const isDisabled = disabled || loading;
+
+	return (
+		<Pressable
+			testID={testID}
+			accessibilityRole="button"
+			accessibilityState={{ disabled: isDisabled, busy: loading }}
+			onPress={onPress}
+			disabled={isDisabled}
+			style={({ pressed }) => [
+				styles.base,
+				look.container,
+				pressed && look.pressed,
+				isDisabled && styles.disabled,
+				style,
+			]}
+		>
+			{loading ? (
+				<ActivityIndicator color={look.labelColor} />
+			) : (
+				<Text style={[styles.label, { color: look.labelColor }]}>{title}</Text>
+			)}
+		</Pressable>
+	);
+};
+
+const styles = StyleSheet.create({
+	base: {
+		minHeight: 48,
+		borderRadius: radius.card,
+		paddingHorizontal: spacing.lg,
+		alignItems: "center",
+		justifyContent: "center",
+	},
+	primary: {
+		backgroundColor: colors.primary,
+	},
+	primaryPressed: {
+		backgroundColor: colors.primaryPressed,
+	},
+	secondary: {
+		backgroundColor: colors.card,
+		borderWidth: 1,
+		borderColor: colors.primary,
+	},
+	secondaryPressed: {
+		backgroundColor: colors.chipBackground,
+	},
+	textPressed: {
+		opacity: 0.5,
+	},
+	disabled: {
+		opacity: 0.5,
+	},
+	label: {
+		fontSize: 16,
+		fontWeight: "600",
+	},
+});
+
+const variants: Record<
+	NonNullable<Props["variant"]>,
+	{ container?: ViewStyle; pressed: ViewStyle; labelColor: string }
+> = {
+	primary: {
+		container: styles.primary,
+		pressed: styles.primaryPressed,
+		labelColor: colors.white,
+	},
+	secondary: {
+		container: styles.secondary,
+		pressed: styles.secondaryPressed,
+		labelColor: colors.primary,
+	},
+	text: {
+		pressed: styles.textPressed,
+		labelColor: colors.primary,
+	},
+};
+
+export default Button;
diff --git a/app-clinical-notes/src/components/Chip.tsx b/app-clinical-notes/src/components/Chip.tsx
new file mode 100644
index 0000000..b3bb840
--- /dev/null
+++ b/app-clinical-notes/src/components/Chip.tsx
@@ -0,0 +1,48 @@
+import type { FC } from "react";
+import { Pressable, StyleSheet, Text } from "react-native";
+
+import { colors, radius, spacing } from "../theme";
+
+interface Props {
+	label: string;
+	selected: boolean;
+	onPress: () => void;
+}
+
+const Chip: FC<Props> = ({ label, selected, onPress }) => (
+	<Pressable
+		accessibilityRole="button"
+		accessibilityState={{ selected }}
+		onPress={onPress}
+		style={[styles.chip, selected && styles.chipSelected]}
+	>
+		<Text style={[styles.chipText, selected && styles.chipTextSelected]}>
+			{label}
+		</Text>
+	</Pressable>
+);
+
+const styles = StyleSheet.create({
+	chip: {
+		borderRadius: radius.pill,
+		borderWidth: 1,
+		borderColor: colors.border,
+		backgroundColor: colors.card,
+		paddingHorizontal: spacing.md,
+		paddingVertical: spacing.sm,
+	},
+	chipSelected: {
+		backgroundColor: colors.primary,
+		borderColor: colors.primary,
+	},
+	chipText: {
+		color: colors.text,
+		fontSize: 13,
+	},
+	chipTextSelected: {
+		color: colors.white,
+		fontWeight: "600",
+	},
+});
+
+export default Chip;
diff --git a/app-clinical-notes/src/components/ClinicalNote.tsx b/app-clinical-notes/src/components/ClinicalNote.tsx
index f77747b..e56fc12 100644
--- a/app-clinical-notes/src/components/ClinicalNote.tsx
+++ b/app-clinical-notes/src/components/ClinicalNote.tsx
@@ -1,13 +1,81 @@
-import type { FC } from "react";
-import { View } from "react-native";
+import { memo, type FC } from "react";
+import { StyleSheet, Text, View } from "react-native";
+
 import type { ClinicalNote as ClinicalNoteType } from "../data";
+import { colors, radius, spacing } from "../theme";
+import { formatDate } from "../utils/date";
 
 interface Props {
 	note: ClinicalNoteType;
 }
 
-const ClinicalNote: FC<Props> = () => {
-	return <View style={{ flex: 1 }}></View>;
+const ClinicalNote: FC<Props> = ({ note }) => {
+	const date = formatDate(note.date);
+
+	return (
+		<View
+			style={styles.card}
+			accessible
+			accessibilityLabel={`${note.type.name}, ${date}. ${note.noteText}`}
+		>
+			<View style={styles.topRow}>
+				<View style={styles.typePill}>
+					<Text style={styles.typeText}>{note.type.name}</Text>
+				</View>
+				<Text style={styles.date}>{date}</Text>
+			</View>
+
+			<Text style={styles.text}>{note.noteText}</Text>
+
+			<Text style={styles.id} selectable>
+				ID: {note.id}
+			</Text>
+		</View>
+	);
 };
 
-export default ClinicalNote;
+const styles = StyleSheet.create({
+	card: {
+		backgroundColor: colors.card,
+		borderRadius: radius.card,
+		padding: spacing.lg,
+		marginBottom: spacing.md,
+		borderWidth: StyleSheet.hairlineWidth,
+		borderColor: colors.border,
+	},
+	topRow: {
+		flexDirection: "row",
+		alignItems: "center",
+		justifyContent: "space-between",
+		gap: spacing.sm,
+		marginBottom: spacing.sm,
+	},
+	typePill: {
+		backgroundColor: colors.chipBackground,
+		borderRadius: radius.pill,
+		paddingHorizontal: spacing.md,
+		paddingVertical: spacing.xs,
+		flexShrink: 1,
+	},
+	typeText: {
+		color: colors.primary,
+		fontWeight: "600",
+		fontSize: 13,
+	},
+	date: {
+		color: colors.textMuted,
+		fontSize: 13,
+	},
+	text: {
+		color: colors.text,
+		fontSize: 15,
+		lineHeight: 21,
+	},
+	id: {
+		marginTop: spacing.sm,
+		color: colors.textMuted,
+		fontSize: 11,
+	},
+});
+
+export default memo(ClinicalNote);
diff --git a/app-clinical-notes/src/components/ErrorBanner.tsx b/app-clinical-notes/src/components/ErrorBanner.tsx
new file mode 100644
index 0000000..e201fed
--- /dev/null
+++ b/app-clinical-notes/src/components/ErrorBanner.tsx
@@ -0,0 +1,45 @@
+import type { FC } from "react";
+import { Pressable, StyleSheet, Text, View } from "react-native";
+
+import { colors, radius, spacing } from "../theme";
+
+interface Props {
+	message: string;
+	actionLabel?: string;
+	onAction?: () => void;
+}
+
+const ErrorBanner: FC<Props> = ({ message, actionLabel, onAction }) => (
+	<View style={styles.banner} accessibilityRole="alert">
+		<Text style={styles.message}>{message}</Text>
+		{actionLabel && onAction && (
+			<Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
+				<Text style={styles.action}>{actionLabel}</Text>
+			</Pressable>
+		)}
+	</View>
+);
+
+const styles = StyleSheet.create({
+	banner: {
+		flexDirection: "row",
+		alignItems: "center",
+		gap: spacing.md,
+		backgroundColor: colors.dangerBackground,
+		borderRadius: radius.card,
+		padding: spacing.md,
+		marginBottom: spacing.md,
+	},
+	message: {
+		flex: 1,
+		color: colors.danger,
+		fontSize: 14,
+	},
+	action: {
+		color: colors.danger,
+		fontWeight: "700",
+		fontSize: 14,
+	},
+});
+
+export default ErrorBanner;
diff --git a/app-clinical-notes/src/components/Header.tsx b/app-clinical-notes/src/components/Header.tsx
index 07b1f10..8b2749c 100644
--- a/app-clinical-notes/src/components/Header.tsx
+++ b/app-clinical-notes/src/components/Header.tsx
@@ -1,10 +1,27 @@
 import type { FC } from "react";
-import { View, Text, StyleSheet } from "react-native";
+import { View, Text, StyleSheet, Pressable } from "react-native";
 
-const Header: FC = () => {
+interface Props {
+	onBack?: () => void;
+}
+
+const Header: FC<Props> = ({ onBack }) => {
 	return (
 		<View style={styles.header}>
-			<Text style={styles.title}>Health Clinic</Text>
+			{onBack && (
+				<Pressable
+					accessibilityRole="button"
+					accessibilityLabel="Back to patients"
+					onPress={onBack}
+					hitSlop={8}
+					style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
+				>
+					<Text style={styles.backText}>‹ Patients</Text>
+				</Pressable>
+			)}
+			<Text style={styles.title} accessibilityRole="header">
+				Health Clinic
+			</Text>
 		</View>
 	);
 };
@@ -19,6 +36,20 @@ const styles = StyleSheet.create({
 		color: "#fff",
 		fontSize: 24,
 	},
+	back: {
+		position: "absolute",
+		left: 16,
+		top: 0,
+		bottom: 0,
+		justifyContent: "center",
+	},
+	backPressed: {
+		opacity: 0.5,
+	},
+	backText: {
+		color: "#fff",
+		fontSize: 17,
+	},
 });
 
 export default Header;
diff --git a/app-clinical-notes/src/components/NoteTypeFilter.tsx b/app-clinical-notes/src/components/NoteTypeFilter.tsx
new file mode 100644
index 0000000..81210fc
--- /dev/null
+++ b/app-clinical-notes/src/components/NoteTypeFilter.tsx
@@ -0,0 +1,49 @@
+import type { FC } from "react";
+import { ScrollView, StyleSheet } from "react-native";
+
+import type { ClinicalNoteType } from "../data";
+import { spacing } from "../theme";
+import Chip from "./Chip";
+
+interface Props {
+	options: { type: ClinicalNoteType; count: number }[];
+	totalCount: number;
+	selectedTypeId: string | null;
+	onChange: (typeId: string | null) => void;
+}
+
+const NoteTypeFilter: FC<Props> = ({
+	options,
+	totalCount,
+	selectedTypeId,
+	onChange,
+}) => (
+	<ScrollView
+		horizontal
+		showsHorizontalScrollIndicator={false}
+		contentContainerStyle={styles.container}
+	>
+		<Chip
+			label={`All (${totalCount})`}
+			selected={selectedTypeId === null}
+			onPress={() => onChange(null)}
+		/>
+		{options.map(({ type, count }) => (
+			<Chip
+				key={type.id}
+				label={`${type.name} (${count})`}
+				selected={selectedTypeId === type.id}
+				onPress={() => onChange(type.id)}
+			/>
+		))}
+	</ScrollView>
+);
+
+const styles = StyleSheet.create({
+	container: {
+		gap: spacing.sm,
+		paddingBottom: spacing.md,
+	},
+});
+
+export default NoteTypeFilter;
diff --git a/app-clinical-notes/src/components/PatientInfo.tsx b/app-clinical-notes/src/components/PatientInfo.tsx
index 4a9a9aa..2535700 100644
--- a/app-clinical-notes/src/components/PatientInfo.tsx
+++ b/app-clinical-notes/src/components/PatientInfo.tsx
@@ -1,13 +1,127 @@
 import type { FC } from "react";
-import { View } from "react-native";
+import { StyleSheet, Text, View } from "react-native";
+
 import type { PatientData } from "../data";
+import { colors, radius, spacing } from "../theme";
+import { formatDate } from "../utils/date";
 
 interface Props {
 	patient: PatientData;
 }
 
-const PatientInfo: FC<Props> = () => {
-	return <View style={{ flex: 1 }}></View>;
+interface InfoRowProps {
+	label: string;
+	value: string;
+}
+
+const InfoRow: FC<InfoRowProps> = ({ label, value }) => (
+	<View style={styles.row}>
+		<Text style={styles.label}>{label}</Text>
+		<Text style={styles.value} selectable>
+			{value}
+		</Text>
+	</View>
+);
+
+const PatientInfo: FC<Props> = ({ patient }) => {
+	const { dischargeSummary } = patient;
+
+	return (
+		<View style={styles.card}>
+			<Text style={styles.name} accessibilityRole="header">
+				{patient.name}
+			</Text>
+
+			<Text style={styles.sectionTitle} accessibilityRole="header">
+				Patient Information
+			</Text>
+			<InfoRow label="Patient ID" value={patient.id} />
+			<InfoRow label="Age" value={String(patient.age)} />
+			<InfoRow label="Gender" value={patient.gender} />
+			<InfoRow label="Admitted" value={formatDate(patient.dateOfAdmission)} />
+			<InfoRow label="Physician" value={patient.admittingPhysician} />
+			<InfoRow label="Nurse" value={patient.nurse} />
+			<InfoRow label="Clinic" value={patient.clinic} />
+
+			<View style={styles.divider} />
+
+			<Text style={styles.sectionTitle} accessibilityRole="header">
+				Discharge Summary
+			</Text>
+			<InfoRow label="Date" value={formatDate(dischargeSummary.date)} />
+			<InfoRow label="Diagnosis" value={dischargeSummary.diagnosis} />
+
+			<View style={styles.row}>
+				<Text style={styles.label}>Medication</Text>
+				<View style={styles.valueColumn}>
+					{dischargeSummary.medication.length === 0 ? (
+						<Text style={styles.valueText}>None</Text>
+					) : (
+						dischargeSummary.medication.map((item) => (
+							<Text key={item} style={styles.valueText}>
+								• {item}
+							</Text>
+						))
+					)}
+				</View>
+			</View>
+
+			<InfoRow label="Instructions" value={dischargeSummary.instructions} />
+		</View>
+	);
 };
 
+const styles = StyleSheet.create({
+	card: {
+		backgroundColor: colors.card,
+		borderRadius: radius.card,
+		padding: spacing.lg,
+		marginBottom: spacing.xl,
+		borderWidth: StyleSheet.hairlineWidth,
+		borderColor: colors.border,
+	},
+	name: {
+		fontSize: 22,
+		fontWeight: "700",
+		color: colors.text,
+	},
+	sectionTitle: {
+		fontSize: 13,
+		fontWeight: "700",
+		color: colors.primary,
+		textTransform: "uppercase",
+		letterSpacing: 0.5,
+		marginTop: spacing.lg,
+		marginBottom: spacing.sm,
+	},
+	row: {
+		flexDirection: "row",
+		paddingVertical: spacing.xs + 2,
+		gap: spacing.md,
+	},
+	label: {
+		width: 96,
+		fontSize: 14,
+		color: colors.textMuted,
+	},
+	value: {
+		flex: 1,
+		fontSize: 14,
+		color: colors.text,
+	},
+	valueColumn: {
+		flex: 1,
+	},
+	valueText: {
+		fontSize: 14,
+		color: colors.text,
+		marginBottom: 2,
+	},
+	divider: {
+		height: StyleSheet.hairlineWidth,
+		backgroundColor: colors.border,
+		marginTop: spacing.md,
+	},
+});
+
 export default PatientInfo;
diff --git a/app-clinical-notes/src/components/SortSheet.tsx b/app-clinical-notes/src/components/SortSheet.tsx
new file mode 100644
index 0000000..1b7120d
--- /dev/null
+++ b/app-clinical-notes/src/components/SortSheet.tsx
@@ -0,0 +1,166 @@
+import Ionicons from "@expo/vector-icons/Ionicons";
+import { useEffect, useRef } from "react";
+import {
+	Animated,
+	Modal,
+	Pressable,
+	StyleSheet,
+	Text,
+	View,
+} from "react-native";
+import { useSafeAreaInsets } from "react-native-safe-area-context";
+
+import { colors, radius, spacing } from "../theme";
+
+interface Option<K extends string> {
+	key: K;
+	label: string;
+}
+
+interface Props<K extends string> {
+	visible: boolean;
+	options: Option<K>[];
+	selected: K;
+	onSelect: (key: K) => void;
+	onClose: () => void;
+}
+
+const SHEET_OFFSCREEN = 400;
+
+const SortSheet = <K extends string>({
+	visible,
+	options,
+	selected,
+	onSelect,
+	onClose,
+}: Props<K>) => {
+	const insets = useSafeAreaInsets();
+	const translateY = useRef(new Animated.Value(SHEET_OFFSCREEN)).current;
+
+	useEffect(() => {
+		if (visible) {
+			translateY.setValue(SHEET_OFFSCREEN);
+			Animated.spring(translateY, {
+				toValue: 0,
+				useNativeDriver: true,
+				bounciness: 0,
+			}).start();
+		}
+	}, [visible, translateY]);
+
+	return (
+		<Modal
+			visible={visible}
+			transparent
+			animationType="fade"
+			onRequestClose={onClose}
+		>
+			<Pressable
+				style={styles.backdrop}
+				onPress={onClose}
+				accessibilityLabel="Close sort options"
+			/>
+			<Animated.View
+				style={[
+					styles.sheet,
+					{
+						paddingBottom: spacing.lg + insets.bottom,
+						transform: [{ translateY }],
+					},
+				]}
+			>
+				<View style={styles.handle} />
+				<Text style={styles.title} accessibilityRole="header">
+					Sort by
+				</Text>
+				{options.map(({ key, label }) => {
+					const isSelected = key === selected;
+					return (
+						<Pressable
+							key={key}
+							accessibilityRole="radio"
+							accessibilityState={{ checked: isSelected }}
+							onPress={() => {
+								onSelect(key);
+								onClose();
+							}}
+							style={({ pressed }) => [
+								styles.option,
+								pressed && styles.optionPressed,
+							]}
+						>
+							<Text
+								style={[
+									styles.optionText,
+									isSelected && styles.optionTextSelected,
+								]}
+							>
+								{label}
+							</Text>
+							{isSelected && (
+								<Ionicons name="checkmark" size={22} color={colors.primary} />
+							)}
+						</Pressable>
+					);
+				})}
+			</Animated.View>
+		</Modal>
+	);
+};
+
+const styles = StyleSheet.create({
+	backdrop: {
+		position: "absolute",
+		top: 0,
+		left: 0,
+		right: 0,
+		bottom: 0,
+		backgroundColor: "rgba(0, 0, 0, 0.35)",
+	},
+	sheet: {
+		position: "absolute",
+		left: 0,
+		right: 0,
+		bottom: 0,
+		backgroundColor: colors.card,
+		borderTopLeftRadius: radius.card * 2,
+		borderTopRightRadius: radius.card * 2,
+		paddingHorizontal: spacing.lg,
+		paddingTop: spacing.sm,
+	},
+	handle: {
+		alignSelf: "center",
+		width: 36,
+		height: 5,
+		borderRadius: radius.pill,
+		backgroundColor: colors.border,
+		marginBottom: spacing.md,
+	},
+	title: {
+		fontSize: 18,
+		fontWeight: "700",
+		color: colors.text,
+		marginBottom: spacing.sm,
+	},
+	option: {
+		flexDirection: "row",
+		alignItems: "center",
+		justifyContent: "space-between",
+		minHeight: 48,
+		paddingHorizontal: spacing.sm,
+		borderRadius: radius.card,
+	},
+	optionPressed: {
+		backgroundColor: colors.chipBackground,
+	},
+	optionText: {
+		fontSize: 16,
+		color: colors.text,
+	},
+	optionTextSelected: {
+		color: colors.primary,
+		fontWeight: "600",
+	},
+});
+
+export default SortSheet;
diff --git a/app-clinical-notes/src/components/StatusView.tsx b/app-clinical-notes/src/components/StatusView.tsx
new file mode 100644
index 0000000..f032a22
--- /dev/null
+++ b/app-clinical-notes/src/components/StatusView.tsx
@@ -0,0 +1,50 @@
+import type { FC } from "react";
+import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
+
+import { colors, spacing } from "../theme";
+import Button from "./Button";
+
+interface Props {
+	loading?: boolean;
+	title?: string;
+	message?: string;
+	onRetry?: () => void;
+}
+
+const StatusView: FC<Props> = ({ loading = false, title, message, onRetry }) => (
+	<View style={styles.container} accessibilityLiveRegion="polite">
+		{loading && <ActivityIndicator size="large" color={colors.primary} />}
+		{title && <Text style={styles.title}>{title}</Text>}
+		{message && <Text style={styles.message}>{message}</Text>}
+		{onRetry && !loading && (
+			<Button title="Try again" onPress={onRetry} style={styles.button} />
+		)}
+	</View>
+);
+
+const styles = StyleSheet.create({
+	container: {
+		flex: 1,
+		alignItems: "center",
+		justifyContent: "center",
+		padding: spacing.xl,
+		gap: spacing.md,
+	},
+	title: {
+		fontSize: 18,
+		fontWeight: "600",
+		color: colors.text,
+		textAlign: "center",
+	},
+	message: {
+		fontSize: 15,
+		color: colors.textMuted,
+		textAlign: "center",
+	},
+	button: {
+		alignSelf: "stretch",
+		marginTop: spacing.sm,
+	},
+});
+
+export default StatusView;
diff --git a/app-clinical-notes/src/data/index.test.ts b/app-clinical-notes/src/data/index.test.ts
index db7803e..d7625e8 100644
--- a/app-clinical-notes/src/data/index.test.ts
+++ b/app-clinical-notes/src/data/index.test.ts
@@ -6,12 +6,9 @@ import AsyncStorage from "@react-native-async-storage/async-storage";
 
 const PATIENT_ID = "d33ddc07-c051-4b7f-9999-c3eaf651a4c1";
 
-// The client adds a random delay to every call and rejects when that delay is
-// under 500ms. Pinning Math.random keeps the tests deterministic.
 const NO_ERROR_RANDOM = 0.5;
 const SYNTHETIC_ERROR_RANDOM = 0.1;
 
-// Runs a client call to completion by flushing the simulated network delays.
 const settle = async <T>(promise: Promise<T>): Promise<T> => {
 	await jest.runAllTimersAsync();
 	return promise;
@@ -45,6 +42,22 @@ describe("Client", () => {
 				expect(noteTypeData).toContainEqual(note.type);
 			});
 		});
+
+		it("has no mis-encoded (mojibake) characters", () => {
+			const seedText = JSON.stringify(patientData);
+
+			expect(seedText).not.toMatch(/Ã./);
+			expect(patientData[0].nurse).toBe("Infirmière Hélène");
+			expect(patientData[0].clinic).toBe("Clinique Sainte-Anne-de-Beaupré");
+		});
+
+		it("uses real line breaks, not a literal backslash-n", () => {
+			const notes = patientData.flatMap((patient) => patient.clinicalNotes);
+
+			notes.forEach((note) => {
+				expect(note.noteText).not.toContain("\\n");
+			});
+		});
 	});
 
 	describe("resetState", () => {
@@ -133,6 +146,20 @@ describe("Client", () => {
 			);
 		});
 
+		it("should simulate only one network call per save", async () => {
+			await settle(client.addNewClinicalNote(PATIENT_ID, clinicalNote));
+
+			expect(Math.random).toHaveBeenCalledTimes(1);
+		});
+
+		it("should not mutate the seed data", async () => {
+			const before = patientData[0].clinicalNotes.length;
+
+			await settle(client.addNewClinicalNote(PATIENT_ID, clinicalNote));
+
+			expect(patientData[0].clinicalNotes).toHaveLength(before);
+		});
+
 		it("should reject when the patient does not exist", async () => {
 			const promise = client.addNewClinicalNote("unknown-id", clinicalNote);
 			const assertion = expect(promise).rejects.toThrow("Patient not found");
diff --git a/app-clinical-notes/src/data/index.tsx b/app-clinical-notes/src/data/index.tsx
index 534a7b1..bd0c8a5 100644
--- a/app-clinical-notes/src/data/index.tsx
+++ b/app-clinical-notes/src/data/index.tsx
@@ -69,31 +69,38 @@ const slice = <T extends Array<PatientData>>(list: T, opts: FetchParams) => {
 };
 
 export default class Client {
+	private ready: Promise<void>;
+
 	constructor() {
-		this.resetState();
+		this.ready = this.resetState();
 	}
 
 	async resetState() {
-		AsyncStorage.setItem("patientData", JSON.stringify(patientData));
-		AsyncStorage.setItem("clinicalNoteTypes", JSON.stringify(noteTypeData));
+		await Promise.all([
+			AsyncStorage.setItem("patientData", JSON.stringify(patientData)),
+			AsyncStorage.setItem("clinicalNoteTypes", JSON.stringify(noteTypeData)),
+		]);
 	}
 
-	async fetchPatientData(opts?: FetchParams): Promise<PatientData[]> {
-		await randomFuzz();
-
-		console.log("Fetching patient data...");
-
+	private async readPatients(): Promise<PatientData[]> {
 		const data = await AsyncStorage.getItem("patientData");
 
 		if (!data) {
 			return [];
 		}
 
-		const patientData = JSON.parse(data) as null | PatientData[];
+		const patients = JSON.parse(data) as null | PatientData[];
 
-		if (!patientData) {
-			return [];
-		}
+		return patients ?? [];
+	}
+
+	async fetchPatientData(opts?: FetchParams): Promise<PatientData[]> {
+		await this.ready;
+		await randomFuzz();
+
+		console.log("Fetching patient data...");
+
+		const patientData = await this.readPatients();
 
 		if (opts) {
 			slice(patientData, opts);
@@ -106,11 +113,12 @@ export default class Client {
 		patientId: string,
 		clinicalNote: ClinicalNote,
 	): Promise<void> {
+		await this.ready;
 		await randomFuzz();
 
 		console.log(`Adding new clinical note for patient with ID: ${patientId}`);
 
-		const patientData = await this.fetchPatientData();
+		const patientData = await this.readPatients();
 
 		const patientIndex = patientData.findIndex(
 			(patient) => patient.id === patientId,
@@ -119,8 +127,11 @@ export default class Client {
 			throw new Error("Patient not found");
 		}
 
-		const updatedPatient = { ...patientData[patientIndex] };
-		updatedPatient.clinicalNotes.push(clinicalNote);
+		const existing = patientData[patientIndex];
+		const updatedPatient: PatientData = {
+			...existing,
+			clinicalNotes: [...existing.clinicalNotes, clinicalNote],
+		};
 
 		patientData[patientIndex] = updatedPatient;
 
@@ -130,6 +141,7 @@ export default class Client {
 	}
 
 	async fetchClinicalNoteTypes(): Promise<ClinicalNoteType[]> {
+		await this.ready;
 		await randomFuzz();
 
 		console.log("Fetching clinical note types...");
diff --git a/app-clinical-notes/src/data/patients.ts b/app-clinical-notes/src/data/patients.ts
index 64132de..2d4d161 100644
--- a/app-clinical-notes/src/data/patients.ts
+++ b/app-clinical-notes/src/data/patients.ts
@@ -1,4 +1,297 @@
 import type { PatientData } from ".";
+import noteTypes from "./noteType";
+
+const [admissionType, progressType, , , dischargeType] = noteTypes;
+
+interface CompactPatient {
+	name: string;
+	age: number;
+	gender: string;
+	admitted: string;
+	discharged: string;
+	physician: string;
+	nurse: string;
+	clinic: string;
+	diagnosis: string;
+	medication: string[];
+	instructions: string;
+	admissionNote: string;
+	progressNote: string;
+	dischargeNote: string;
+}
+
+const pad = (n: number) => String(n).padStart(12, "0");
+
+const toPatient = (seed: CompactPatient, n: number): PatientData => ({
+	id: `0f5e2c10-6a3d-4b8e-9c71-${pad(n)}`,
+	name: seed.name,
+	age: seed.age,
+	gender: seed.gender,
+	dateOfAdmission: seed.admitted,
+	admittingPhysician: seed.physician,
+	dischargeSummary: {
+		date: seed.discharged,
+		diagnosis: seed.diagnosis,
+		medication: seed.medication,
+		instructions: seed.instructions,
+	},
+	nurse: seed.nurse,
+	clinic: seed.clinic,
+	clinicalNotes: [
+		{
+			id: `7c4d9e20-1b5a-4f3c-8e62-${pad(n * 10 + 1)}`,
+			date: seed.admitted,
+			type: admissionType,
+			noteText: seed.admissionNote,
+		},
+		{
+			id: `7c4d9e20-1b5a-4f3c-8e62-${pad(n * 10 + 2)}`,
+			date: seed.admitted,
+			type: progressType,
+			noteText: seed.progressNote,
+		},
+		{
+			id: `7c4d9e20-1b5a-4f3c-8e62-${pad(n * 10 + 3)}`,
+			date: seed.discharged,
+			type: dischargeType,
+			noteText: seed.dischargeNote,
+		},
+	],
+});
+
+const BROWN = "Dr. Michael Brown";
+const GAGNON = "Dr. Louise Gagnon";
+const ROY = "Dr. Antoine Roy";
+const SHAH = "Dr. Priya Shah";
+const HELENE = "Infirmière Hélène";
+const JF = "Infirmier Jean-François";
+const CHANTAL = "Infirmière Chantal";
+const BEAUPRE = "Clinique Sainte-Anne-de-Beaupré";
+const LIMOILOU = "CLSC de Limoilou";
+const ST_ROCH = "Clinique médicale Saint-Roch";
+
+const morePatients: CompactPatient[] = [
+	{
+		name: "Luc Bouchard", age: 71, gender: "Male",
+		admitted: "2023-11-03", discharged: "2023-11-08",
+		physician: GAGNON, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Congestive heart failure exacerbation",
+		medication: ["Furosemide 40 mg once daily", "Ramipril 5 mg once daily"],
+		instructions: "Weigh yourself every morning. Call the clinic if you gain more than 2 kg in 3 days.",
+		admissionNote: "Shortness of breath and bilateral leg edema for 4 days. Crackles at both lung bases.",
+		progressNote: "IV diuretics started. Net negative 1.8 L overnight, breathing easier.",
+		dischargeNote: "Euvolemic, walking without breathlessness.\nHeart failure clinic follow-up in 2 weeks.",
+	},
+	{
+		name: "Chloé Gauthier", age: 24, gender: "Female",
+		admitted: "2024-01-14", discharged: "2024-01-16",
+		physician: ROY, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "Acute pyelonephritis",
+		medication: ["Ciprofloxacin 500 mg twice daily for 7 days"],
+		instructions: "Drink plenty of fluids. Return if fever comes back or you cannot keep fluids down.",
+		admissionNote: "Fever 39.2°C, right flank pain and dysuria. Urinalysis positive for nitrites.",
+		progressNote: "Afebrile after 24 hours of IV antibiotics. Tolerating oral intake.",
+		dischargeNote: "Switched to oral antibiotics.\nUrine culture result to be reviewed by family physician.",
+	},
+	{
+		name: "Robert Côté", age: 82, gender: "Male",
+		admitted: "2023-12-01", discharged: "2023-12-10",
+		physician: BROWN, nurse: CHANTAL, clinic: ST_ROCH,
+		diagnosis: "Hip fracture, post surgical repair",
+		medication: ["Enoxaparin 40 mg daily for 28 days", "Acetaminophen 1000 mg every 6 hours as needed"],
+		instructions: "Physiotherapy exercises twice daily. Use the walker at all times until reviewed.",
+		admissionNote: "Fall at home, unable to bear weight. X-ray shows left femoral neck fracture.",
+		progressNote: "Post-op day 2 after hemiarthroplasty. Mobilizing with physiotherapy.",
+		dischargeNote: "Discharged to rehabilitation centre.\nOrthopedic follow-up in 6 weeks.",
+	},
+	{
+		name: "Fatima Haddad", age: 45, gender: "Female",
+		admitted: "2024-02-20", discharged: "2024-02-22",
+		physician: SHAH, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Asthma exacerbation",
+		medication: ["Prednisone 40 mg daily for 5 days", "Budesonide-formoterol 200/6 two puffs twice daily"],
+		instructions: "Use the inhaler every day, even when you feel well. Avoid known triggers.",
+		admissionNote: "Wheezing and chest tightness after a viral illness. Peak flow 55% of predicted.",
+		progressNote: "Responding to bronchodilators and steroids. Peak flow 75%.",
+		dischargeNote: "Peak flow 85% of predicted.\nAsthma action plan reviewed with the patient.",
+	},
+	{
+		name: "Jacques Pelletier", age: 63, gender: "Male",
+		admitted: "2023-10-05", discharged: "2023-10-09",
+		physician: GAGNON, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "Acute exacerbation of COPD",
+		medication: ["Prednisone 40 mg daily for 5 days", "Tiotropium 18 mcg once daily"],
+		instructions: "Stop smoking; a cessation program referral was made. Use oxygen as prescribed.",
+		admissionNote: "Increased dyspnea and sputum for 3 days. SpO2 86% on room air.",
+		progressNote: "Oxygen titrated to SpO2 88–92%. Sputum less purulent.",
+		dischargeNote: "Back to baseline exercise tolerance.\nPulmonary rehab referral sent.",
+	},
+	{
+		name: "Isabelle Fortin", age: 38, gender: "Female",
+		admitted: "2024-03-11", discharged: "2024-03-13",
+		physician: ROY, nurse: CHANTAL, clinic: ST_ROCH,
+		diagnosis: "Cellulitis of the left leg",
+		medication: ["Cephalexin 500 mg four times daily for 7 days"],
+		instructions: "Keep the leg raised when sitting. Return if the redness spreads past the marked line.",
+		admissionNote: "Spreading redness and warmth of the left shin. Border marked with pen.",
+		progressNote: "Redness receding inside the marked border after IV cefazolin.",
+		dischargeNote: "Switched to oral antibiotics.\nWound check in 3 days at the CLSC.",
+	},
+	{
+		name: "Mohamed Saidi", age: 50, gender: "Male",
+		admitted: "2024-04-02", discharged: "2024-04-05",
+		physician: SHAH, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Non-ST elevation myocardial infarction",
+		medication: ["Aspirin 81 mg daily", "Ticagrelor 90 mg twice daily", "Atorvastatin 80 mg daily"],
+		instructions: "Do not stop the blood thinners without talking to your cardiologist. No driving for 1 week.",
+		admissionNote: "Chest pressure at rest for 2 hours. Troponin elevated, ECG without ST elevation.",
+		progressNote: "Angiography: one stent placed in the right coronary artery. Pain free.",
+		dischargeNote: "Stable after stent placement.\nCardiac rehab and cardiology follow-up in 4 weeks.",
+	},
+	{
+		name: "Geneviève Lapointe", age: 33, gender: "Female",
+		admitted: "2023-09-25", discharged: "2023-09-27",
+		physician: BROWN, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "Migraine with aura, status migrainosus",
+		medication: ["Sumatriptan 50 mg at onset, may repeat once", "Naproxen 500 mg twice daily as needed"],
+		instructions: "Keep a headache diary. Return for sudden severe headache or weakness.",
+		admissionNote: "Headache for 3 days not relieved by usual medication. Neurological exam normal.",
+		progressNote: "Headache resolved after IV fluids, metoclopramide and ketorolac.",
+		dischargeNote: "Headache free for 24 hours.\nNeurology referral for preventive treatment.",
+	},
+	{
+		name: "Pierre Bergeron", age: 77, gender: "Male",
+		admitted: "2024-05-08", discharged: "2024-05-14",
+		physician: GAGNON, nurse: CHANTAL, clinic: ST_ROCH,
+		diagnosis: "Ischemic stroke, left middle cerebral artery",
+		medication: ["Clopidogrel 75 mg daily", "Atorvastatin 40 mg daily"],
+		instructions: "Call 911 right away for new weakness, speech problems or facial droop.",
+		admissionNote: "Sudden right arm weakness and word-finding difficulty. CT angiography done.",
+		progressNote: "Speech improving. Swallow assessment passed.",
+		dischargeNote: "Mild residual right hand weakness.\nStroke prevention clinic in 2 weeks; outpatient OT.",
+	},
+	{
+		name: "Nathalie Dubé", age: 58, gender: "Female",
+		admitted: "2024-06-17", discharged: "2024-06-19",
+		physician: ROY, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Acute cholecystitis, post laparoscopic cholecystectomy",
+		medication: ["Acetaminophen 1000 mg every 6 hours as needed", "Hydromorphone 1 mg every 4 hours as needed for 3 days"],
+		instructions: "Low-fat diet for 2 weeks. No lifting over 5 kg for 2 weeks.",
+		admissionNote: "Right upper quadrant pain and fever. Ultrasound shows gallbladder wall thickening.",
+		progressNote: "Uncomplicated laparoscopic cholecystectomy. Tolerating diet.",
+		dischargeNote: "Discharged home.\nSurgical clinic follow-up in 2 weeks.",
+	},
+	{
+		name: "Samuel Girard", age: 19, gender: "Male",
+		admitted: "2024-07-04", discharged: "2024-07-06",
+		physician: SHAH, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "Diabetic ketoacidosis, type 1 diabetes",
+		medication: ["Insulin glargine 22 units at bedtime", "Insulin lispro per carbohydrate ratio with meals"],
+		instructions: "Never skip basal insulin, even when sick. Check ketones if glucose is above 14 mmol/L.",
+		admissionNote: "Vomiting and abdominal pain. Glucose 31 mmol/L, pH 7.18, ketones positive.",
+		progressNote: "Anion gap closed on insulin infusion. Transitioned to subcutaneous insulin.",
+		dischargeNote: "Sick-day rules reviewed with patient and parent.\nDiabetes educator visit in 1 week.",
+	},
+	{
+		name: "Claire Morin", age: 69, gender: "Female",
+		admitted: "2024-08-12", discharged: "2024-08-16",
+		physician: BROWN, nurse: CHANTAL, clinic: ST_ROCH,
+		diagnosis: "Atrial fibrillation with rapid ventricular response",
+		medication: ["Metoprolol 50 mg twice daily", "Apixaban 5 mg twice daily"],
+		instructions: "Take apixaban at the same times every day. Report any unusual bleeding.",
+		admissionNote: "Palpitations and dizziness. ECG: atrial fibrillation at 142 bpm.",
+		progressNote: "Rate controlled on metoprolol. Echocardiogram shows normal function.",
+		dischargeNote: "Heart rate 70–85 at rest.\nCardiology follow-up in 6 weeks.",
+	},
+	{
+		name: "Étienne Lavallée", age: 41, gender: "Male",
+		admitted: "2024-09-01", discharged: "2024-09-03",
+		physician: GAGNON, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Kidney stone (right ureter)",
+		medication: ["Tamsulosin 0.4 mg daily for 2 weeks", "Ketorolac 10 mg every 6 hours as needed for 5 days"],
+		instructions: "Strain your urine and bring any stone to the clinic. Drink at least 2.5 L of water a day.",
+		admissionNote: "Severe right flank pain radiating to the groin. CT shows a 5 mm ureteral stone.",
+		progressNote: "Pain controlled. No fever, kidney function normal.",
+		dischargeNote: "Discharged for trial of passage.\nUrology follow-up with repeat imaging in 3 weeks.",
+	},
+	{
+		name: "Hélène Caron", age: 88, gender: "Female",
+		admitted: "2024-09-18", discharged: "2024-09-25",
+		physician: ROY, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "Delirium secondary to urinary tract infection",
+		medication: ["Nitrofurantoin 100 mg twice daily for 5 days"],
+		instructions: "Family to watch for new confusion. Keep glasses and hearing aids on during the day.",
+		admissionNote: "New confusion over 2 days per daughter. Urinalysis positive.",
+		progressNote: "More oriented today. Sleeping better with non-drug measures.",
+		dischargeNote: "Back to baseline cognition per family.\nHome care nursing visit arranged.",
+	},
+	{
+		name: "Vincent Ouellet", age: 36, gender: "Male",
+		admitted: "2024-10-07", discharged: "2024-10-08",
+		physician: SHAH, nurse: CHANTAL, clinic: ST_ROCH,
+		diagnosis: "Concussion after cycling accident",
+		medication: ["Acetaminophen 1000 mg every 6 hours as needed"],
+		instructions: "Rest from screens and sport for 48 hours, then return gradually. No cycling until cleared.",
+		admissionNote: "Fell from bicycle with helmet. Brief loss of consciousness. CT head normal.",
+		progressNote: "Observed overnight. Headache mild, no vomiting.",
+		dischargeNote: "Neurologically intact.\nReturn-to-sport protocol handed out.",
+	},
+	{
+		name: "Mélanie Simard", age: 29, gender: "Female",
+		admitted: "2024-10-21", discharged: "2024-10-23",
+		physician: BROWN, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Hyperemesis gravidarum",
+		medication: ["Doxylamine-pyridoxine 10/10 mg two tablets at bedtime", "Ondansetron 4 mg as needed"],
+		instructions: "Small frequent meals. Return if unable to keep fluids down for 12 hours.",
+		admissionNote: "Ten weeks pregnant with persistent vomiting. Ketones in urine, mild dehydration.",
+		progressNote: "Rehydrated with IV fluids. Tolerating crackers and fluids.",
+		dischargeNote: "Tolerating oral intake.\nObstetrics follow-up in 1 week.",
+	},
+	{
+		name: "André Leclerc", age: 66, gender: "Male",
+		admitted: "2024-11-04", discharged: "2024-11-09",
+		physician: GAGNON, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "Upper gastrointestinal bleed, peptic ulcer",
+		medication: ["Pantoprazole 40 mg twice daily for 8 weeks"],
+		instructions: "Avoid ibuprofen, naproxen and aspirin. Return for black stools or vomiting blood.",
+		admissionNote: "Black stools for 2 days, hemoglobin 82 g/L. Takes ibuprofen daily for back pain.",
+		progressNote: "Endoscopy: duodenal ulcer treated. Hemoglobin stable after 1 unit of blood.",
+		dischargeNote: "No further bleeding.\nH. pylori result to be followed by family physician.",
+	},
+	{
+		name: "Julie Beaulieu", age: 52, gender: "Female",
+		admitted: "2024-11-19", discharged: "2024-11-21",
+		physician: ROY, nurse: CHANTAL, clinic: ST_ROCH,
+		diagnosis: "Deep vein thrombosis, right leg",
+		medication: ["Rivaroxaban 15 mg twice daily for 21 days, then 20 mg daily"],
+		instructions: "Walk regularly and wear the compression stocking. Report chest pain or breathlessness right away.",
+		admissionNote: "Right calf swelling and pain after a long flight. Doppler confirms DVT.",
+		progressNote: "Anticoagulation started. No signs of pulmonary embolism.",
+		dischargeNote: "Swelling improving.\nThrombosis clinic follow-up in 3 weeks.",
+	},
+	{
+		name: "Olivier Paquette", age: 47, gender: "Male",
+		admitted: "2024-12-02", discharged: "2024-12-04",
+		physician: SHAH, nurse: HELENE, clinic: BEAUPRE,
+		diagnosis: "Acute pancreatitis",
+		medication: ["Acetaminophen 1000 mg every 6 hours as needed"],
+		instructions: "No alcohol. Low-fat diet for 4 weeks.",
+		admissionNote: "Severe epigastric pain radiating to the back. Lipase 5 times normal.",
+		progressNote: "Pain settling with IV fluids and analgesia. Started on clear fluids.",
+		dischargeNote: "Tolerating low-fat diet.\nAlcohol counselling referral made.",
+	},
+	{
+		name: "Simone Arsenault", age: 74, gender: "Female",
+		admitted: "2024-12-15", discharged: "2024-12-20",
+		physician: BROWN, nurse: JF, clinic: LIMOILOU,
+		diagnosis: "COVID-19 pneumonia",
+		medication: ["Dexamethasone 6 mg daily to complete 10 days"],
+		instructions: "Isolate until 5 days after symptoms started. Return if breathing gets harder.",
+		admissionNote: "Fever and cough for 6 days, SpO2 89% on room air. PCR positive for SARS-CoV-2.",
+		progressNote: "Oxygen weaned to 1 L/min. Eating well.",
+		dischargeNote: "SpO2 94% on room air.\nFamily physician phone follow-up in 1 week.",
+	},
+];
 
 const patients: PatientData[] = [
 	{
@@ -18,8 +311,8 @@ const patients: PatientData[] = [
 			instructions:
 				"Patient advised to get plenty of rest and avoid contact with others to prevent spread of the infection.",
 		},
-		nurse: "InfirmiÃ¨re HÃ©lÃ¨ne",
-		clinic: "Clinique Sainte-Anne-de-BeauprÃ©",
+		nurse: "Infirmière Hélène",
+		clinic: "Clinique Sainte-Anne-de-Beaupré",
 		clinicalNotes: [
 			{
 				id: "3778b45b-fb29-4b9f-956a-f0207be20e6d",
@@ -54,10 +347,154 @@ const patients: PatientData[] = [
 				date: "2023-07-19",
 				type: { id: "CN005", name: "Discharge Note" },
 				noteText:
-					"Patient's condition significantly improved. Discharged with instructions to rest, hydrate, and complete antiviral course. \\nFollow-up appointment scheduled in one week.",
+					"Patient's condition significantly improved. Discharged with instructions to rest, hydrate, and complete antiviral course.\nFollow-up appointment scheduled in one week.",
+			},
+		],
+	},
+	{
+		id: "5f2a9c4e-7b31-4d8a-9e62-1c0b7a3f8d24",
+		name: "Marie Tremblay",
+		age: 67,
+		gender: "Female",
+		dateOfAdmission: "2023-08-02",
+		admittingPhysician: "Dr. Louise Gagnon",
+		dischargeSummary: {
+			date: "2023-08-09",
+			diagnosis: "Community-acquired pneumonia",
+			medication: [
+				"Amoxicillin-clavulanate 875/125 mg twice daily for 7 days",
+				"Azithromycin 500 mg once daily for 3 days",
+			],
+			instructions:
+				"Complete the full antibiotic course. Return to the emergency department if shortness of breath worsens or fever returns.",
+		},
+		nurse: "Infirmier Jean-François",
+		clinic: "CLSC de Limoilou",
+		clinicalNotes: [
+			{
+				id: "b7e4d1a2-3c58-4f9e-8a16-2d9c0e5b7f31",
+				date: "2023-08-02",
+				type: { id: "CN001", name: "Admission Note" },
+				noteText:
+					"Patient admitted with productive cough, fever of 38.9°C and right-sided chest pain. SpO2 91% on room air, started on 2 L/min oxygen.",
+			},
+			{
+				id: "c18f6e93-4a2d-4b7c-9e05-7f3a1d8c6b42",
+				date: "2023-08-03",
+				type: { id: "CN003", name: "Lab Results" },
+				noteText:
+					"Chest X-ray shows right lower lobe consolidation. WBC 14.2 x10^9/L, CRP elevated. Blood cultures pending.",
+			},
+			{
+				id: "d29a7f04-5b3e-4c8d-af16-8e4b2c9d7a53",
+				date: "2023-08-05",
+				type: { id: "CN002", name: "Progress Note" },
+				noteText:
+					"Afebrile for 24 hours. Oxygen weaned off, SpO2 95% on room air. Appetite improving.",
+			},
+			{
+				id: "e3ab8015-6c4f-4d9e-b027-9f5c3dae8b64",
+				date: "2023-08-09",
+				type: { id: "CN005", name: "Discharge Note" },
+				noteText:
+					"Clinically stable and discharged home with oral antibiotics.\nFamily physician follow-up in 10 days with repeat chest X-ray in 6 weeks.",
+			},
+		],
+	},
+	{
+		id: "8c3e1b7d-2f64-4a9b-8d50-6e2f9a1c4b75",
+		name: "Ahmed Benali",
+		age: 54,
+		gender: "Male",
+		dateOfAdmission: "2023-09-11",
+		admittingPhysician: "Dr. Michael Brown",
+		dischargeSummary: {
+			date: "2023-09-15",
+			diagnosis: "Type 2 diabetes with hyperglycemia",
+			medication: [
+				"Metformin 1000 mg twice daily",
+				"Insulin glargine 18 units at bedtime",
+			],
+			instructions:
+				"Check blood glucose before meals and at bedtime. Follow the diabetic diet plan provided by the dietitian.",
+		},
+		nurse: "Infirmière Hélène",
+		clinic: "Clinique Sainte-Anne-de-Beaupré",
+		clinicalNotes: [
+			{
+				id: "f4bc9126-7d5a-4eaf-8138-a06d4ebf9c75",
+				date: "2023-09-11",
+				type: { id: "CN001", name: "Admission Note" },
+				noteText:
+					"Patient presented with polyuria, polydipsia and blurred vision. Capillary glucose 24.6 mmol/L. No ketones detected.",
+			},
+			{
+				id: "05cd0237-8e6b-4fb0-9249-b17e5fc0ad86",
+				date: "2023-09-12",
+				type: { id: "CN004", name: "Consultation" },
+				noteText:
+					"Endocrinology and dietitian consulted. Basal insulin started, diabetes education session booked.",
+			},
+			{
+				id: "16de1348-9f7c-4a01-a35a-c28f6ad1be97",
+				date: "2023-09-15",
+				type: { id: "CN005", name: "Discharge Note" },
+				noteText:
+					"Glucose readings between 6 and 10 mmol/L for 48 hours. Patient demonstrates correct insulin technique.\nFollow-up at the diabetes clinic in two weeks.",
+			},
+		],
+	},
+	{
+		id: "a1d5f8e2-9c37-4b6e-a4f1-3b8d7c2e9f06",
+		name: "Sophie Lavoie",
+		age: 29,
+		gender: "Female",
+		dateOfAdmission: "2023-10-20",
+		admittingPhysician: "Dr. Antoine Roy",
+		dischargeSummary: {
+			date: "2023-10-22",
+			diagnosis: "Acute appendicitis, post laparoscopic appendectomy",
+			medication: [
+				"Acetaminophen 1000 mg every 6 hours as needed",
+				"Ibuprofen 400 mg every 8 hours with food for 5 days",
+			],
+			instructions:
+				"No heavy lifting for 2 weeks. Keep incisions clean and dry. Seek care for fever, redness or increasing abdominal pain.",
+		},
+		nurse: "Infirmier Jean-François",
+		clinic: "CLSC de Limoilou",
+		clinicalNotes: [
+			{
+				id: "27ef2459-a08d-4b12-b46b-d39a7be2cfa8",
+				date: "2023-10-20",
+				type: { id: "CN001", name: "Admission Note" },
+				noteText:
+					"Right lower quadrant pain for 18 hours with nausea. Positive McBurney's sign. Surgery consulted.",
+			},
+			{
+				id: "38f0356a-b19e-4c23-857c-e4ab8cf3d0b9",
+				date: "2023-10-20",
+				type: { id: "CN003", name: "Lab Results" },
+				noteText:
+					"Ultrasound consistent with acute appendicitis. WBC 13.1 x10^9/L. Pregnancy test negative.",
+			},
+			{
+				id: "4901467b-c2af-4d34-968d-f5bc9d04e1ca",
+				date: "2023-10-21",
+				type: { id: "CN002", name: "Progress Note" },
+				noteText:
+					"Post-op day 1 after uncomplicated laparoscopic appendectomy. Tolerating clear fluids, pain well controlled.",
+			},
+			{
+				id: "5a12578c-d3b0-4e45-a79e-06cdae15f2db",
+				date: "2023-10-22",
+				type: { id: "CN005", name: "Discharge Note" },
+				noteText:
+					"Discharged home in good condition.\nWound check with the surgical clinic in 10 days.",
 			},
 		],
 	},
+	...morePatients.map((seed, index) => toPatient(seed, index + 1)),
 ];
 
 export default patients;
diff --git a/app-clinical-notes/src/hooks/NoteTypesContext.tsx b/app-clinical-notes/src/hooks/NoteTypesContext.tsx
new file mode 100644
index 0000000..bbe7734
--- /dev/null
+++ b/app-clinical-notes/src/hooks/NoteTypesContext.tsx
@@ -0,0 +1,19 @@
+import { createContext, useContext, type FC, type ReactNode } from "react";
+
+import { useNoteTypes, type UseNoteTypesResult } from "./useNoteTypes";
+
+const NoteTypesContext = createContext<UseNoteTypesResult | null>(null);
+
+export const NoteTypesProvider: FC<{ children: ReactNode }> = ({ children }) => (
+	<NoteTypesContext.Provider value={useNoteTypes()}>
+		{children}
+	</NoteTypesContext.Provider>
+);
+
+export const useSharedNoteTypes = (): UseNoteTypesResult => {
+	const value = useContext(NoteTypesContext);
+	if (!value) {
+		throw new Error("useSharedNoteTypes must be used inside NoteTypesProvider");
+	}
+	return value;
+};
diff --git a/app-clinical-notes/src/hooks/patientCache.ts b/app-clinical-notes/src/hooks/patientCache.ts
new file mode 100644
index 0000000..969b34c
--- /dev/null
+++ b/app-clinical-notes/src/hooks/patientCache.ts
@@ -0,0 +1,13 @@
+import type { PatientData } from "../data";
+
+const cache = new Map<string, PatientData>();
+
+export const patientCache = {
+	get: (id: string) => cache.get(id),
+	set: (patient: PatientData) => {
+		cache.set(patient.id, patient);
+	},
+	setMany: (patients: PatientData[]) => {
+		patients.forEach((patient) => cache.set(patient.id, patient));
+	},
+};
diff --git a/app-clinical-notes/src/hooks/useNoteTypes.ts b/app-clinical-notes/src/hooks/useNoteTypes.ts
new file mode 100644
index 0000000..9d045c5
--- /dev/null
+++ b/app-clinical-notes/src/hooks/useNoteTypes.ts
@@ -0,0 +1,51 @@
+import { useCallback, useEffect, useRef, useState } from "react";
+
+import client from "../client";
+import type { ClinicalNoteType } from "../data";
+import { getErrorMessage } from "../utils/errors";
+
+export interface UseNoteTypesResult {
+	noteTypes: ClinicalNoteType[];
+	loading: boolean;
+	error: string | null;
+	reload: () => void;
+}
+
+export const useNoteTypes = (): UseNoteTypesResult => {
+	const [noteTypes, setNoteTypes] = useState<ClinicalNoteType[]>([]);
+	const [loading, setLoading] = useState(true);
+	const [error, setError] = useState<string | null>(null);
+
+	const latestRequestId = useRef(0);
+	const isMounted = useRef(true);
+
+	const load = useCallback(async () => {
+		const requestId = ++latestRequestId.current;
+		const isLatest = () =>
+			isMounted.current && requestId === latestRequestId.current;
+
+		setLoading(true);
+		setError(null);
+
+		try {
+			const types = await client.fetchClinicalNoteTypes();
+			if (!isLatest()) return;
+			setNoteTypes(types);
+		} catch (caught) {
+			if (!isLatest()) return;
+			setError(getErrorMessage(caught));
+		} finally {
+			if (isLatest()) setLoading(false);
+		}
+	}, []);
+
+	useEffect(() => {
+		isMounted.current = true;
+		load();
+		return () => {
+			isMounted.current = false;
+		};
+	}, [load]);
+
+	return { noteTypes, loading, error, reload: load };
+};
diff --git a/app-clinical-notes/src/hooks/usePatient.ts b/app-clinical-notes/src/hooks/usePatient.ts
new file mode 100644
index 0000000..2b1d165
--- /dev/null
+++ b/app-clinical-notes/src/hooks/usePatient.ts
@@ -0,0 +1,94 @@
+import { useCallback, useEffect, useRef, useState } from "react";
+
+import client from "../client";
+import type { ClinicalNote, PatientData } from "../data";
+import { getErrorMessage } from "../utils/errors";
+import { patientCache } from "./patientCache";
+
+type LoadMode = "initial" | "refresh" | "silent";
+
+export interface UsePatientResult {
+	patient: PatientData | null;
+	loading: boolean;
+	refreshing: boolean;
+	error: string | null;
+	reload: () => void;
+	refresh: () => void;
+	refreshSilently: () => void;
+	addNoteLocally: (note: ClinicalNote) => void;
+}
+
+export const usePatient = (patientId: string): UsePatientResult => {
+	const [patient, setPatient] = useState<PatientData | null>(
+		() => patientCache.get(patientId) ?? null,
+	);
+	const [loading, setLoading] = useState(() => !patientCache.get(patientId));
+	const [refreshing, setRefreshing] = useState(false);
+	const [error, setError] = useState<string | null>(null);
+
+	const latestRequestId = useRef(0);
+	const isMounted = useRef(true);
+
+	const load = useCallback(async (mode: LoadMode) => {
+		const requestId = ++latestRequestId.current;
+		const isLatest = () =>
+			isMounted.current && requestId === latestRequestId.current;
+
+		if (mode === "initial") setLoading(true);
+		if (mode === "refresh") setRefreshing(true);
+		if (mode !== "silent") setError(null);
+
+		try {
+			const patients = await client.fetchPatientData();
+			if (!isLatest()) return;
+
+			const found = patients.find(({ id }) => id === patientId);
+			if (found) {
+				patientCache.set(found);
+				setPatient(found);
+				setError(null);
+			} else {
+				setError("No patient record was found.");
+			}
+		} catch (caught) {
+			if (!isLatest()) return;
+			if (mode !== "silent") setError(getErrorMessage(caught));
+		} finally {
+			if (isLatest()) {
+				setLoading(false);
+				setRefreshing(false);
+			}
+		}
+	}, [patientId]);
+
+	useEffect(() => {
+		isMounted.current = true;
+		load(patientCache.get(patientId) ? "silent" : "initial");
+		return () => {
+			isMounted.current = false;
+		};
+	}, [load, patientId]);
+
+	const addNoteLocally = useCallback((note: ClinicalNote) => {
+		setPatient((current) => {
+			if (!current) return current;
+			const next = {
+				...current,
+				clinicalNotes: [...current.clinicalNotes, note],
+			};
+			patientCache.set(next);
+			return next;
+		});
+	}, []);
+
+	return {
+		patient,
+		loading,
+		refreshing,
+		error,
+		reload: useCallback(() => load("initial"), [load]),
+		refresh: useCallback(() => load("refresh"), [load]),
+		refreshSilently: useCallback(() => load("silent"), [load]),
+		addNoteLocally,
+	};
+};
diff --git a/app-clinical-notes/src/hooks/usePatients.ts b/app-clinical-notes/src/hooks/usePatients.ts
new file mode 100644
index 0000000..51d746d
--- /dev/null
+++ b/app-clinical-notes/src/hooks/usePatients.ts
@@ -0,0 +1,71 @@
+import { useCallback, useEffect, useRef, useState } from "react";
+
+import client from "../client";
+import type { PatientData } from "../data";
+import { getErrorMessage } from "../utils/errors";
+import { patientCache } from "./patientCache";
+
+export const PAGE_SIZE = 10;
+
+type LoadMode = "initial" | "refresh";
+
+export interface UsePatientsResult {
+	patients: PatientData[] | null;
+	loading: boolean;
+	refreshing: boolean;
+	error: string | null;
+	reload: () => void;
+	refresh: () => void;
+}
+
+export const usePatients = (): UsePatientsResult => {
+	const [patients, setPatients] = useState<PatientData[] | null>(null);
+	const [loading, setLoading] = useState(true);
+	const [refreshing, setRefreshing] = useState(false);
+	const [error, setError] = useState<string | null>(null);
+
+	const latestRequestId = useRef(0);
+	const isMounted = useRef(true);
+
+	const load = useCallback(async (mode: LoadMode) => {
+		const requestId = ++latestRequestId.current;
+		const isLatest = () =>
+			isMounted.current && requestId === latestRequestId.current;
+
+		if (mode === "initial") setLoading(true);
+		if (mode === "refresh") setRefreshing(true);
+		setError(null);
+
+		try {
+			const result = await client.fetchPatientData();
+			if (!isLatest()) return;
+			patientCache.setMany(result);
+			setPatients(result);
+		} catch (caught) {
+			if (!isLatest()) return;
+			setError(getErrorMessage(caught));
+		} finally {
+			if (isLatest()) {
+				setLoading(false);
+				setRefreshing(false);
+			}
+		}
+	}, []);
+
+	useEffect(() => {
+		isMounted.current = true;
+		load("initial");
+		return () => {
+			isMounted.current = false;
+		};
+	}, [load]);
+
+	return {
+		patients,
+		loading,
+		refreshing,
+		error,
+		reload: useCallback(() => load("initial"), [load]),
+		refresh: useCallback(() => load("refresh"), [load]),
+	};
+};
diff --git a/app-clinical-notes/src/hooks/useSaveClinicalNote.ts b/app-clinical-notes/src/hooks/useSaveClinicalNote.ts
new file mode 100644
index 0000000..17c424f
--- /dev/null
+++ b/app-clinical-notes/src/hooks/useSaveClinicalNote.ts
@@ -0,0 +1,53 @@
+import { useCallback, useEffect, useRef, useState } from "react";
+
+import client from "../client";
+import type { ClinicalNote } from "../data";
+import { getErrorMessage } from "../utils/errors";
+
+export interface UseSaveClinicalNoteResult {
+	save: (patientId: string, note: ClinicalNote) => Promise<boolean>;
+	saving: boolean;
+	error: string | null;
+	clearError: () => void;
+}
+
+export const useSaveClinicalNote = (): UseSaveClinicalNoteResult => {
+	const [saving, setSaving] = useState(false);
+	const [error, setError] = useState<string | null>(null);
+
+	const inFlight = useRef(false);
+	const isMounted = useRef(true);
+
+	useEffect(() => {
+		isMounted.current = true;
+		return () => {
+			isMounted.current = false;
+		};
+	}, []);
+
+	const save = useCallback(
+		async (patientId: string, note: ClinicalNote): Promise<boolean> => {
+			if (inFlight.current) return false;
+
+			inFlight.current = true;
+			setSaving(true);
+			setError(null);
+
+			try {
+				await client.addNewClinicalNote(patientId, note);
+				return true;
+			} catch (caught) {
+				if (isMounted.current) setError(getErrorMessage(caught));
+				return false;
+			} finally {
+				inFlight.current = false;
+				if (isMounted.current) setSaving(false);
+			}
+		},
+		[],
+	);
+
+	const clearError = useCallback(() => setError(null), []);
+
+	return { save, saving, error, clearError };
+};
diff --git a/app-clinical-notes/src/navigation.ts b/app-clinical-notes/src/navigation.ts
new file mode 100644
index 0000000..9d4aeea
--- /dev/null
+++ b/app-clinical-notes/src/navigation.ts
@@ -0,0 +1,4 @@
+export type RootStackParamList = {
+	PatientList: undefined;
+	PatientOverview: { patientId: string };
+};
diff --git a/app-clinical-notes/src/screens/PatientListScreen.tsx b/app-clinical-notes/src/screens/PatientListScreen.tsx
new file mode 100644
index 0000000..7e0cc50
--- /dev/null
+++ b/app-clinical-notes/src/screens/PatientListScreen.tsx
@@ -0,0 +1,402 @@
+import Ionicons from "@expo/vector-icons/Ionicons";
+import type { NativeStackScreenProps } from "@react-navigation/native-stack";
+import {
+	useCallback,
+	useEffect,
+	useMemo,
+	useRef,
+	useState,
+	type FC,
+} from "react";
+import {
+	FlatList,
+	Pressable,
+	RefreshControl,
+	StyleSheet,
+	Text,
+	TextInput,
+	View,
+} from "react-native";
+import { useSafeAreaInsets } from "react-native-safe-area-context";
+
+import Button from "../components/Button";
+import ErrorBanner from "../components/ErrorBanner";
+import SortSheet from "../components/SortSheet";
+import StatusView from "../components/StatusView";
+import type { PatientData } from "../data";
+import { PAGE_SIZE, usePatients } from "../hooks/usePatients";
+import type { RootStackParamList } from "../navigation";
+import { colors, radius, spacing } from "../theme";
+import { formatDate } from "../utils/date";
+import {
+	filterPatients,
+	pageCount,
+	pageOf,
+	PATIENT_SORT_OPTIONS,
+	sortPatients,
+	type PatientSortKey,
+} from "../utils/patients";
+
+type Props = NativeStackScreenProps<RootStackParamList, "PatientList">;
+
+const PatientListScreen: FC<Props> = ({ navigation }) => {
+	const insets = useSafeAreaInsets();
+	const listRef = useRef<FlatList<PatientData>>(null);
+	const { patients, loading, refreshing, error, reload, refresh } =
+		usePatients();
+
+	const [query, setQuery] = useState("");
+	const [isSearchOpen, setSearchOpen] = useState(false);
+	const [sortKey, setSortKey] = useState<PatientSortKey>("admitted");
+	const [isSortOpen, setSortOpen] = useState(false);
+	const [page, setPage] = useState(0);
+
+	const sortedPatients = useMemo(
+		() =>
+			patients ? sortPatients(filterPatients(patients, query), sortKey) : null,
+		[patients, query, sortKey],
+	);
+	const sortLabel =
+		PATIENT_SORT_OPTIONS.find(({ key }) => key === sortKey)?.label ?? "";
+	const totalPages = pageCount(sortedPatients?.length ?? 0, PAGE_SIZE);
+	const currentPage = Math.min(page, totalPages - 1);
+	const pagePatients = useMemo(
+		() =>
+			sortedPatients ? pageOf(sortedPatients, currentPage, PAGE_SIZE) : [],
+		[sortedPatients, currentPage],
+	);
+
+	const changeSort = (key: PatientSortKey) => {
+		setSortKey(key);
+		setPage(0);
+	};
+
+	const changeQuery = (text: string) => {
+		setQuery(text);
+		setPage(0);
+	};
+
+	const showSearch = isSearchOpen || query.length > 0;
+
+	const toggleSearch = () => {
+		if (!showSearch) {
+			setSearchOpen(true);
+		} else if (query.length === 0) {
+			setSearchOpen(false);
+		}
+	};
+
+	const clearOrCloseSearch = () => {
+		if (query.length > 0) {
+			changeQuery("");
+		} else {
+			setSearchOpen(false);
+		}
+	};
+
+	useEffect(() => {
+		listRef.current?.scrollToOffset({ offset: 0, animated: true });
+	}, [currentPage, sortKey]);
+
+	const renderPatient = useCallback(
+		({ item }: { item: PatientData }) => (
+			<Pressable
+				accessibilityRole="button"
+				accessibilityHint="Opens the patient's overview"
+				onPress={() =>
+					navigation.navigate("PatientOverview", { patientId: item.id })
+				}
+				style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
+			>
+				<View style={styles.row}>
+					<Text style={styles.name}>{item.name}</Text>
+					<Text style={styles.chevron}>›</Text>
+				</View>
+				<Text style={styles.meta}>
+					{item.age} · {item.gender} · Admitted{" "}
+					{formatDate(item.dateOfAdmission)}
+				</Text>
+				<Text style={styles.diagnosis}>{item.dischargeSummary.diagnosis}</Text>
+			</Pressable>
+		),
+		[navigation],
+	);
+
+	if (!sortedPatients) {
+		if (loading) {
+			return <StatusView loading message="Loading patients…" />;
+		}
+		return (
+			<StatusView
+				title="Couldn't load patients"
+				message={error ?? "Something went wrong."}
+				onRetry={reload}
+			/>
+		);
+	}
+
+	const firstShown = currentPage * PAGE_SIZE + 1;
+	const lastShown = currentPage * PAGE_SIZE + pagePatients.length;
+
+	return (
+		<>
+			<FlatList
+				ref={listRef}
+				data={pagePatients}
+				keyExtractor={(patient) => patient.id}
+				renderItem={renderPatient}
+				contentContainerStyle={[
+					styles.content,
+					{ paddingBottom: spacing.xl + insets.bottom },
+				]}
+				refreshControl={
+					<RefreshControl
+						refreshing={refreshing}
+						onRefresh={refresh}
+						tintColor={colors.primary}
+						colors={[colors.primary]}
+					/>
+				}
+				ListHeaderComponent={
+					<>
+						{error && (
+							<ErrorBanner
+								message={`${error} Showing the last loaded data.`}
+								actionLabel="Retry"
+								onAction={refresh}
+							/>
+						)}
+						<View style={styles.toolbar}>
+							<Text style={styles.sectionTitle} accessibilityRole="header">
+								Patients
+							</Text>
+							<Pressable
+								testID="open-search"
+								accessibilityRole="button"
+								accessibilityLabel={
+									showSearch ? "Close search" : "Search patients"
+								}
+								accessibilityState={{ expanded: showSearch }}
+								onPress={toggleSearch}
+								style={({ pressed }) => [
+									styles.iconButton,
+									showSearch && styles.iconButtonActive,
+									pressed && styles.iconButtonPressed,
+								]}
+							>
+								<Ionicons name="search" size={20} color={colors.primary} />
+							</Pressable>
+							<Pressable
+								testID="open-sort"
+								accessibilityRole="button"
+								accessibilityLabel={`Sort, currently ${sortLabel}`}
+								onPress={() => setSortOpen(true)}
+								style={({ pressed }) => [
+									styles.iconButton,
+									pressed && styles.iconButtonPressed,
+								]}
+							>
+								<Ionicons
+									name="swap-vertical"
+									size={20}
+									color={colors.primary}
+								/>
+							</Pressable>
+						</View>
+						{showSearch && (
+							<View style={styles.searchBox}>
+								<Ionicons name="search" size={18} color={colors.textMuted} />
+								<TextInput
+									testID="patient-search"
+									accessibilityLabel="Search patients"
+									style={styles.searchInput}
+									value={query}
+									onChangeText={changeQuery}
+									onBlur={() => setSearchOpen(false)}
+									autoFocus
+									placeholder="Search name, diagnosis or ID"
+									placeholderTextColor={colors.textMuted}
+									autoCorrect={false}
+									autoCapitalize="none"
+									returnKeyType="search"
+									clearButtonMode="never"
+								/>
+								<Pressable
+									accessibilityRole="button"
+									accessibilityLabel={
+										query.length > 0 ? "Clear search" : "Close search"
+									}
+									onPress={clearOrCloseSearch}
+									hitSlop={8}
+								>
+									<Ionicons
+										name="close-circle"
+										size={18}
+										color={colors.textMuted}
+									/>
+								</Pressable>
+							</View>
+						)}
+						{sortedPatients.length > 0 && (
+							<Text style={styles.range} accessibilityLiveRegion="polite">
+								{firstShown}–{lastShown} of {sortedPatients.length}
+								{query.trim() ? ` matching "${query.trim()}"` : ""}
+							</Text>
+						)}
+					</>
+				}
+				ListFooterComponent={
+					totalPages > 1 ? (
+						<View style={styles.pager}>
+							<Button
+								title="‹ Prev"
+								variant="secondary"
+								onPress={() => setPage(currentPage - 1)}
+								disabled={currentPage === 0}
+								style={styles.pagerButton}
+							/>
+							<Text style={styles.pagerText} accessibilityLiveRegion="polite">
+								Page {currentPage + 1} of {totalPages}
+							</Text>
+							<Button
+								title="Next ›"
+								variant="secondary"
+								onPress={() => setPage(currentPage + 1)}
+								disabled={currentPage >= totalPages - 1}
+								style={styles.pagerButton}
+							/>
+						</View>
+					) : null
+				}
+				ListEmptyComponent={
+					<Text style={styles.empty}>
+						{query.trim()
+							? `No patients match "${query.trim()}".`
+							: "No patients yet."}
+					</Text>
+				}
+				keyboardShouldPersistTaps="handled"
+				keyboardDismissMode="on-drag"
+			/>
+			<SortSheet
+				visible={isSortOpen}
+				options={PATIENT_SORT_OPTIONS}
+				selected={sortKey}
+				onSelect={changeSort}
+				onClose={() => setSortOpen(false)}
+			/>
+		</>
+	);
+};
+
+const styles = StyleSheet.create({
+	content: {
+		padding: spacing.lg,
+	},
+	sectionTitle: {
+		flex: 1,
+		fontSize: 20,
+		fontWeight: "700",
+		color: colors.text,
+	},
+	toolbar: {
+		flexDirection: "row",
+		alignItems: "center",
+		gap: spacing.sm,
+		marginBottom: spacing.sm,
+	},
+	searchBox: {
+		flexDirection: "row",
+		alignItems: "center",
+		gap: spacing.sm,
+		backgroundColor: colors.card,
+		borderRadius: radius.card,
+		borderWidth: 1,
+		borderColor: colors.border,
+		paddingHorizontal: spacing.md,
+		minHeight: 44,
+		marginBottom: spacing.sm,
+	},
+	searchInput: {
+		flex: 1,
+		fontSize: 16,
+		color: colors.text,
+		paddingVertical: spacing.sm,
+	},
+	iconButton: {
+		width: 44,
+		height: 44,
+		borderRadius: radius.card,
+		borderWidth: 1,
+		borderColor: colors.border,
+		backgroundColor: colors.card,
+		alignItems: "center",
+		justifyContent: "center",
+	},
+	iconButtonActive: {
+		borderColor: colors.primary,
+	},
+	iconButtonPressed: {
+		backgroundColor: colors.chipBackground,
+	},
+	range: {
+		fontSize: 14,
+		color: colors.textMuted,
+		marginBottom: spacing.md,
+	},
+	card: {
+		backgroundColor: colors.card,
+		borderRadius: radius.card,
+		borderWidth: 1,
+		borderColor: colors.border,
+		padding: spacing.lg,
+		marginBottom: spacing.md,
+		gap: spacing.xs,
+	},
+	cardPressed: {
+		backgroundColor: colors.chipBackground,
+	},
+	row: {
+		flexDirection: "row",
+		justifyContent: "space-between",
+		alignItems: "center",
+	},
+	name: {
+		fontSize: 18,
+		fontWeight: "600",
+		color: colors.text,
+	},
+	chevron: {
+		fontSize: 24,
+		color: colors.textMuted,
+	},
+	meta: {
+		fontSize: 14,
+		color: colors.textMuted,
+	},
+	diagnosis: {
+		fontSize: 15,
+		color: colors.text,
+	},
+	empty: {
+		textAlign: "center",
+		color: colors.textMuted,
+		paddingVertical: spacing.xl,
+	},
+	pager: {
+		flexDirection: "row",
+		alignItems: "center",
+		gap: spacing.md,
+		marginTop: spacing.sm,
+	},
+	pagerButton: {
+		flex: 1,
+	},
+	pagerText: {
+		fontSize: 15,
+		fontWeight: "600",
+		color: colors.text,
+	},
+});
+
+export default PatientListScreen;
diff --git a/app-clinical-notes/src/screens/PatientOverviewScreen.tsx b/app-clinical-notes/src/screens/PatientOverviewScreen.tsx
new file mode 100644
index 0000000..1643b05
--- /dev/null
+++ b/app-clinical-notes/src/screens/PatientOverviewScreen.tsx
@@ -0,0 +1,179 @@
+import type { NativeStackScreenProps } from "@react-navigation/native-stack";
+import { useCallback, useMemo, useState, type FC } from "react";
+import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
+import { useSafeAreaInsets } from "react-native-safe-area-context";
+
+import AddNoteModal from "../components/AddNoteModal";
+import Button from "../components/Button";
+import ClinicalNote from "../components/ClinicalNote";
+import ErrorBanner from "../components/ErrorBanner";
+import NoteTypeFilter from "../components/NoteTypeFilter";
+import PatientInfo from "../components/PatientInfo";
+import StatusView from "../components/StatusView";
+import type { ClinicalNote as ClinicalNoteData } from "../data";
+import { useSharedNoteTypes } from "../hooks/NoteTypesContext";
+import { usePatient } from "../hooks/usePatient";
+import type { RootStackParamList } from "../navigation";
+import { colors, spacing } from "../theme";
+import {
+	countNotesByType,
+	filterNotesByType,
+	sortNotesNewestFirst,
+} from "../utils/notes";
+
+type Props = NativeStackScreenProps<RootStackParamList, "PatientOverview">;
+
+const PatientOverviewScreen: FC<Props> = ({ route }) => {
+	const insets = useSafeAreaInsets();
+	const {
+		patient,
+		loading,
+		refreshing,
+		error,
+		reload,
+		refresh,
+		refreshSilently,
+		addNoteLocally,
+	} = usePatient(route.params.patientId);
+	const noteTypes = useSharedNoteTypes();
+
+	const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
+	const [isModalVisible, setModalVisible] = useState(false);
+
+	const allNotes = useMemo(
+		() => sortNotesNewestFirst(patient?.clinicalNotes ?? []),
+		[patient?.clinicalNotes],
+	);
+	const visibleNotes = useMemo(
+		() => filterNotesByType(allNotes, selectedTypeId),
+		[allNotes, selectedTypeId],
+	);
+	const filterOptions = useMemo(() => countNotesByType(allNotes), [allNotes]);
+
+	const openModal = useCallback(() => setModalVisible(true), []);
+	const closeModal = useCallback(() => setModalVisible(false), []);
+
+	const handleNoteSaved = useCallback(
+		(note: ClinicalNoteData) => {
+			setModalVisible(false);
+			addNoteLocally(note);
+			setSelectedTypeId(null);
+			refreshSilently();
+		},
+		[addNoteLocally, refreshSilently],
+	);
+
+	const renderNote = useCallback(
+		({ item }: { item: ClinicalNoteData }) => <ClinicalNote note={item} />,
+		[],
+	);
+
+	if (!patient) {
+		if (loading) {
+			return <StatusView loading message="Loading patient information…" />;
+		}
+		return (
+			<StatusView
+				title="Couldn't load the patient"
+				message={error ?? "Something went wrong."}
+				onRetry={reload}
+			/>
+		);
+	}
+
+	return (
+		<View style={styles.container}>
+			<FlatList
+				data={visibleNotes}
+				keyExtractor={(note) => note.id}
+				renderItem={renderNote}
+				contentContainerStyle={[
+					styles.content,
+					{ paddingBottom: spacing.xl + insets.bottom },
+				]}
+				refreshControl={
+					<RefreshControl
+						refreshing={refreshing}
+						onRefresh={refresh}
+						tintColor={colors.primary}
+						colors={[colors.primary]}
+					/>
+				}
+				ListHeaderComponent={
+					<>
+						{error && (
+							<ErrorBanner
+								message={`${error} Showing the last loaded data.`}
+								actionLabel="Retry"
+								onAction={refresh}
+							/>
+						)}
+						<PatientInfo patient={patient} />
+						<Text style={styles.sectionTitle} accessibilityRole="header">
+							Clinical Notes
+						</Text>
+						{allNotes.length > 0 && (
+							<NoteTypeFilter
+								options={filterOptions}
+								totalCount={allNotes.length}
+								selectedTypeId={selectedTypeId}
+								onChange={setSelectedTypeId}
+							/>
+						)}
+					</>
+				}
+				ListEmptyComponent={
+					<Text style={styles.empty}>
+						{allNotes.length === 0
+							? "No clinical notes yet."
+							: "No notes of this type."}
+					</Text>
+				}
+				ListFooterComponent={
+					<Button
+						testID="open-add-note"
+						title="Add New Clinical Note"
+						onPress={openModal}
+						style={styles.addButton}
+					/>
+				}
+			/>
+
+			<AddNoteModal
+				visible={isModalVisible}
+				onClose={closeModal}
+				patientId={patient.id}
+				noteTypes={noteTypes.noteTypes}
+				noteTypesLoading={noteTypes.loading}
+				noteTypesError={noteTypes.error}
+				onRetryNoteTypes={noteTypes.reload}
+				onSaved={handleNoteSaved}
+			/>
+		</View>
+	);
+};
+
+const styles = StyleSheet.create({
+	container: {
+		flex: 1,
+	},
+	content: {
+		padding: spacing.lg,
+	},
+	sectionTitle: {
+		fontSize: 20,
+		fontWeight: "700",
+		color: colors.text,
+		marginBottom: spacing.md,
+	},
+	empty: {
+		textAlign: "center",
+		color: colors.textMuted,
+		paddingVertical: spacing.xl,
+	},
+	addButton: {
+		marginTop: spacing.md,
+	},
+});
+
+export default PatientOverviewScreen;
diff --git a/app-clinical-notes/src/theme.ts b/app-clinical-notes/src/theme.ts
new file mode 100644
index 0000000..c442657
--- /dev/null
+++ b/app-clinical-notes/src/theme.ts
@@ -0,0 +1,26 @@
+export const colors = {
+	primary: "#007bff",
+	primaryPressed: "#0062cc",
+	background: "#f2f4f7",
+	card: "#ffffff",
+	text: "#1f2933",
+	textMuted: "#616e7c",
+	border: "#e4e7eb",
+	danger: "#c62828",
+	dangerBackground: "#fdecea",
+	chipBackground: "#e8f1ff",
+	white: "#ffffff",
+};
+
+export const spacing = {
+	xs: 4,
+	sm: 8,
+	md: 12,
+	lg: 16,
+	xl: 24,
+};
+
+export const radius = {
+	card: 12,
+	pill: 999,
+};
diff --git a/app-clinical-notes/src/utils/clinicalNote.test.ts b/app-clinical-notes/src/utils/clinicalNote.test.ts
new file mode 100644
index 0000000..28f7041
--- /dev/null
+++ b/app-clinical-notes/src/utils/clinicalNote.test.ts
@@ -0,0 +1,33 @@
+import noteTypes from "../data/noteType";
+import { buildClinicalNote, generateId } from "./clinicalNote";
+
+describe("clinicalNote utils", () => {
+	it("generateId returns a v4-shaped id, different each time", () => {
+		const a = generateId();
+		const b = generateId();
+
+		expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
+		expect(a).not.toBe(b);
+	});
+
+	it("buildClinicalNote trims input and attaches the full type object", () => {
+		const note = buildClinicalNote(
+			{ typeId: "CN003", date: " 2026-10-29 ", text: "  Lab ok.  " },
+			noteTypes,
+			"note-1",
+		);
+
+		expect(note).toEqual({
+			id: "note-1",
+			date: "2026-10-29",
+			type: { id: "CN003", name: "Lab Results" },
+			noteText: "Lab ok.",
+		});
+	});
+
+	it("buildClinicalNote returns null for an unknown type", () => {
+		expect(
+			buildClinicalNote({ typeId: "NOPE", date: "2026-10-29", text: "x" }, noteTypes, "id"),
+		).toBeNull();
+	});
+});
diff --git a/app-clinical-notes/src/utils/clinicalNote.ts b/app-clinical-notes/src/utils/clinicalNote.ts
new file mode 100644
index 0000000..47883bd
--- /dev/null
+++ b/app-clinical-notes/src/utils/clinicalNote.ts
@@ -0,0 +1,28 @@
+import type { ClinicalNote, ClinicalNoteType } from "../data";
+import type { NoteDraft } from "./validateNote";
+
+export const generateId = (): string =>
+	"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
+		const random = (Math.random() * 16) | 0;
+		const value = char === "x" ? random : (random & 0x3) | 0x8;
+		return value.toString(16);
+	});
+
+export const buildClinicalNote = (
+	draft: NoteDraft,
+	noteTypes: ClinicalNoteType[],
+	id: string,
+): ClinicalNote | null => {
+	const type = noteTypes.find((noteType) => noteType.id === draft.typeId);
+
+	if (!type) {
+		return null;
+	}
+
+	return {
+		id,
+		date: draft.date.trim(),
+		type,
+		noteText: draft.text.trim(),
+	};
+};
diff --git a/app-clinical-notes/src/utils/date.test.ts b/app-clinical-notes/src/utils/date.test.ts
new file mode 100644
index 0000000..b830139
--- /dev/null
+++ b/app-clinical-notes/src/utils/date.test.ts
@@ -0,0 +1,51 @@
+import {
+	formatDate,
+	parseISODate,
+	toISODate,
+	todayISO,
+} from "./date";
+
+describe("date utils", () => {
+	describe("parseISODate", () => {
+		it("parses a valid date in LOCAL time (no off-by-one-day)", () => {
+			const date = parseISODate("2023-07-15");
+
+			expect(date?.getFullYear()).toBe(2023);
+			expect(date?.getMonth()).toBe(6);
+			expect(date?.getDate()).toBe(15);
+		});
+
+		it.each(["2023-02-31", "2023-13-01", "2023-7-15", "15/07/2023", "", "abc"])(
+			"rejects %p",
+			(value) => {
+				expect(parseISODate(value)).toBeNull();
+			},
+		);
+
+		it("accepts Feb 29 only in a leap year", () => {
+			expect(parseISODate("2024-02-29")).not.toBeNull();
+			expect(parseISODate("2023-02-29")).toBeNull();
+		});
+	});
+
+	describe("formatDate", () => {
+		it("formats as an unambiguous 'Mon D, YYYY'", () => {
+			expect(formatDate("2023-07-15")).toBe("Jul 15, 2023");
+			expect(formatDate("2024-01-01")).toBe("Jan 1, 2024");
+		});
+
+		it("returns malformed values unchanged instead of 'Invalid Date'", () => {
+			expect(formatDate("not-a-date")).toBe("not-a-date");
+		});
+	});
+
+	describe("toISODate / todayISO", () => {
+		it("zero-pads month and day", () => {
+			expect(toISODate(new Date(2023, 0, 5))).toBe("2023-01-05");
+		});
+
+		it("uses the injected 'now'", () => {
+			expect(todayISO(new Date(2026, 9, 30))).toBe("2026-10-30");
+		});
+	});
+});
diff --git a/app-clinical-notes/src/utils/date.ts b/app-clinical-notes/src/utils/date.ts
new file mode 100644
index 0000000..69f1ed2
--- /dev/null
+++ b/app-clinical-notes/src/utils/date.ts
@@ -0,0 +1,41 @@
+const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
+
+const MONTHS = [
+	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
+	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
+];
+
+export const toISODate = (date: Date): string => {
+	const year = date.getFullYear();
+	const month = String(date.getMonth() + 1).padStart(2, "0");
+	const day = String(date.getDate()).padStart(2, "0");
+	return `${year}-${month}-${day}`;
+};
+
+export const todayISO = (now: Date = new Date()): string => toISODate(now);
+
+export const parseISODate = (value: string): Date | null => {
+	if (!ISO_DATE_PATTERN.test(value)) {
+		return null;
+	}
+
+	const [year, month, day] = value.split("-").map(Number);
+	const date = new Date(year, month - 1, day);
+
+	const isSameDate =
+		date.getFullYear() === year &&
+		date.getMonth() === month - 1 &&
+		date.getDate() === day;
+
+	return isSameDate ? date : null;
+};
+
+export const formatDate = (value: string): string => {
+	const date = parseISODate(value);
+
+	if (!date) {
+		return value;
+	}
+
+	return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
+};
diff --git a/app-clinical-notes/src/utils/errors.test.ts b/app-clinical-notes/src/utils/errors.test.ts
new file mode 100644
index 0000000..7978538
--- /dev/null
+++ b/app-clinical-notes/src/utils/errors.test.ts
@@ -0,0 +1,15 @@
+import { getErrorMessage } from "./errors";
+
+describe("getErrorMessage", () => {
+	it("hides the mock client's synthetic error behind a friendly message", () => {
+		expect(getErrorMessage(new Error("A synthetic error happened"))).toMatch(/try again/i);
+	});
+
+	it("explains a missing patient", () => {
+		expect(getErrorMessage(new Error("Patient not found"))).toMatch(/could not be found/);
+	});
+
+	it("handles non-Error throws", () => {
+		expect(getErrorMessage("boom")).toMatch(/try again/i);
+	});
+});
diff --git a/app-clinical-notes/src/utils/errors.ts b/app-clinical-notes/src/utils/errors.ts
new file mode 100644
index 0000000..545b5e5
--- /dev/null
+++ b/app-clinical-notes/src/utils/errors.ts
@@ -0,0 +1,7 @@
+export const getErrorMessage = (error: unknown): string => {
+	if (error instanceof Error && error.message === "Patient not found") {
+		return "This patient could not be found.";
+	}
+
+	return "We couldn't reach the server. Please try again.";
+};
diff --git a/app-clinical-notes/src/utils/notes.test.ts b/app-clinical-notes/src/utils/notes.test.ts
new file mode 100644
index 0000000..c1042a1
--- /dev/null
+++ b/app-clinical-notes/src/utils/notes.test.ts
@@ -0,0 +1,64 @@
+import type { ClinicalNote } from "../data";
+import noteTypes from "../data/noteType";
+import { countNotesByType, filterNotesByType, sortNotesNewestFirst } from "./notes";
+
+const [admission, progress, lab] = noteTypes;
+
+const note = (id: string, date: string, type = progress): ClinicalNote => ({
+	id,
+	date,
+	type,
+	noteText: `note ${id}`,
+});
+
+describe("notes utils", () => {
+	describe("sortNotesNewestFirst", () => {
+		it("puts the newest date first", () => {
+			const notes = [note("a", "2023-07-15"), note("b", "2023-07-17"), note("c", "2023-07-16")];
+
+			expect(sortNotesNewestFirst(notes).map((n) => n.id)).toEqual(["b", "c", "a"]);
+		});
+
+		it("shows the most recently ADDED note first when dates are equal", () => {
+			const notes = [note("older", "2023-07-15"), note("newer", "2023-07-15")];
+
+			expect(sortNotesNewestFirst(notes).map((n) => n.id)).toEqual(["newer", "older"]);
+		});
+
+		it("does not mutate the input (it's React state)", () => {
+			const notes = [note("a", "2023-07-15"), note("b", "2023-07-17")];
+			const copy = [...notes];
+
+			sortNotesNewestFirst(notes);
+
+			expect(notes).toEqual(copy);
+		});
+	});
+
+	describe("filterNotesByType", () => {
+		const notes = [note("a", "2023-07-15", admission), note("b", "2023-07-16", lab)];
+
+		it("returns everything for 'All' (null)", () => {
+			expect(filterNotesByType(notes, null)).toBe(notes);
+		});
+
+		it("keeps only the selected type", () => {
+			expect(filterNotesByType(notes, lab.id).map((n) => n.id)).toEqual(["b"]);
+		});
+	});
+
+	describe("countNotesByType", () => {
+		it("counts per type in first-seen order", () => {
+			const notes = [
+				note("a", "2023-07-15", lab),
+				note("b", "2023-07-16", admission),
+				note("c", "2023-07-17", lab),
+			];
+
+			expect(countNotesByType(notes)).toEqual([
+				{ type: lab, count: 2 },
+				{ type: admission, count: 1 },
+			]);
+		});
+	});
+});
diff --git a/app-clinical-notes/src/utils/notes.ts b/app-clinical-notes/src/utils/notes.ts
new file mode 100644
index 0000000..beac90a
--- /dev/null
+++ b/app-clinical-notes/src/utils/notes.ts
@@ -0,0 +1,32 @@
+import type { ClinicalNote, ClinicalNoteType } from "../data";
+
+export const sortNotesNewestFirst = (notes: ClinicalNote[]): ClinicalNote[] =>
+	notes
+		.map((note, index) => ({ note, index }))
+		.sort(
+			(a, b) => b.note.date.localeCompare(a.note.date) || b.index - a.index,
+		)
+		.map(({ note }) => note);
+
+export const filterNotesByType = (
+	notes: ClinicalNote[],
+	typeId: string | null,
+): ClinicalNote[] =>
+	typeId === null ? notes : notes.filter((note) => note.type.id === typeId);
+
+export const countNotesByType = (
+	notes: ClinicalNote[],
+): { type: ClinicalNoteType; count: number }[] => {
+	const counts = new Map<string, { type: ClinicalNoteType; count: number }>();
+
+	notes.forEach((note) => {
+		const entry = counts.get(note.type.id);
+		if (entry) {
+			entry.count += 1;
+		} else {
+			counts.set(note.type.id, { type: note.type, count: 1 });
+		}
+	});
+
+	return [...counts.values()];
+};
diff --git a/app-clinical-notes/src/utils/patients.test.ts b/app-clinical-notes/src/utils/patients.test.ts
new file mode 100644
index 0000000..ed150cd
--- /dev/null
+++ b/app-clinical-notes/src/utils/patients.test.ts
@@ -0,0 +1,120 @@
+import type { PatientData } from "../data";
+import seed from "../data/patients";
+import { filterPatients, pageCount, pageOf, sortPatients } from "./patients";
+
+const patient = (
+	name: string,
+	age: number,
+	dateOfAdmission: string,
+): PatientData => ({ ...seed[0], id: name, name, age, dateOfAdmission });
+
+const patients = [
+	patient("Marie Tremblay", 67, "2023-08-02"),
+	patient("Sophie Lavoie", 29, "2023-10-20"),
+	patient("Ahmed Benali", 54, "2023-09-11"),
+];
+
+const names = (list: PatientData[]) => list.map((p) => p.name);
+
+describe("sortPatients", () => {
+	it("sorts by most recent admission first", () => {
+		expect(names(sortPatients(patients, "admitted"))).toEqual([
+			"Sophie Lavoie",
+			"Ahmed Benali",
+			"Marie Tremblay",
+		]);
+	});
+
+	it("sorts by last name, ignoring accents and case", () => {
+		const list = [...patients, patient("Élise lacroix", 40, "2023-01-01")];
+
+		expect(names(sortPatients(list, "name"))).toEqual([
+			"Ahmed Benali",
+			"Élise lacroix",
+			"Sophie Lavoie",
+			"Marie Tremblay",
+		]);
+	});
+
+	it("sorts by age, oldest first, then by name on ties", () => {
+		const list = [...patients, patient("Paul Arsenault", 54, "2023-01-01")];
+
+		expect(names(sortPatients(list, "age"))).toEqual([
+			"Marie Tremblay",
+			"Paul Arsenault",
+			"Ahmed Benali",
+			"Sophie Lavoie",
+		]);
+	});
+
+	it("falls back to id so the order is total (paging relies on it)", () => {
+		const twins = [
+			{ ...patient("Ana Roy", 40, "2023-01-01"), id: "b" },
+			{ ...patient("Ana Roy", 40, "2023-01-01"), id: "a" },
+		];
+
+		expect(sortPatients(twins, "age").map((p) => p.id)).toEqual(["a", "b"]);
+	});
+
+	it("does not mutate the input", () => {
+		const copy = [...patients];
+
+		sortPatients(patients, "name");
+
+		expect(patients).toEqual(copy);
+	});
+});
+
+describe("pageCount", () => {
+	it("rounds up to whole pages", () => {
+		expect(pageCount(24, 10)).toBe(3);
+		expect(pageCount(20, 10)).toBe(2);
+	});
+
+	it("is 1 for an empty list", () => {
+		expect(pageCount(0, 10)).toBe(1);
+	});
+});
+
+describe("pageOf", () => {
+	const items = Array.from({ length: 24 }, (_, i) => i);
+
+	it("returns the items on a 0-based page", () => {
+		expect(pageOf(items, 0, 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
+		expect(pageOf(items, 2, 10)).toEqual([20, 21, 22, 23]);
+	});
+
+	it("returns nothing past the last page", () => {
+		expect(pageOf(items, 3, 10)).toEqual([]);
+	});
+});
+
+describe("filterPatients", () => {
+	const list = [
+		{ ...patient("Marie Tremblay", 67, "2023-08-02"), id: "5f2a-marie" },
+		{ ...patient("Hélène Caron", 88, "2024-09-18"), id: "8c3e-helene" },
+	];
+	list[0].dischargeSummary = { ...list[0].dischargeSummary, diagnosis: "Pneumonia" };
+
+	const found = (query: string) => names(filterPatients(list, query));
+
+	it("returns everyone for an empty or blank query", () => {
+		expect(found("")).toEqual(["Marie Tremblay", "Hélène Caron"]);
+		expect(found("   ")).toEqual(["Marie Tremblay", "Hélène Caron"]);
+	});
+
+	it("ignores case and accents", () => {
+		expect(found("HELENE")).toEqual(["Hélène Caron"]);
+		expect(found("hélène")).toEqual(["Hélène Caron"]);
+	});
+
+	it("matches the diagnosis and the patient id", () => {
+		expect(found("pneumo")).toEqual(["Marie Tremblay"]);
+		expect(found("8c3e")).toEqual(["Hélène Caron"]);
+	});
+
+	it("needs every word, in any order", () => {
+		expect(found("pneu marie")).toEqual(["Marie Tremblay"]);
+		expect(found("pneu helene")).toEqual([]);
+	});
+});
diff --git a/app-clinical-notes/src/utils/patients.ts b/app-clinical-notes/src/utils/patients.ts
new file mode 100644
index 0000000..03c0b8e
--- /dev/null
+++ b/app-clinical-notes/src/utils/patients.ts
@@ -0,0 +1,58 @@
+import type { PatientData } from "../data";
+
+export type PatientSortKey = "admitted" | "name" | "age";
+
+export const PATIENT_SORT_OPTIONS: { key: PatientSortKey; label: string }[] = [
+	{ key: "admitted", label: "Recently admitted" },
+	{ key: "name", label: "Name (A–Z)" },
+	{ key: "age", label: "Age (oldest)" },
+];
+
+const lastName = (name: string) => name.trim().split(/\s+/).pop() ?? name;
+
+const byName = (a: PatientData, b: PatientData) =>
+	lastName(a.name).localeCompare(lastName(b.name), undefined, {
+		sensitivity: "base",
+	}) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
+
+const comparators: Record<
+	PatientSortKey,
+	(a: PatientData, b: PatientData) => number
+> = {
+	admitted: (a, b) =>
+		b.dateOfAdmission.localeCompare(a.dateOfAdmission) || byName(a, b),
+	name: byName,
+	age: (a, b) => b.age - a.age || byName(a, b),
+};
+
+export const sortPatients = (
+	patients: PatientData[],
+	key: PatientSortKey,
+): PatientData[] =>
+	[...patients].sort(
+		(a, b) => comparators[key](a, b) || a.id.localeCompare(b.id),
+	);
+
+const normalize = (text: string) =>
+	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
+
+export const filterPatients = (
+	patients: PatientData[],
+	query: string,
+): PatientData[] => {
+	const words = normalize(query).split(/\s+/).filter(Boolean);
+	if (words.length === 0) return patients;
+
+	return patients.filter((patient) => {
+		const haystack = normalize(
+			`${patient.name} ${patient.dischargeSummary.diagnosis} ${patient.id}`,
+		);
+		return words.every((word) => haystack.includes(word));
+	});
+};
+
+export const pageCount = (total: number, pageSize: number): number =>
+	Math.max(1, Math.ceil(total / pageSize));
+
+export const pageOf = <T>(items: T[], page: number, pageSize: number): T[] =>
+	items.slice(page * pageSize, (page + 1) * pageSize);
diff --git a/app-clinical-notes/src/utils/validateNote.test.ts b/app-clinical-notes/src/utils/validateNote.test.ts
new file mode 100644
index 0000000..9b8d05d
--- /dev/null
+++ b/app-clinical-notes/src/utils/validateNote.test.ts
@@ -0,0 +1,52 @@
+import { hasErrors, MAX_NOTE_LENGTH, validateNote, type NoteDraft } from "./validateNote";
+
+const TODAY = "2026-10-30";
+
+const validDraft: NoteDraft = {
+	typeId: "CN002",
+	date: "2026-10-29",
+	text: "Patient resting comfortably.",
+};
+
+describe("validateNote", () => {
+	it("accepts a valid draft", () => {
+		expect(validateNote(validDraft, TODAY)).toEqual({});
+		expect(hasErrors(validateNote(validDraft, TODAY))).toBe(false);
+	});
+
+	it("accepts today's date", () => {
+		expect(validateNote({ ...validDraft, date: TODAY }, TODAY)).toEqual({});
+	});
+
+	it("requires a note type", () => {
+		expect(validateNote({ ...validDraft, typeId: null }, TODAY).typeId).toBeDefined();
+	});
+
+	it("rejects a malformed or impossible date", () => {
+		expect(validateNote({ ...validDraft, date: "2026/10/29" }, TODAY).date).toBeDefined();
+		expect(validateNote({ ...validDraft, date: "2026-02-30" }, TODAY).date).toBeDefined();
+	});
+
+	it("rejects a future date", () => {
+		const errors = validateNote({ ...validDraft, date: "2026-10-31" }, TODAY);
+
+		expect(errors.date).toMatch(/future/);
+	});
+
+	it("rejects empty or whitespace-only text", () => {
+		expect(validateNote({ ...validDraft, text: "" }, TODAY).text).toBeDefined();
+		expect(validateNote({ ...validDraft, text: "   \n  " }, TODAY).text).toBeDefined();
+	});
+
+	it("rejects text over the max length", () => {
+		const text = "a".repeat(MAX_NOTE_LENGTH + 1);
+
+		expect(validateNote({ ...validDraft, text }, TODAY).text).toBeDefined();
+	});
+
+	it("reports every problem at once, not one at a time", () => {
+		const errors = validateNote({ typeId: null, date: "", text: "" }, TODAY);
+
+		expect(Object.keys(errors).sort()).toEqual(["date", "text", "typeId"]);
+	});
+});
diff --git a/app-clinical-notes/src/utils/validateNote.ts b/app-clinical-notes/src/utils/validateNote.ts
new file mode 100644
index 0000000..3ebb84d
--- /dev/null
+++ b/app-clinical-notes/src/utils/validateNote.ts
@@ -0,0 +1,42 @@
+import { parseISODate, todayISO } from "./date";
+
+export const MAX_NOTE_LENGTH = 2000;
+
+export interface NoteDraft {
+	typeId: string | null;
+	date: string;
+	text: string;
+}
+
+export type NoteField = "typeId" | "date" | "text";
+export type NoteErrors = Partial<Record<NoteField, string>>;
+
+export const validateNote = (
+	draft: NoteDraft,
+	today: string = todayISO(),
+): NoteErrors => {
+	const errors: NoteErrors = {};
+
+	if (!draft.typeId) {
+		errors.typeId = "Please choose a note type.";
+	}
+
+	const date = draft.date.trim();
+	if (!parseISODate(date)) {
+		errors.date = "Enter a valid date as YYYY-MM-DD.";
+	} else if (date > today) {
+		errors.date = "The note date can't be in the future.";
+	}
+
+	const text = draft.text.trim();
+	if (text.length === 0) {
+		errors.text = "Note text can't be empty.";
+	} else if (text.length > MAX_NOTE_LENGTH) {
+		errors.text = `Keep the note under ${MAX_NOTE_LENGTH} characters.`;
+	}
+
+	return errors;
+};
+
+export const hasErrors = (errors: NoteErrors): boolean =>
+	Object.keys(errors).length > 0;
diff --git a/SOLUTION.md b/SOLUTION.md
new file mode 100644
index 0000000..2a563ee
--- /dev/null
+++ b/SOLUTION.md
@@ -0,0 +1,340 @@
+# Clinical Notes: Solution Notes
+
+This is the document that goes with the `TEST` branch. It explains what the
+starter gave us, what I built or changed, and why. Every file I touched also
+has a comment block at the top marked **STARTER / ADDED / UPDATED /
+IMPLEMENTED**, so you can read the reasoning right next to the code.
+
+## How to run it
+
+```sh
+cd app-clinical-notes
+npm install
+npm start          # then press i (iOS simulator) or a (Android emulator)
+npm test           # 60 unit tests
+npx tsc --noEmit   # type check
+```
+
+Things to try once it's running:
+
+0. The app opens on a patient list (an extra, see
+   [Beyond the brief](#beyond-the-brief)), 10 per page: use **Next ›** at
+   the bottom. Try the search box and the sort icon, then tap a patient to open the overview
+   the brief describes; it shows instantly. **‹ Patients**, iOS swipe-back or
+   Android back return to the list.
+1. The first load shows a spinner (the mock client waits up to 3s).
+2. About 1 load in 6 fails on purpose. You'll see an error with **Try again**.
+3. Pull down to refresh. If that refresh fails, the data stays on screen and a
+   small red banner appears instead.
+4. Tap a filter chip (e.g. "Lab Results") to filter the notes.
+5. Tap **Add New Clinical Note**. Tap **Add Note** without choosing a type to
+   see validation. Open the date picker: dates after today can't be picked.
+   Fill it in properly and save. The new note appears at the top.
+6. If a save fails, the modal stays open with everything you typed.
+7. Type something, then **Cancel**: it asks before discarding.
+8. On Android, the back button behaves like Cancel.
+
+## What already existed (the starter)
+
+| Piece | State in the starter |
+|---|---|
+| Expo 57 / RN 0.86 / React 19 / TS project, Jest setup | Complete |
+| Mock data client (`src/data`) + its tests | Complete, with a few bugs (below) |
+| `Header` component | Complete, but never rendered |
+| `PatientInfo`, `ClinicalNote` | Empty `<View>` with typed props |
+| `AddNoteModal` | Empty RN `<Modal>` with typed props |
+| `App.tsx` | Empty `SafeAreaView` (white screen) |
+| React Navigation, Picker, Async Storage | Installed |
+
+## What I built
+
+```
+App.tsx                         UPDATED  stack navigator under the Header, safe areas
+src/
+  navigation.ts                 ADDED    route names + params
+  screens/
+    PatientOverviewScreen.tsx   ADDED    the brief's screen; picks what to show
+    PatientListScreen.tsx       ADDED    extra: all patients, sortable
+  hooks/                        ADDED    all data fetching lives here
+    usePatient.ts                        load / refresh / stale-response guard
+    usePatients.ts                       all patients in one request
+    patientCache.ts                      last known copy of each patient
+    useNoteTypes.ts                      types for the picker
+    NoteTypesContext.tsx                 loads the types once at app start
+    useSaveClinicalNote.ts               save + double-tap guard
+  components/
+    Header.tsx                  UPDATED  a11y role + optional back button
+    PatientInfo.tsx             IMPLEMENTED  patient info + discharge summary
+    ClinicalNote.tsx            IMPLEMENTED  one note card (memoized)
+    AddNoteModal.tsx            IMPLEMENTED  the form
+    NoteTypeFilter.tsx          ADDED    filter chips
+    Button.tsx, Chip.tsx, SortSheet.tsx, StatusView.tsx, ErrorBanner.tsx   ADDED  shared UI
+  utils/                        ADDED    pure, unit-tested logic
+    date.ts, notes.ts, patients.ts, validateNote.ts, clinicalNote.ts, errors.ts
+  theme.ts                      ADDED    shared colors / spacing
+  data/index.tsx, patients.ts   UPDATED  bug fixes (below), 23 extra seed patients
+lib/                            REGENERATED with npm run build:lib
+```
+
+**The rule I followed:** hooks own the data, the screen decides what to show,
+components only draw. Anything with real logic (dates, sorting, filtering,
+validation) is a pure function in `utils/` with tests.
+
+## Key decisions
+
+### RN `Modal` instead of a React Navigation modal route
+- The form belongs to one screen (the overview) and can't be reached any
+  other way, so it doesn't need to be a route.
+- The form needs live things from the screen (the note types, a callback to
+  update the list). Navigation params should be serializable, so passing
+  callbacks through them is an anti-pattern.
+- The starter already provided an RN Modal.
+- `onRequestClose` makes the Android back button work as Cancel.
+- A stack navigator now exists for the extra patient list, and none of the
+  above changed. I'd switch only if "add a note" needed a deep link or could
+  be opened from elsewhere. The change is contained to `AddNoteModal` and the
+  screen.
+
+### No state library
+`useState` inside custom hooks. Two screens don't need Redux. The note
+types, shared across screens, live in a small React context
+(`NoteTypesContext`), and the last known copy of each patient in a plain
+`Map` (`patientCache`) that the overview reads when it opens. In a real app I'd use React Query (caching,
+retries, background refetch); the hooks already return a similar shape
+(`data / loading / error / refetch`) so the swap is easy.
+
+### One `FlatList` for the whole screen
+Patient card in `ListHeaderComponent`, notes as items, button in
+`ListFooterComponent`. One scroll container, virtualized notes, free
+pull-to-refresh, and no "FlatList inside ScrollView" warning.
+
+### Showing the new note right after a confirmed save
+After `addNewClinicalNote` succeeds, the note is added to the screen
+immediately, then the patient is refetched quietly in the background.
+Why not just refetch? The refetch can take 3s and fails 1 time in 6. The save
+already succeeded, so making the user wait (or see an error) for data we
+already have is bad UX. This is not optimistic: nothing shows until the
+server confirms.
+
+### Loading and error states
+| Situation | What the user sees |
+|---|---|
+| First load | Full-screen spinner |
+| First load fails | Full-screen message + Try again |
+| Refresh fails, data already shown | Data stays, red banner + Retry |
+| Opening a patient from the list | Shown instantly from the list's copy; refreshed silently |
+| Note types loading / failed | Spinner / error + Try again inside the modal |
+| Save fails | Modal stays open, text kept, banner explains |
+| No notes / none for this filter | Empty message |
+
+Technical errors ("A synthetic error happened") are never shown to the user;
+`utils/errors.ts` turns them into plain sentences.
+
+### Race conditions
+The mock waits a random time, so responses can arrive out of order. Each
+request in the hooks gets an id and only the latest one may update state.
+Hooks also don't set state after unmount. Saving uses a ref so a fast double
+tap can't create two notes.
+
+### Validation (`utils/validateNote.ts`)
+- Note type required.
+- Date must be a real `YYYY-MM-DD` date and not in the future (a note records
+  something that happened). Past dates are allowed.
+- Text trimmed, not empty, max 2000 characters.
+- All errors show at once after the first tap on Add Note, and each clears as
+  the user fixes that field.
+
+### Dates
+`new Date("2023-07-15")` is parsed as UTC, which is July **14** in Montréal.
+All dates are built in local time from their parts, and shown as
+`Jul 15, 2023` (spelled-out month, so no 07/08 vs 08/07 confusion between
+English and French Canada). Tests run green in UTC, Toronto and UTC+14.
+
+### Pickers and platform conventions (from the Figma)
+- **Note type:** `@react-native-picker/picker`, a wheel on iOS by default and
+  `mode="dropdown"` on Android.
+- **Date:** a "Select date" field that opens the native picker
+  (`@react-native-community/datetimepicker` 9.1.0, the version Expo SDK 57
+  pins): a spinner on iOS, the Material calendar dialog on Android.
+  `maximumDate` is today, so future dates can't be picked at all, and
+  validation still checks it as a second line of defence.
+- **Buttons:** iOS gets plain blue text buttons stacked ("Add Note" over
+  "Cancel"); Android gets a filled "ADD NOTE" with a text "Cancel".
+
+My first version used a typed `YYYY-MM-DD` field to avoid a new native
+dependency. After comparing with the Figma, I switched: the design clearly
+shows a picker, and typing dates on a phone invites mistakes.
+
+## Deviations from the Figma (and why)
+
+The brief allows layout changes as long as all the information is present.
+Every required field is shown. These are the places I chose differently:
+
+| Figma | What I did | Why |
+|---|---|---|
+| Notes **oldest first** (Admission → Discharge) | **Newest first** | A clinician opening a chart needs the latest note first. With 5 notes it barely matters; with 50 it means scrolling to the bottom every time. Same-date notes show the most recently added first, so a note you just saved is always at the top. |
+| Note type **preselected** ("Admission Note") | Starts on "Select a note type…" and is required | If a type is preselected, a nurse in a hurry can save the wrong type without ever touching the picker. Forcing a choice is a small cost for correct records. |
+| Date field empty ("Select date") | Starts on today | Most notes are written the same day, so this saves a tap. It's still a picker and still easy to change. |
+| "Label: value" inline text in cards | Aligned label / value rows | Easier to scan for one field ("which physician?"). Same information. |
+| Medications joined with commas | One bullet per medication | Doses like "75 mg twice daily, 500 mg as needed" blur together in one line. |
+| Note type in quotes as a title, "Note ID:" / "Date:" / "Note Text:" labels | Type as a coloured pill, date on the same line, ID small at the bottom | You scan notes by type and date, so those are most visible. The ID is kept (and copyable) but de-emphasised. |
+| "Add New Clinical Note" as a text link | Filled button | It's the main action on the screen, so it should look like one. Still at the end of the list, where Figma puts it. |
+| No filter | Note type filter chips | Extra. Helps once there are many notes; never offers a filter that shows nothing. |
+| Nurse "Emily Clark", clinic "ABC Medical Center" | Whatever the client returns | Those are mockup values. The app shows real data. |
+| App opens on the overview | App opens on a patient list | Extra, see below. The overview itself is still the brief's screen, under the same "Health Clinic" header. |
+
+## Beyond the brief
+
+The brief describes one patient on one screen. I added a little on top,
+without changing that screen:
+
+- **More seed patients.** `patients.ts` now has 24 patients instead of 1
+  (John Doe is still first, and the starter tests still use him). Three are
+  written out in full; 20 more are written compactly and expanded by a small
+  `toPatient()` helper, with fixed ids so the seed is identical on every run.
+  Each has a full discharge summary and 3–4 notes using the existing note
+  types. `lib/` was regenerated.
+- **Patient list.** With more than one patient, the app needed a way to pick
+  one. The list shows name, age, gender, admission date and diagnosis, with
+  the same loading / error / pull-to-refresh handling as the overview.
+- **Pagination: 10 per page, "‹ Prev · Page 2 of 3 · Next ›".** All
+  patients are fetched in **one** request and paged on the phone
+  (`utils/patients.ts`: `pageOf`, `pageCount`). The header shows
+  "11–20 of 24". A page change scrolls back to the top; a sort change goes
+  back to page 1; if a refresh returns fewer patients, the page is clamped
+  so it never points past the end.
+- **Why page on the phone, and not ask the client page by page?** I built
+  server paging first (cursor-based infinite scroll, sorting moved into the
+  client) and replaced it:
+  - Every request to the mock can take 3s and fails 1 time in 6. With
+    server paging, every page turn was another chance to wait or fail. Now
+    there's one request; after it, Next / Prev and sorting are instant and
+    can't fail.
+  - The client returns no total, so server paging can't say "of 3" without
+    an extra call. With everything loaded, the total is known.
+  - Sorting stays correct across pages, because every patient is present.
+    (Sorting only the loaded pages would put an "Adams" from page 3 below a
+    "Tremblay" on page 1.)
+  - It kept the client's public API exactly as the starter had it.
+  - **The trade-off:** this doesn't scale to thousands of patients. A
+    clinic's list of current patients is small, so it fits here. For a large
+    list I'd switch back to server paging: the client already supports
+    `offset` / `limit` / `cursor`, and it would need a `sort` param so the
+    order is decided where all the data is.
+- **Search.** A search icon next to the "Patients" title; tapping it opens
+  a focused search box under the title, which closes again when left empty.
+  While it holds a query it stays open, so a filtered list never hides its
+  filter, and the count says what's applied ("1–3 of 3 matching "pneu""). It filters as you type, by name, diagnosis or patient ID
+  (`filterPatients` in `utils/patients.ts`). It
+  ignores case and accents ("helene" finds "Hélène"), and every word must
+  match, in any order ("pneu marie"). It filters the patients already
+  loaded, so there's no request, no delay and no failure. A new search goes
+  back to page 1, and an empty result says what was searched for.
+- **Sorting.** Recently admitted (default), Name A–Z (by last name, accent-
+  and case-insensitive), Age oldest first. A sort icon next to the search
+  box opens a "Sort by" bottom sheet (`components/SortSheet.tsx`, built on
+  RN `Modal`: the backdrop fades while the sheet slides up), with a
+  checkmark on the current sort. Ties fall back to the id, so the order is total and a patient can't jump
+  between pages from one render to the next.
+- **New dependency: `@expo/vector-icons`** for the search, sort, clear and
+  checkmark icons. It's Expo's standard icon set (installed with
+  `npx expo install` so the version matches SDK 57), and the assets folder
+  has no icons for these.
+- **Opening a patient is instant.** The list has already downloaded each
+  patient in full, so the overview starts from that copy (`patientCache`, a
+  tiny stand-in for React Query's cache) and refreshes silently in the
+  background. Before, every open was a fresh fetch behind a spinner, and 1
+  open in 6 ended on "Couldn't load the patient": the mock's random failure,
+  which I confirmed by logging the thrown error. A failed background
+  refresh is swallowed (the data is seconds old). Saving a note updates the
+  cached copy too, so reopening the patient shows it.
+- **Navigation.** React Navigation's native stack (already installed). The
+  header is still the starter `Header`, which gained an optional
+  **‹ Patients** back button. Only `patientId` is passed as a route param.
+- **Found while testing: note types loaded once.** With the list in place,
+  each overview fetched the note types again. Tapping "Add New Clinical
+  Note" right after opening a patient showed "Loading note types…" for up to
+  3s with "Add Note" disabled. I measured the modal itself first: it is on
+  screen ~0.6s after the tap, which is just the slide animation. The fix was
+  to load the types once at app start (`NoteTypesContext`), so they're ready
+  while the user is still on the list.
+- **Found while testing: Note Text "not tappable" at first.** The real
+  cause was a layout jump: when the types arrived, the short "Loading…" row
+  was replaced by the 216pt iOS wheel, pushing Note Text down, so a tap
+  aimed at it landed on the date field. The loading and error states now
+  take the picker's height, so nothing below moves.
+
+## Data handling and performance
+
+- **Fetching one patient:** the client has no `fetchPatient(id)`, so the
+  overview fetches the list and picks the patient by id. With a real API
+  this would be `GET /patients/:id`.
+- **Note types** are fetched once per app session, not once per patient.
+- **Patients are paginated** 10 per page, on the phone, from one request.
+  See [Beyond the brief](#beyond-the-brief) for why, and when I'd change it.
+- **Clinical notes are not paginated, honestly:** they come embedded in the
+  patient and the API has no way to page them, so paging them on the phone
+  would be fake. What I did instead: `FlatList` virtualization (only visible
+  cards render), `React.memo` on note cards, and `useMemo` for sort/filter.
+  For a real backend I'd ask for
+  `GET /patients/:id/notes?cursor=...&limit=20&type=...` and hook it to
+  `onEndReached`.
+- **Sorting:** newest first; same-date notes show the most recently added first.
+- **Filtering:** by note type, with counts; only types that exist are offered.
+
+## Bugs found in the starter (and fixed)
+
+1. **Unawaited storage writes.** The `Client` constructor called
+   `resetState()` without awaiting it, and `resetState()` didn't await its two
+   `setItem` calls. It worked only because the random delay gave storage time.
+   Fixed with a `ready` promise every method awaits.
+2. **Saves rolled the failure dice twice.** `addNewClinicalNote` called
+   `fetchPatientData`, which runs the random delay/failure again: one save could
+   take ~6s and failed about twice as often. It now reads storage directly.
+   *Regression test: fails on the starter, passes now.*
+3. **Shared-array mutation.** The patient was shallow-copied and then `push()`
+   was called on the original notes array. Now builds a new array.
+4. **Mojibake in seed data.** `InfirmiÃ¨re HÃ©lÃ¨ne` and
+   `Sainte-Anne-de-BeauprÃ©` were UTF-8 read as Latin-1. Fixed to
+   `Infirmière Hélène` / `Beaupré`. *Regression test.*
+5. **Literal `\n` in a note.** The discharge note contained `\\n`, so the UI
+   printed a backslash and an n. Now a real line break. *Regression test.*
+
+The public API of the client is unchanged. `lib/` was regenerated with
+`npm run build:lib`.
+
+Also noticed, left alone: the seed patient "John Doe" has gender "Female".
+That's data, not code, so I didn't change it.
+
+## Tests (60, all passing)
+
+- `src/data/index.test.ts`: the starter's tests (unchanged) + 4 new ones for
+  the fixes above.
+- `src/utils/patients.test.ts`: each patient sort order, accents/case, ties
+  (the order is total), search (blank query, accents, diagnosis and ID,
+  multi-word), and paging (`pageCount`, `pageOf`, empty list, past the last
+  page).
+- `src/utils/*.test.ts` (others): dates (incl. timezone and impossible dates
+  like Feb 31), note sorting/filtering, validation rules, note building,
+  error messages.
+
+I kept tests on pure logic because `@testing-library/react-native` isn't in
+the starter. With more time I'd add it and test the hooks (stale responses,
+refresh failure keeps data) and the modal flow (validation, failed save keeps
+text).
+
+## Verified
+
+- `tsc --noEmit` passes (strict mode).
+- `npm test`: 60/60.
+- `expo export` bundles for both iOS and Android with no errors.
+
+## With more time
+
+1. Component and hook tests with React Native Testing Library.
+2. React Query for caching / retry with backoff.
+3. Real note pagination once the API supports it.
+4. `react-native-keyboard-controller` for smoother keyboard handling on
+   Android's edge-to-edge mode.
+5. Localization (FR/EN), since the clinic is in Québec.
+6. Dark mode (the app is forced to light in `app.json` today).
````
