import type { FC } from "react";
import { ScrollView, StyleSheet } from "react-native";

import type { ClinicalNoteType } from "../data";
import { spacing } from "../theme";
import Chip from "./Chip";

interface Props {
	options: { type: ClinicalNoteType; count: number }[];
	totalCount: number;
	selectedTypeId: string | null;
	onChange: (typeId: string | null) => void;
}

const NoteTypeFilter: FC<Props> = ({
	options,
	totalCount,
	selectedTypeId,
	onChange,
}) => (
	<ScrollView
		horizontal
		showsHorizontalScrollIndicator={false}
		contentContainerStyle={styles.container}
	>
		<Chip
			label={`All (${totalCount})`}
			selected={selectedTypeId === null}
			onPress={() => onChange(null)}
		/>
		{options.map(({ type, count }) => (
			<Chip
				key={type.id}
				label={`${type.name} (${count})`}
				selected={selectedTypeId === type.id}
				onPress={() => onChange(type.id)}
			/>
		))}
	</ScrollView>
);

const styles = StyleSheet.create({
	container: {
		gap: spacing.sm,
		paddingBottom: spacing.md,
	},
});

export default NoteTypeFilter;
