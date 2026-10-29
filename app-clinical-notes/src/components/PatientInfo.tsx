import type { FC } from "react";
import { View } from "react-native";
import type { PatientData } from "../data";

interface Props {
	patient: PatientData;
}

const PatientInfo: FC<Props> = () => {
	return <View style={{ flex: 1 }}></View>;
};

export default PatientInfo;
