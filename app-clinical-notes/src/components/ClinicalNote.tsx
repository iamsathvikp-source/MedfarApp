import type { FC } from "react";
import { View } from "react-native";
import type { ClinicalNote as ClinicalNoteType } from "../data";

interface Props {
	note: ClinicalNoteType;
}

const ClinicalNote: FC<Props> = () => {
	return <View style={{ flex: 1 }}></View>;
};

export default ClinicalNote;
