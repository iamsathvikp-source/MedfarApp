export interface ClinicalNote {
    id: string;
    date: string;
    type: ClinicalNoteType;
    noteText: string;
}
export interface ClinicalNoteType {
    id: string;
    name: string;
}
export interface DischargeSummary {
    date: string;
    diagnosis: string;
    medication: string[];
    instructions: string;
}
export interface PatientData {
    id: string;
    name: string;
    age: number;
    gender: string;
    dateOfAdmission: string;
    admittingPhysician: string;
    dischargeSummary: DischargeSummary;
    nurse: string;
    clinic: string;
    clinicalNotes: ClinicalNote[];
}
interface FetchParams {
    offset?: number;
    limit?: number;
    cursor?: string | null;
}
export default class Client {
    constructor();
    resetState(): Promise<void>;
    fetchPatientData(opts?: FetchParams): Promise<PatientData[]>;
    addNewClinicalNote(patientId: string, clinicalNote: ClinicalNote): Promise<void>;
    fetchClinicalNoteTypes(): Promise<ClinicalNoteType[]>;
}
export {};
