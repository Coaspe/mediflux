import { ROLE, SIDE_MENU } from "~/constant";

export type SideMenu = typeof SIDE_MENU[keyof typeof SIDE_MENU];
export type Role = typeof ROLE[keyof typeof ROLE]
export type User = {
    id: string
    name: string
    image?: string
    role?: Role
}

export type PRecord = {
    id: string // Unique record id
    checkInTime?: number;  // TIMESTAMP (e.g., "14:08")
    chartNum?: string;  // VARCHAR (15)
    patientName?: string;  // VARCHAR (100)
    opReadiness?: boolean;  // BOOLEAN (e.g., "T", "F" interpreted as true/false)
    treatment1?: string;  // VARCHAR (50)
    treatment2?: string;  // VARCHAR (50), optional
    treatment3?: string;  // VARCHAR (50), optional
    treatment4?: string;  // VARCHAR (50), optional
    treatment5?: string;  // VARCHAR (50), optional
    quantityTreat1?: number;  // INTEGER
    quantityTreat2?: number;  // INTEGER, optional
    quantityTreat3?: number;  // INTEGER, optional
    quantityTreat4?: number;  // INTEGER, optional
    quantityTreat5?: number;  // INTEGER, optional
    treatmentRoom?: number;  // INTEGER
    doctor?: string;  // VARCHAR (50)
    anesthesiaNote?: string;  // VARCHAR (300), optional
    skincareSpecialist1?: string;  // VARCHAR (50)
    skincareSpecialist2?: string;  // VARCHAR (50), optional
    nursingStaff1?: string;  // VARCHAR (50)
    nursingStaff2?: string;  // VARCHAR (50), optional
    coordinator?: string;  // VARCHAR (50)
    consultant?: string;  // VARCHAR (50)
    commentCaution?: string;  // VARCHAR (300), optional
    LockingUser?: User | null;
};