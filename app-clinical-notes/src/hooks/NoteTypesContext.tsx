import { createContext, useContext, type FC, type ReactNode } from "react";

import { useNoteTypes, type UseNoteTypesResult } from "./useNoteTypes";

const NoteTypesContext = createContext<UseNoteTypesResult | null>(null);

export const NoteTypesProvider: FC<{ children: ReactNode }> = ({ children }) => (
	<NoteTypesContext.Provider value={useNoteTypes()}>
		{children}
	</NoteTypesContext.Provider>
);

export const useSharedNoteTypes = (): UseNoteTypesResult => {
	const value = useContext(NoteTypesContext);
	if (!value) {
		throw new Error("useSharedNoteTypes must be used inside NoteTypesProvider");
	}
	return value;
};
