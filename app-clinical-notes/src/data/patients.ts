import type { PatientData } from ".";
import noteTypes from "./noteType";

const [admissionType, progressType, , , dischargeType] = noteTypes;

interface CompactPatient {
	name: string;
	age: number;
	gender: string;
	admitted: string;
	discharged: string;
	physician: string;
	nurse: string;
	clinic: string;
	diagnosis: string;
	medication: string[];
	instructions: string;
	admissionNote: string;
	progressNote: string;
	dischargeNote: string;
}

const pad = (n: number) => String(n).padStart(12, "0");

const toPatient = (seed: CompactPatient, n: number): PatientData => ({
	id: `0f5e2c10-6a3d-4b8e-9c71-${pad(n)}`,
	name: seed.name,
	age: seed.age,
	gender: seed.gender,
	dateOfAdmission: seed.admitted,
	admittingPhysician: seed.physician,
	dischargeSummary: {
		date: seed.discharged,
		diagnosis: seed.diagnosis,
		medication: seed.medication,
		instructions: seed.instructions,
	},
	nurse: seed.nurse,
	clinic: seed.clinic,
	clinicalNotes: [
		{
			id: `7c4d9e20-1b5a-4f3c-8e62-${pad(n * 10 + 1)}`,
			date: seed.admitted,
			type: admissionType,
			noteText: seed.admissionNote,
		},
		{
			id: `7c4d9e20-1b5a-4f3c-8e62-${pad(n * 10 + 2)}`,
			date: seed.admitted,
			type: progressType,
			noteText: seed.progressNote,
		},
		{
			id: `7c4d9e20-1b5a-4f3c-8e62-${pad(n * 10 + 3)}`,
			date: seed.discharged,
			type: dischargeType,
			noteText: seed.dischargeNote,
		},
	],
});

const BROWN = "Dr. Michael Brown";
const GAGNON = "Dr. Louise Gagnon";
const ROY = "Dr. Antoine Roy";
const SHAH = "Dr. Priya Shah";
const HELENE = "Infirmière Hélène";
const JF = "Infirmier Jean-François";
const CHANTAL = "Infirmière Chantal";
const BEAUPRE = "Clinique Sainte-Anne-de-Beaupré";
const LIMOILOU = "CLSC de Limoilou";
const ST_ROCH = "Clinique médicale Saint-Roch";

