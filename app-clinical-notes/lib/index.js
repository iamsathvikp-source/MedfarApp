"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const noteType_1 = __importDefault(require("./noteType"));
const patients_1 = __importDefault(require("./patients"));
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const randomFuzz = () => new Promise((resolve, reject) => {
    const randomDelay = Math.random() * 3000;
    if (randomDelay < 500) {
        reject(new Error("A synthetic error happened"));
        return;
    }
    setTimeout(resolve, randomDelay);
});
const slice = (list, opts) => {
    if (opts.cursor) {
        const index = list.findIndex(({ id }) => id === opts.cursor);
        list.splice(0, index + 1);
    }
    else {
        if (opts.offset) {
            list.splice(0, opts.offset);
        }
    }
    if (opts.limit) {
        list.splice(opts.limit);
    }
};
class Client {
    constructor() {
        this.resetState();
    }
    async resetState() {
        async_storage_1.default.setItem("patientData", JSON.stringify(patients_1.default));
        async_storage_1.default.setItem("clinicalNoteTypes", JSON.stringify(noteType_1.default));
    }
    async fetchPatientData(opts) {
        await randomFuzz();
        console.log("Fetching patient data...");
        const data = await async_storage_1.default.getItem("patientData");
        if (!data) {
            return [];
        }
        const patientData = JSON.parse(data);
        if (!patientData) {
            return [];
        }
        if (opts) {
            slice(patientData, opts);
        }
        return patientData;
    }
    async addNewClinicalNote(patientId, clinicalNote) {
        await randomFuzz();
        console.log(`Adding new clinical note for patient with ID: ${patientId}`);
        const patientData = await this.fetchPatientData();
        const patientIndex = patientData.findIndex((patient) => patient.id === patientId);
        if (patientIndex === -1) {
            throw new Error("Patient not found");
        }
        const updatedPatient = Object.assign({}, patientData[patientIndex]);
        updatedPatient.clinicalNotes.push(clinicalNote);
        patientData[patientIndex] = updatedPatient;
        const updatedPatientData = JSON.stringify(patientData);
        await async_storage_1.default.setItem("patientData", updatedPatientData);
    }
    async fetchClinicalNoteTypes() {
        await randomFuzz();
        console.log("Fetching clinical note types...");
        const data = await async_storage_1.default.getItem("clinicalNoteTypes");
        if (!data) {
            return [];
        }
        const clinicalNoteTypes = JSON.parse(data);
        if (!clinicalNoteTypes) {
            return [];
        }
        return clinicalNoteTypes;
    }
}
exports.default = Client;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0YS9pbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwREFBc0M7QUFDdEMsMERBQXFDO0FBRXJDLDhGQUFxRTtBQWtDckUsTUFBTSxVQUFVLEdBQUcsR0FBRyxFQUFFLENBQ3ZCLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQy9CLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFekMsSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDdkIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztRQUNoRCxPQUFPO0lBQ1IsQ0FBQztJQUVELFVBQVUsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUM7QUFRSixNQUFNLEtBQUssR0FBRyxDQUErQixJQUFPLEVBQUUsSUFBaUIsRUFBRSxFQUFFO0lBQzFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2pCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO1NBQU0sQ0FBQztRQUNQLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0YsQ0FBQztJQUVELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLElB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