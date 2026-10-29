import type { FC } from "react";
import { Modal } from "react-native";
import type { ClinicalNoteType } from "../data";

interface Props {
	visible: boolean;
	onClose: () => void;
	patientId: string;
	noteTypes: ClinicalNoteType[];
}

const AddNoteModal: FC<Props> = ({ visible }) => {
	return <Modal visible={visible} animationType="slide"></Modal>;
};

export default AddNoteModal;
