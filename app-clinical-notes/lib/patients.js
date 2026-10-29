"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const patients = [
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
            instructions: "Patient advised to get plenty of rest and avoid contact with others to prevent spread of the infection.",
        },
        nurse: "InfirmiÃ¨re HÃ©lÃ¨ne",
        clinic: "Clinique Sainte-Anne-de-BeauprÃ©",
        clinicalNotes: [
            {
                id: "3778b45b-fb29-4b9f-956a-f0207be20e6d",
                date: "2023-07-15",
                type: { id: "CN001", name: "Admission Note" },
                noteText: "Patient presented with high fever, cough, and fatigue. Suspected viral infection. Initial vitals: BP 120/80 mmHg, HR 85 bpm, RR 18 breaths/min, SpO2 96% on room air.",
            },
            {
                id: "d33ddc07-c051-4b7f-8cd6-c3eaf651a4c1",
                date: "2023-07-16",
                type: { id: "CN002", name: "Progress Note" },
                noteText: "Patient's condition improved. Started on antiviral medication. Fever reduced, cough persists. No signs of respiratory distress.",
            },
            {
                id: "a99010b1-90d2-4af6-a57d-0cfdbda6ebca",
                date: "2023-07-17",
                type: { id: "CN003", name: "Lab Results" },
                noteText: "Lab results show positive for influenza A. Continue antiviral treatment and supportive care.",
            },
            {
                id: "8557bfdf-189f-4f22-b4cd-08bc0713a033",
                date: "2023-07-18",
                type: { id: "CN004", name: "Consultation" },
                noteText: "Infectious disease consult requested. Consultation scheduled for further evaluation and management.",
            },
            {
                id: "e9f9b5b2-1446-4da0-a7cc-9b8264b77a97",
                date: "2023-07-19",
                type: { id: "CN005", name: "Discharge Note" },
                noteText: "Patient's condition significantly improved. Discharged with instructions to rest, hydrate, and complete antiviral course. \\nFollow-up appointment scheduled in one week.",
            },
        ],
    },
];
exports.default = patients;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0YS9wYXRpZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLE1BQU0sUUFBUSxHQUFrQjtJQUMvQjtRQUNDLEVBQUUsRUFBRSxzQ0FBc0M7UUFDMUMsSUFBSSxFQUFFLFVBQVU7UUFDaEIsR0FBRyxFQUFFLEVBQUU7UUFDUCxNQUFNLEVBQUUsUUFBUTtRQUNoQixlQUFlLEVBQUUsWUFBWTtRQUM3QixrQkFBa0IsRUFBRSxtQkFBbUI7UUFDdkMsZ0JBQWdCLEVBQUU7WUFDakIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsU0FBUyxFQUFFLGFBQWE7WUFDeEIsVUFBVSxFQUFFO2dCQUNYLCtCQUErQjtnQkFDL0IsMENBQTBDO2FBQzFDO1lBQ0QsWUFBWSxFQUNYLHlHQUF5RztTQUMxRztRQUNELEtBQUssRUFBRSxzQkFBc0I7UUFDN0IsTUFBTSxFQUFFLGtDQUFrQztRQUMxQyxhQUFhLEVBQUU7WUFDZDtnQkFDQyxFQUFFLEVBQUUsc0NBQXNDO2dCQUMxQyxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7Z0JBQzdDLFFBQVEsRUFDUCx1S0FBdUs7YUFDeEs7WUFDRDtnQkFDQyxFQUFFLEVBQUUsc0NBQXNDO2dCQUMxQyxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO2dCQUM1QyxRQUFRLEVBQ1AsaUlBQWlJO2FBQ2xJO1lBQ0Q7Z0JBQ0MsRUFBRSxFQUFFLHNDQUFzQztnQkFDMUMsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRTtnQkFDMUMsUUFBUSxFQUNQLDhGQUE4RjthQUMvRjtZQUNEO2dCQUNDLEVBQUUsRUFBRSxzQ0FBc0M7Z0JBQzFDLElBQUksRUFBRSxZQUFZO2dCQUNsQixJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7Z0JBQzNDLFFBQVEsRUFDUCxxR0FBcUc7YUFDdEc7WUFDRDtnQkFDQyxFQUFFLEVBQUUsc0NBQXNDO2dCQUMxQyxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7Z0JBQzdDLFFBQVEsRUFDUCwyS0FBMks7YUFDNUs7U0FDRDtLQUNEO0NBQ0QsQ0FBQztBQUVGLGtCQUFlLFFBQVEsQ0FBQyJ9