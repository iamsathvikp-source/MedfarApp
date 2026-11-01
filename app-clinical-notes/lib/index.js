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
        this.ready = this.resetState();
    }
    async resetState() {
        await Promise.all([
            async_storage_1.default.setItem("patientData", JSON.stringify(patients_1.default)),
            async_storage_1.default.setItem("clinicalNoteTypes", JSON.stringify(noteType_1.default)),
        ]);
    }
    async readPatients() {
        const data = await async_storage_1.default.getItem("patientData");
        if (!data) {
            return [];
        }
        const patients = JSON.parse(data);
        return patients !== null && patients !== void 0 ? patients : [];
    }
    async fetchPatientData(opts) {
        await this.ready;
        await randomFuzz();
        console.log("Fetching patient data...");
        const patientData = await this.readPatients();
        if (opts) {
            slice(patientData, opts);
        }
        return patientData;
    }
    async addNewClinicalNote(patientId, clinicalNote) {
        await this.ready;
        await randomFuzz();
        console.log(`Adding new clinical note for patient with ID: ${patientId}`);
        const patientData = await this.readPatients();
        const patientIndex = patientData.findIndex((patient) => patient.id === patientId);
        if (patientIndex === -1) {
            throw new Error("Patient not found");
        }
        const existing = patientData[patientIndex];
        const updatedPatient = Object.assign(Object.assign({}, existing), { clinicalNotes: [...existing.clinicalNotes, clinicalNote] });
        patientData[patientIndex] = updatedPatient;
        const updatedPatientData = JSON.stringify(patientData);
        await async_storage_1.default.setItem("patientData", updatedPatientData);
    }
    async fetchClinicalNoteTypes() {
        await this.ready;
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