const morePatients: CompactPatient[] = [
	{
		name: "Luc Bouchard", age: 71, gender: "Male",
		admitted: "2023-11-03", discharged: "2023-11-08",
		physician: GAGNON, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Congestive heart failure exacerbation",
		medication: ["Furosemide 40 mg once daily", "Ramipril 5 mg once daily"],
		instructions: "Weigh yourself every morning. Call the clinic if you gain more than 2 kg in 3 days.",
		admissionNote: "Shortness of breath and bilateral leg edema for 4 days. Crackles at both lung bases.",
		progressNote: "IV diuretics started. Net negative 1.8 L overnight, breathing easier.",
		dischargeNote: "Euvolemic, walking without breathlessness.\nHeart failure clinic follow-up in 2 weeks.",
	},
	{
		name: "Chloé Gauthier", age: 24, gender: "Female",
		admitted: "2024-01-14", discharged: "2024-01-16",
		physician: ROY, nurse: JF, clinic: LIMOILOU,
		diagnosis: "Acute pyelonephritis",
		medication: ["Ciprofloxacin 500 mg twice daily for 7 days"],
		instructions: "Drink plenty of fluids. Return if fever comes back or you cannot keep fluids down.",
		admissionNote: "Fever 39.2°C, right flank pain and dysuria. Urinalysis positive for nitrites.",
		progressNote: "Afebrile after 24 hours of IV antibiotics. Tolerating oral intake.",
		dischargeNote: "Switched to oral antibiotics.\nUrine culture result to be reviewed by family physician.",
	},
	{
		name: "Robert Côté", age: 82, gender: "Male",
		admitted: "2023-12-01", discharged: "2023-12-10",
		physician: BROWN, nurse: CHANTAL, clinic: ST_ROCH,
		diagnosis: "Hip fracture, post surgical repair",
		medication: ["Enoxaparin 40 mg daily for 28 days", "Acetaminophen 1000 mg every 6 hours as needed"],
		instructions: "Physiotherapy exercises twice daily. Use the walker at all times until reviewed.",
		admissionNote: "Fall at home, unable to bear weight. X-ray shows left femoral neck fracture.",
		progressNote: "Post-op day 2 after hemiarthroplasty. Mobilizing with physiotherapy.",
		dischargeNote: "Discharged to rehabilitation centre.\nOrthopedic follow-up in 6 weeks.",
	},
	{
		name: "Fatima Haddad", age: 45, gender: "Female",
		admitted: "2024-02-20", discharged: "2024-02-22",
		physician: SHAH, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Asthma exacerbation",
		medication: ["Prednisone 40 mg daily for 5 days", "Budesonide-formoterol 200/6 two puffs twice daily"],
		instructions: "Use the inhaler every day, even when you feel well. Avoid known triggers.",
		admissionNote: "Wheezing and chest tightness after a viral illness. Peak flow 55% of predicted.",
		progressNote: "Responding to bronchodilators and steroids. Peak flow 75%.",
		dischargeNote: "Peak flow 85% of predicted.\nAsthma action plan reviewed with the patient.",
	},
	{
		name: "Jacques Pelletier", age: 63, gender: "Male",
		admitted: "2023-10-05", discharged: "2023-10-09",
		physician: GAGNON, nurse: JF, clinic: LIMOILOU,
		diagnosis: "Acute exacerbation of COPD",
		medication: ["Prednisone 40 mg daily for 5 days", "Tiotropium 18 mcg once daily"],
		instructions: "Stop smoking; a cessation program referral was made. Use oxygen as prescribed.",
		admissionNote: "Increased dyspnea and sputum for 3 days. SpO2 86% on room air.",
		progressNote: "Oxygen titrated to SpO2 88–92%. Sputum less purulent.",
		dischargeNote: "Back to baseline exercise tolerance.\nPulmonary rehab referral sent.",
	},
	{
		name: "Isabelle Fortin", age: 38, gender: "Female",
		admitted: "2024-03-11", discharged: "2024-03-13",
		physician: ROY, nurse: CHANTAL, clinic: ST_ROCH,
		diagnosis: "Cellulitis of the left leg",
		medication: ["Cephalexin 500 mg four times daily for 7 days"],
		instructions: "Keep the leg raised when sitting. Return if the redness spreads past the marked line.",
		admissionNote: "Spreading redness and warmth of the left shin. Border marked with pen.",
		progressNote: "Redness receding inside the marked border after IV cefazolin.",
		dischargeNote: "Switched to oral antibiotics.\nWound check in 3 days at the CLSC.",
	},
	{
		name: "Mohamed Saidi", age: 50, gender: "Male",
		admitted: "2024-04-02", discharged: "2024-04-05",
		physician: SHAH, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Non-ST elevation myocardial infarction",
		medication: ["Aspirin 81 mg daily", "Ticagrelor 90 mg twice daily", "Atorvastatin 80 mg daily"],
		instructions: "Do not stop the blood thinners without talking to your cardiologist. No driving for 1 week.",
		admissionNote: "Chest pressure at rest for 2 hours. Troponin elevated, ECG without ST elevation.",
		progressNote: "Angiography: one stent placed in the right coronary artery. Pain free.",
		dischargeNote: "Stable after stent placement.\nCardiac rehab and cardiology follow-up in 4 weeks.",
	},
	{
		name: "Geneviève Lapointe", age: 33, gender: "Female",
		admitted: "2023-09-25", discharged: "2023-09-27",
		physician: BROWN, nurse: JF, clinic: LIMOILOU,
		diagnosis: "Migraine with aura, status migrainosus",
		medication: ["Sumatriptan 50 mg at onset, may repeat once", "Naproxen 500 mg twice daily as needed"],
		instructions: "Keep a headache diary. Return for sudden severe headache or weakness.",
		admissionNote: "Headache for 3 days not relieved by usual medication. Neurological exam normal.",
		progressNote: "Headache resolved after IV fluids, metoclopramide and ketorolac.",
		dischargeNote: "Headache free for 24 hours.\nNeurology referral for preventive treatment.",
	},
	{
		name: "Pierre Bergeron", age: 77, gender: "Male",
		admitted: "2024-05-08", discharged: "2024-05-14",
		physician: GAGNON, nurse: CHANTAL, clinic: ST_ROCH,
		diagnosis: "Ischemic stroke, left middle cerebral artery",
		medication: ["Clopidogrel 75 mg daily", "Atorvastatin 40 mg daily"],
		instructions: "Call 911 right away for new weakness, speech problems or facial droop.",
		admissionNote: "Sudden right arm weakness and word-finding difficulty. CT angiography done.",
		progressNote: "Speech improving. Swallow assessment passed.",
		dischargeNote: "Mild residual right hand weakness.\nStroke prevention clinic in 2 weeks; outpatient OT.",
	},
	{
		name: "Nathalie Dubé", age: 58, gender: "Female",
		admitted: "2024-06-17", discharged: "2024-06-19",
		physician: ROY, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Acute cholecystitis, post laparoscopic cholecystectomy",
		medication: ["Acetaminophen 1000 mg every 6 hours as needed", "Hydromorphone 1 mg every 4 hours as needed for 3 days"],
		instructions: "Low-fat diet for 2 weeks. No lifting over 5 kg for 2 weeks.",
		admissionNote: "Right upper quadrant pain and fever. Ultrasound shows gallbladder wall thickening.",
		progressNote: "Uncomplicated laparoscopic cholecystectomy. Tolerating diet.",
		dischargeNote: "Discharged home.\nSurgical clinic follow-up in 2 weeks.",
	},
	{
		name: "Samuel Girard", age: 19, gender: "Male",
		admitted: "2024-07-04", discharged: "2024-07-06",
		physician: SHAH, nurse: JF, clinic: LIMOILOU,
		diagnosis: "Diabetic ketoacidosis, type 1 diabetes",
		medication: ["Insulin glargine 22 units at bedtime", "Insulin lispro per carbohydrate ratio with meals"],
		instructions: "Never skip basal insulin, even when sick. Check ketones if glucose is above 14 mmol/L.",
		admissionNote: "Vomiting and abdominal pain. Glucose 31 mmol/L, pH 7.18, ketones positive.",
		progressNote: "Anion gap closed on insulin infusion. Transitioned to subcutaneous insulin.",
		dischargeNote: "Sick-day rules reviewed with patient and parent.\nDiabetes educator visit in 1 week.",
	},
	{
		name: "Claire Morin", age: 69, gender: "Female",
		admitted: "2024-08-12", discharged: "2024-08-16",
		physician: BROWN, nurse: CHANTAL, clinic: ST_ROCH,
		diagnosis: "Atrial fibrillation with rapid ventricular response",
		medication: ["Metoprolol 50 mg twice daily", "Apixaban 5 mg twice daily"],
		instructions: "Take apixaban at the same times every day. Report any unusual bleeding.",
		admissionNote: "Palpitations and dizziness. ECG: atrial fibrillation at 142 bpm.",
		progressNote: "Rate controlled on metoprolol. Echocardiogram shows normal function.",
		dischargeNote: "Heart rate 70–85 at rest.\nCardiology follow-up in 6 weeks.",
	},
	{
		name: "Étienne Lavallée", age: 41, gender: "Male",
		admitted: "2024-09-01", discharged: "2024-09-03",
		physician: GAGNON, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Kidney stone (right ureter)",
		medication: ["Tamsulosin 0.4 mg daily for 2 weeks", "Ketorolac 10 mg every 6 hours as needed for 5 days"],
		instructions: "Strain your urine and bring any stone to the clinic. Drink at least 2.5 L of water a day.",
		admissionNote: "Severe right flank pain radiating to the groin. CT shows a 5 mm ureteral stone.",
		progressNote: "Pain controlled. No fever, kidney function normal.",
		dischargeNote: "Discharged for trial of passage.\nUrology follow-up with repeat imaging in 3 weeks.",
	},
	{
		name: "Hélène Caron", age: 88, gender: "Female",
		admitted: "2024-09-18", discharged: "2024-09-25",
		physician: ROY, nurse: JF, clinic: LIMOILOU,
		diagnosis: "Delirium secondary to urinary tract infection",
		medication: ["Nitrofurantoin 100 mg twice daily for 5 days"],
		instructions: "Family to watch for new confusion. Keep glasses and hearing aids on during the day.",
		admissionNote: "New confusion over 2 days per daughter. Urinalysis positive.",
		progressNote: "More oriented today. Sleeping better with non-drug measures.",
		dischargeNote: "Back to baseline cognition per family.\nHome care nursing visit arranged.",
	},
	{
		name: "Vincent Ouellet", age: 36, gender: "Male",
		admitted: "2024-10-07", discharged: "2024-10-08",
		physician: SHAH, nurse: CHANTAL, clinic: ST_ROCH,
		diagnosis: "Concussion after cycling accident",
		medication: ["Acetaminophen 1000 mg every 6 hours as needed"],
		instructions: "Rest from screens and sport for 48 hours, then return gradually. No cycling until cleared.",
		admissionNote: "Fell from bicycle with helmet. Brief loss of consciousness. CT head normal.",
		progressNote: "Observed overnight. Headache mild, no vomiting.",
		dischargeNote: "Neurologically intact.\nReturn-to-sport protocol handed out.",
	},
	{
		name: "Mélanie Simard", age: 29, gender: "Female",
		admitted: "2024-10-21", discharged: "2024-10-23",
		physician: BROWN, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Hyperemesis gravidarum",
		medication: ["Doxylamine-pyridoxine 10/10 mg two tablets at bedtime", "Ondansetron 4 mg as needed"],
		instructions: "Small frequent meals. Return if unable to keep fluids down for 12 hours.",
		admissionNote: "Ten weeks pregnant with persistent vomiting. Ketones in urine, mild dehydration.",
		progressNote: "Rehydrated with IV fluids. Tolerating crackers and fluids.",
		dischargeNote: "Tolerating oral intake.\nObstetrics follow-up in 1 week.",
	},
	{
		name: "André Leclerc", age: 66, gender: "Male",
		admitted: "2024-11-04", discharged: "2024-11-09",
		physician: GAGNON, nurse: JF, clinic: LIMOILOU,
		diagnosis: "Upper gastrointestinal bleed, peptic ulcer",
		medication: ["Pantoprazole 40 mg twice daily for 8 weeks"],
		instructions: "Avoid ibuprofen, naproxen and aspirin. Return for black stools or vomiting blood.",
		admissionNote: "Black stools for 2 days, hemoglobin 82 g/L. Takes ibuprofen daily for back pain.",
		progressNote: "Endoscopy: duodenal ulcer treated. Hemoglobin stable after 1 unit of blood.",
		dischargeNote: "No further bleeding.\nH. pylori result to be followed by family physician.",
	},
	{
		name: "Julie Beaulieu", age: 52, gender: "Female",
		admitted: "2024-11-19", discharged: "2024-11-21",
		physician: ROY, nurse: CHANTAL, clinic: ST_ROCH,
		diagnosis: "Deep vein thrombosis, right leg",
		medication: ["Rivaroxaban 15 mg twice daily for 21 days, then 20 mg daily"],
		instructions: "Walk regularly and wear the compression stocking. Report chest pain or breathlessness right away.",
		admissionNote: "Right calf swelling and pain after a long flight. Doppler confirms DVT.",
		progressNote: "Anticoagulation started. No signs of pulmonary embolism.",
		dischargeNote: "Swelling improving.\nThrombosis clinic follow-up in 3 weeks.",
	},
	{
		name: "Olivier Paquette", age: 47, gender: "Male",
		admitted: "2024-12-02", discharged: "2024-12-04",
		physician: SHAH, nurse: HELENE, clinic: BEAUPRE,
		diagnosis: "Acute pancreatitis",
		medication: ["Acetaminophen 1000 mg every 6 hours as needed"],
		instructions: "No alcohol. Low-fat diet for 4 weeks.",
		admissionNote: "Severe epigastric pain radiating to the back. Lipase 5 times normal.",
		progressNote: "Pain settling with IV fluids and analgesia. Started on clear fluids.",
		dischargeNote: "Tolerating low-fat diet.\nAlcohol counselling referral made.",
	},
	{
		name: "Simone Arsenault", age: 74, gender: "Female",
		admitted: "2024-12-15", discharged: "2024-12-20",
		physician: BROWN, nurse: JF, clinic: LIMOILOU,
		diagnosis: "COVID-19 pneumonia",
		medication: ["Dexamethasone 6 mg daily to complete 10 days"],
		instructions: "Isolate until 5 days after symptoms started. Return if breathing gets harder.",
		admissionNote: "Fever and cough for 6 days, SpO2 89% on room air. PCR positive for SARS-CoV-2.",
		progressNote: "Oxygen weaned to 1 L/min. Eating well.",
		dischargeNote: "SpO2 94% on room air.\nFamily physician phone follow-up in 1 week.",
	},
];

