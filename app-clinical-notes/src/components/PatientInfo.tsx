import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { PatientData } from "../data";
import { colors, radius, spacing } from "../theme";
import { formatDate } from "../utils/date";

interface Props {
	patient: PatientData;
}

interface InfoRowProps {
	label: string;
	value: string;
}

const InfoRow: FC<InfoRowProps> = ({ label, value }) => (
	<View style={styles.row}>
		<Text style={styles.label}>{label}</Text>
		<Text style={styles.value} selectable>
			{value}
		</Text>
	</View>
);

const PatientInfo: FC<Props> = ({ patient }) => {
	const { dischargeSummary } = patient;

	return (
		<View style={styles.card}>
			<Text style={styles.name} accessibilityRole="header">
				{patient.name}
			</Text>

			<Text style={styles.sectionTitle} accessibilityRole="header">
				Patient Information
			</Text>
			<InfoRow label="Patient ID" value={patient.id} />
			<InfoRow label="Age" value={String(patient.age)} />
			<InfoRow label="Gender" value={patient.gender} />
			<InfoRow label="Admitted" value={formatDate(patient.dateOfAdmission)} />
			<InfoRow label="Physician" value={patient.admittingPhysician} />
			<InfoRow label="Nurse" value={patient.nurse} />
			<InfoRow label="Clinic" value={patient.clinic} />

			<View style={styles.divider} />

			<Text style={styles.sectionTitle} accessibilityRole="header">
				Discharge Summary
			</Text>
			<InfoRow label="Date" value={formatDate(dischargeSummary.date)} />
			<InfoRow label="Diagnosis" value={dischargeSummary.diagnosis} />

			<View style={styles.row}>
				<Text style={styles.label}>Medication</Text>
				<View style={styles.valueColumn}>
					{dischargeSummary.medication.length === 0 ? (
						<Text style={styles.valueText}>None</Text>
					) : (
						dischargeSummary.medication.map((item) => (
							<Text key={item} style={styles.valueText}>
								• {item}
							</Text>
						))
					)}
				</View>
			</View>

			<InfoRow label="Instructions" value={dischargeSummary.instructions} />
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.card,
		borderRadius: radius.card,
		padding: spacing.lg,
		marginBottom: spacing.xl,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	name: {
		fontSize: 22,
		fontWeight: "700",
		color: colors.text,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "700",
		color: colors.primary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
	},
	row: {
		flexDirection: "row",
		paddingVertical: spacing.xs + 2,
		gap: spacing.md,
	},
	label: {
		width: 96,
		fontSize: 14,
		color: colors.textMuted,
	},
	value: {
		flex: 1,
		fontSize: 14,
		color: colors.text,
	},
	valueColumn: {
		flex: 1,
	},
	valueText: {
		fontSize: 14,
		color: colors.text,
		marginBottom: 2,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: colors.border,
		marginTop: spacing.md,
	},
});

export default PatientInfo;
