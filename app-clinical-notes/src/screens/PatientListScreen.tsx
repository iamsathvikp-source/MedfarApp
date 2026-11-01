import Ionicons from "@expo/vector-icons/Ionicons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FC,
} from "react";
import {
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import SortSheet from "../components/SortSheet";
import StatusView from "../components/StatusView";
import type { PatientData } from "../data";
import { PAGE_SIZE, usePatients } from "../hooks/usePatients";
import type { RootStackParamList } from "../navigation";
import { colors, radius, spacing } from "../theme";
import { formatDate } from "../utils/date";
import {
	filterPatients,
	pageCount,
	pageOf,
	PATIENT_SORT_OPTIONS,
	sortPatients,
	type PatientSortKey,
} from "../utils/patients";

type Props = NativeStackScreenProps<RootStackParamList, "PatientList">;

const PatientListScreen: FC<Props> = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const listRef = useRef<FlatList<PatientData>>(null);
	const { patients, loading, refreshing, error, reload, refresh } =
		usePatients();

	const [query, setQuery] = useState("");
	const [isSearchOpen, setSearchOpen] = useState(false);
	const [sortKey, setSortKey] = useState<PatientSortKey>("admitted");
	const [isSortOpen, setSortOpen] = useState(false);
	const [page, setPage] = useState(0);

	const sortedPatients = useMemo(
		() =>
			patients ? sortPatients(filterPatients(patients, query), sortKey) : null,
		[patients, query, sortKey],
	);
	const sortLabel =
		PATIENT_SORT_OPTIONS.find(({ key }) => key === sortKey)?.label ?? "";
	const totalPages = pageCount(sortedPatients?.length ?? 0, PAGE_SIZE);
	const currentPage = Math.min(page, totalPages - 1);
	const pagePatients = useMemo(
		() =>
			sortedPatients ? pageOf(sortedPatients, currentPage, PAGE_SIZE) : [],
		[sortedPatients, currentPage],
	);

	const changeSort = (key: PatientSortKey) => {
		setSortKey(key);
		setPage(0);
	};

	const changeQuery = (text: string) => {
		setQuery(text);
		setPage(0);
	};

	const showSearch = isSearchOpen || query.length > 0;

	const toggleSearch = () => {
		if (!showSearch) {
			setSearchOpen(true);
		} else if (query.length === 0) {
			setSearchOpen(false);
		}
	};

	const clearOrCloseSearch = () => {
		if (query.length > 0) {
			changeQuery("");
		} else {
			setSearchOpen(false);
		}
	};

	useEffect(() => {
		listRef.current?.scrollToOffset({ offset: 0, animated: true });
	}, [currentPage, sortKey]);

	const renderPatient = useCallback(
		({ item }: { item: PatientData }) => (
			<Pressable
				accessibilityRole="button"
				accessibilityHint="Opens the patient's overview"
				onPress={() =>
					navigation.navigate("PatientOverview", { patientId: item.id })
				}
				style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
			>
				<View style={styles.row}>
					<Text style={styles.name}>{item.name}</Text>
					<Text style={styles.chevron}>›</Text>
				</View>
				<Text style={styles.meta}>
					{item.age} · {item.gender} · Admitted{" "}
					{formatDate(item.dateOfAdmission)}
				</Text>
				<Text style={styles.diagnosis}>{item.dischargeSummary.diagnosis}</Text>
			</Pressable>
		),
		[navigation],
	);

	if (!sortedPatients) {
		if (loading) {
			return <StatusView loading message="Loading patients…" />;
		}
		return (
			<StatusView
				title="Couldn't load patients"
				message={error ?? "Something went wrong."}
				onRetry={reload}
			/>
		);
	}

	const firstShown = currentPage * PAGE_SIZE + 1;
	const lastShown = currentPage * PAGE_SIZE + pagePatients.length;

	return (
		<>
			<FlatList
				ref={listRef}
				data={pagePatients}
				keyExtractor={(patient) => patient.id}
				renderItem={renderPatient}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: spacing.xl + insets.bottom },
				]}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={refresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
				ListHeaderComponent={
					<>
						{error && (
							<ErrorBanner
								message={`${error} Showing the last loaded data.`}
								actionLabel="Retry"
								onAction={refresh}
							/>
						)}
						<View style={styles.toolbar}>
							<Text style={styles.sectionTitle} accessibilityRole="header">
								Patients
							</Text>
							<Pressable
								testID="open-search"
								accessibilityRole="button"
								accessibilityLabel={
									showSearch ? "Close search" : "Search patients"
								}
								accessibilityState={{ expanded: showSearch }}
								onPress={toggleSearch}
								style={({ pressed }) => [
									styles.iconButton,
									showSearch && styles.iconButtonActive,
									pressed && styles.iconButtonPressed,
								]}
							>
								<Ionicons name="search" size={20} color={colors.primary} />
							</Pressable>
							<Pressable
								testID="open-sort"
								accessibilityRole="button"
								accessibilityLabel={`Sort, currently ${sortLabel}`}
								onPress={() => setSortOpen(true)}
								style={({ pressed }) => [
									styles.iconButton,
									pressed && styles.iconButtonPressed,
								]}
							>
								<Ionicons
									name="swap-vertical"
									size={20}
									color={colors.primary}
								/>
							</Pressable>
						</View>
						{showSearch && (
							<View style={styles.searchBox}>
								<Ionicons name="search" size={18} color={colors.textMuted} />
								<TextInput
									testID="patient-search"
									accessibilityLabel="Search patients"
									style={styles.searchInput}
									value={query}
									onChangeText={changeQuery}
									onBlur={() => setSearchOpen(false)}
									autoFocus
									placeholder="Search name, diagnosis or ID"
									placeholderTextColor={colors.textMuted}
									autoCorrect={false}
									autoCapitalize="none"
									returnKeyType="search"
									clearButtonMode="never"
								/>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel={
										query.length > 0 ? "Clear search" : "Close search"
									}
									onPress={clearOrCloseSearch}
									hitSlop={8}
								>
									<Ionicons
										name="close-circle"
										size={18}
										color={colors.textMuted}
									/>
								</Pressable>
							</View>
						)}
						{sortedPatients.length > 0 && (
							<Text style={styles.range} accessibilityLiveRegion="polite">
								{firstShown}–{lastShown} of {sortedPatients.length}
								{query.trim() ? ` matching "${query.trim()}"` : ""}
							</Text>
						)}
					</>
				}
				ListFooterComponent={
					totalPages > 1 ? (
						<View style={styles.pager}>
							<Button
								title="‹ Prev"
								variant="secondary"
								onPress={() => setPage(currentPage - 1)}
								disabled={currentPage === 0}
								style={styles.pagerButton}
							/>
							<Text style={styles.pagerText} accessibilityLiveRegion="polite">
								Page {currentPage + 1} of {totalPages}
							</Text>
							<Button
								title="Next ›"
								variant="secondary"
								onPress={() => setPage(currentPage + 1)}
								disabled={currentPage >= totalPages - 1}
								style={styles.pagerButton}
							/>
						</View>
					) : null
				}
				ListEmptyComponent={
					<Text style={styles.empty}>
						{query.trim()
							? `No patients match "${query.trim()}".`
							: "No patients yet."}
					</Text>
				}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
			/>
			<SortSheet
				visible={isSortOpen}
				options={PATIENT_SORT_OPTIONS}
				selected={sortKey}
				onSelect={changeSort}
				onClose={() => setSortOpen(false)}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	content: {
		padding: spacing.lg,
	},
	sectionTitle: {
		flex: 1,
		fontSize: 20,
		fontWeight: "700",
		color: colors.text,
	},
	toolbar: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	searchBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: colors.card,
		borderRadius: radius.card,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: spacing.md,
		minHeight: 44,
		marginBottom: spacing.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: colors.text,
		paddingVertical: spacing.sm,
	},
	iconButton: {
		width: 44,
		height: 44,
		borderRadius: radius.card,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.card,
		alignItems: "center",
		justifyContent: "center",
	},
	iconButtonActive: {
		borderColor: colors.primary,
	},
	iconButtonPressed: {
		backgroundColor: colors.chipBackground,
	},
	range: {
		fontSize: 14,
		color: colors.textMuted,
		marginBottom: spacing.md,
	},
	card: {
		backgroundColor: colors.card,
		borderRadius: radius.card,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		marginBottom: spacing.md,
		gap: spacing.xs,
	},
	cardPressed: {
		backgroundColor: colors.chipBackground,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	name: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.text,
	},
	chevron: {
		fontSize: 24,
		color: colors.textMuted,
	},
	meta: {
		fontSize: 14,
		color: colors.textMuted,
	},
	diagnosis: {
		fontSize: 15,
		color: colors.text,
	},
	empty: {
		textAlign: "center",
		color: colors.textMuted,
		paddingVertical: spacing.xl,
	},
	pager: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		marginTop: spacing.sm,
	},
	pagerButton: {
		flex: 1,
	},
	pagerText: {
		fontSize: 15,
		fontWeight: "600",
		color: colors.text,
	},
});

export default PatientListScreen;