const patients: PatientData[] = [
	{
		id: "d33ddc07-c051-4b7f-9999-c3eaf651a4c1",
		name: "John Doe",
		age: 32,
		gender: "Female",
		dateOfAdmission: "2023-07-15",
		admittingPhysician: "Dr. Michael Brown",
		dischargeSummary: {
			date: "2023-07-19",
			diagnosis: "Influenza A",
			medication: [
				"Oseltamivir 75 mg twice daily",
				"Acetaminophen 500 mg as needed for fever",
			],
			instructions:
				"Patient advised to get plenty of rest and avoid contact with others to prevent spread of the infection.",
		},
		nurse: "Infirmière Hélène",
		clinic: "Clinique Sainte-Anne-de-Beaupré",
		clinicalNotes: [
			{
				id: "3778b45b-fb29-4b9f-956a-f0207be20e6d",
				date: "2023-07-15",
				type: { id: "CN001", name: "Admission Note" },
				noteText:
					"Patient presented with high fever, cough, and fatigue. Suspected viral infection. Initial vitals: BP 120/80 mmHg, HR 85 bpm, RR 18 breaths/min, SpO2 96% on room air.",
			},
			{
				id: "d33ddc07-c051-4b7f-8cd6-c3eaf651a4c1",
				date: "2023-07-16",
				type: { id: "CN002", name: "Progress Note" },
				noteText:
					"Patient's condition improved. Started on antiviral medication. Fever reduced, cough persists. No signs of respiratory distress.",
			},
			{
				id: "a99010b1-90d2-4af6-a57d-0cfdbda6ebca",
				date: "2023-07-17",
				type: { id: "CN003", name: "Lab Results" },
				noteText:
					"Lab results show positive for influenza A. Continue antiviral treatment and supportive care.",
			},
			{
				id: "8557bfdf-189f-4f22-b4cd-08bc0713a033",
				date: "2023-07-18",
				type: { id: "CN004", name: "Consultation" },
				noteText:
					"Infectious disease consult requested. Consultation scheduled for further evaluation and management.",
			},
			{
				id: "e9f9b5b2-1446-4da0-a7cc-9b8264b77a97",
				date: "2023-07-19",
				type: { id: "CN005", name: "Discharge Note" },
				noteText:
					"Patient's condition significantly improved. Discharged with instructions to rest, hydrate, and complete antiviral course.\nFollow-up appointment scheduled in one week.",
			},
		],
	},
	{
		id: "5f2a9c4e-7b31-4d8a-9e62-1c0b7a3f8d24",
		name: "Marie Tremblay",
		age: 67,
		gender: "Female",
		dateOfAdmission: "2023-08-02",
		admittingPhysician: "Dr. Louise Gagnon",
		dischargeSummary: {
			date: "2023-08-09",
			diagnosis: "Community-acquired pneumonia",
			medication: [
				"Amoxicillin-clavulanate 875/125 mg twice daily for 7 days",
				"Azithromycin 500 mg once daily for 3 days",
			],
			instructions:
				"Complete the full antibiotic course. Return to the emergency department if shortness of breath worsens or fever returns.",
		},
		nurse: "Infirmier Jean-François",
		clinic: "CLSC de Limoilou",
		clinicalNotes: [
			{
				id: "b7e4d1a2-3c58-4f9e-8a16-2d9c0e5b7f31",
				date: "2023-08-02",
				type: { id: "CN001", name: "Admission Note" },
				noteText:
					"Patient admitted with productive cough, fever of 38.9°C and right-sided chest pain. SpO2 91% on room air, started on 2 L/min oxygen.",
			},
			{
				id: "c18f6e93-4a2d-4b7c-9e05-7f3a1d8c6b42",
				date: "2023-08-03",
				type: { id: "CN003", name: "Lab Results" },
				noteText:
					"Chest X-ray shows right lower lobe consolidation. WBC 14.2 x10^9/L, CRP elevated. Blood cultures pending.",
			},
			{
				id: "d29a7f04-5b3e-4c8d-af16-8e4b2c9d7a53",
				date: "2023-08-05",
				type: { id: "CN002", name: "Progress Note" },
				noteText:
					"Afebrile for 24 hours. Oxygen weaned off, SpO2 95% on room air. Appetite improving.",
			},
			{
				id: "e3ab8015-6c4f-4d9e-b027-9f5c3dae8b64",
				date: "2023-08-09",
				type: { id: "CN005", name: "Discharge Note" },
				noteText:
					"Clinically stable and discharged home with oral antibiotics.\nFamily physician follow-up in 10 days with repeat chest X-ray in 6 weeks.",
			},
		],
	},
	{
		id: "8c3e1b7d-2f64-4a9b-8d50-6e2f9a1c4b75",
		name: "Ahmed Benali",
		age: 54,
		gender: "Male",
		dateOfAdmission: "2023-09-11",
		admittingPhysician: "Dr. Michael Brown",
		dischargeSummary: {
			date: "2023-09-15",
			diagnosis: "Type 2 diabetes with hyperglycemia",
			medication: [
				"Metformin 1000 mg twice daily",
				"Insulin glargine 18 units at bedtime",
			],
			instructions:
				"Check blood glucose before meals and at bedtime. Follow the diabetic diet plan provided by the dietitian.",
		},
		nurse: "Infirmière Hélène",
		clinic: "Clinique Sainte-Anne-de-Beaupré",
		clinicalNotes: [
			{
				id: "f4bc9126-7d5a-4eaf-8138-a06d4ebf9c75",
				date: "2023-09-11",
				type: { id: "CN001", name: "Admission Note" },
				noteText:
					"Patient presented with polyuria, polydipsia and blurred vision. Capillary glucose 24.6 mmol/L. No ketones detected.",
			},
			{
				id: "05cd0237-8e6b-4fb0-9249-b17e5fc0ad86",
				date: "2023-09-12",
				type: { id: "CN004", name: "Consultation" },
				noteText:
					"Endocrinology and dietitian consulted. Basal insulin started, diabetes education session booked.",
			},
			{
				id: "16de1348-9f7c-4a01-a35a-c28f6ad1be97",
				date: "2023-09-15",
				type: { id: "CN005", name: "Discharge Note" },
				noteText:
					"Glucose readings between 6 and 10 mmol/L for 48 hours. Patient demonstrates correct insulin technique.\nFollow-up at the diabetes clinic in two weeks.",
			},
		],
	},
	{
		id: "a1d5f8e2-9c37-4b6e-a4f1-3b8d7c2e9f06",
		name: "Sophie Lavoie",
		age: 29,
		gender: "Female",
		dateOfAdmission: "2023-10-20",
		admittingPhysician: "Dr. Antoine Roy",
		dischargeSummary: {
			date: "2023-10-22",
			diagnosis: "Acute appendicitis, post laparoscopic appendectomy",
			medication: [
				"Acetaminophen 1000 mg every 6 hours as needed",
				"Ibuprofen 400 mg every 8 hours with food for 5 days",
			],
			instructions:
				"No heavy lifting for 2 weeks. Keep incisions clean and dry. Seek care for fever, redness or increasing abdominal pain.",
		},
		nurse: "Infirmier Jean-François",
		clinic: "CLSC de Limoilou",
		clinicalNotes: [
			{
				id: "27ef2459-a08d-4b12-b46b-d39a7be2cfa8",
				date: "2023-10-20",
				type: { id: "CN001", name: "Admission Note" },
				noteText:
					"Right lower quadrant pain for 18 hours with nausea. Positive McBurney's sign. Surgery consulted.",
			},
			{
				id: "38f0356a-b19e-4c23-857c-e4ab8cf3d0b9",
				date: "2023-10-20",
				type: { id: "CN003", name: "Lab Results" },
				noteText:
					"Ultrasound consistent with acute appendicitis. WBC 13.1 x10^9/L. Pregnancy test negative.",
			},
			{
				id: "4901467b-c2af-4d34-968d-f5bc9d04e1ca",
				date: "2023-10-21",
				type: { id: "CN002", name: "Progress Note" },
				noteText:
					"Post-op day 1 after uncomplicated laparoscopic appendectomy. Tolerating clear fluids, pain well controlled.",
			},
			{
				id: "5a12578c-d3b0-4e45-a79e-06cdae15f2db",
				date: "2023-10-22",
				type: { id: "CN005", name: "Discharge Note" },
				noteText:
					"Discharged home in good condition.\nWound check with the surgical clinic in 10 days.",
			},
		],
	},
	...morePatients.map((seed, index) => toPatient(seed, index + 1)),
];

export default patients;
