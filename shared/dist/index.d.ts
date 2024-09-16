/** @format */

declare module "shared" {
  export const JOIN_ROOM: string;
  export const CONNECTED_USERS: string;
  export const LOCK_RECORD: string;
  export const SAVE_RECORD: string;
  export const DELETE_RECORD: string;
  export const CONNECTION: string;
  export const USER_JOINED: string;
  export const CREATE_RECORD: string;
  export const CONNECT: string;
  export const SCHEDULING_ROOM_ID: string;
  export const ARCHIVE_ROOM_ID: string;
  export const CANCEL_EDITING: string;
  export const UNLOCK_RECORD: string;
  // export const TREATMENT_CATEGORY: string[];
  export const SHURINK: string;
  export const INMODE: string;
  export const OLIGIO: string;
  export const ULTHERA: string;
  export const THERMAGE: string;
  export const LDM: string;
  export const LIFTING: string;
  export const LASER_TONING: string;
  export const TATTOO_LASER: string;
  export const DOT_LASER: string;
  export const TREATMENTS: { id: string; group: TreatmentCategory; title: string }[];
  export const ROLE: {
    readonly DOCTOR: "doctor";
    readonly NURSE: "nurse";
    readonly STAFF: "staff";
  };

  export const KEY_OF_SERVER_PRECORD: string[];
  export const KEY_OF_CLIENT_PRECORD: string[];
  export const KEY_OF_SERVER_TREATMENT: string[];
  export const KEY_OF_CLIENT_TREATMENT: string[];
  export const PORT: number;

  export type TreatmentCategory = SHURINK | INMODE | OLIGIO | ULTHERA | THERMAGE | LDM | LIFTING | LASER_TONING | TATTOO_LASER | DOT_LASER;
  export type ServerUser = {
    id: string;
    first_name: string;
    last_name: string;
    login_id: string;
    login_pw: string;
    role: Role;
    session_id?: string;
    clinic: string;
  };

  export type Role = (typeof ROLE)[keyof typeof ROLE];
  // Do not change fields order arbitrarily.
  export type PRecord = {
    id: string; // Unique record id
    createdAt?: string; // TIMESTAMP (e.g., "14:08")
    chartNum?: string; // VARCHAR (15)
    patientName?: string; // VARCHAR (100)
    opReadiness?: OpReadiness; // BOOLEAN (e.g., "T", "F" interpreted as true/false)
    treatment1?: string; // VARCHAR (50)
    treatment2?: string; // VARCHAR (50), optional
    treatment3?: string; // VARCHAR (50), optional
    treatment4?: string; // VARCHAR (50), optional
    treatment5?: string; // VARCHAR (50), optional
    treatmentReady1?: string;
    treatmentReady2?: string;
    treatmentReady3?: string;
    treatmentReady4?: string;
    treatmentReady5?: string;
    treatmentStart1?: string;
    treatmentStart2?: string;
    treatmentStart3?: string;
    treatmentStart4?: string;
    treatmentStart5?: string;
    treatmentEnd1?: string;
    treatmentEnd2?: string;
    treatmentEnd3?: string;
    treatmentEnd4?: string;
    treatmentEnd5?: string;
    quantityTreat1?: number; // INTEGER
    quantityTreat2?: number; // INTEGER, optional
    quantityTreat3?: number; // INTEGER, optional
    quantityTreat4?: number; // INTEGER, optional
    quantityTreat5?: number; // INTEGER, optional
    treatmentRoom?: number; // INTEGER
    doctor1?: string; // VARCHAR (50)
    doctor2?: string; // VARCHAR (50)
    doctor3?: string; // VARCHAR (50)
    doctor4?: string; // VARCHAR (50)
    doctor5?: string; // VARCHAR (50)
    patientCareRoom?: string;
    anesthesiaNote?: string; // VARCHAR (300), optional
    skincareSpecialist1?: string; // VARCHAR (50)
    skincareSpecialist2?: string; // VARCHAR (50), optional
    nursingStaff1?: string; // VARCHAR (50)
    nursingStaff2?: string; // VARCHAR (50), optional
    coordinator?: string; // VARCHAR (50)
    consultant?: string; // VARCHAR (50)
    commentCaution?: string; // VARCHAR (300), optional
    lockingUser?: string | null;
    deleteYn?: boolean;
    [key: string]: any;
  };
  export type ServerPRecord = {
    id: string; // Unique record id
    created_at?: number; // TIMESTAMP (e.g., "14:08")
    chart_num?: string; // VARCHAR (15)
    patient_name?: string; // VARCHAR (100)
    op_readiness?: OpReadiness; // BOOLEAN (e.g., "T", "F" interpreted as true/false)
    treatment_1?: string; // VARCHAR (50)
    treatment_2?: string; // VARCHAR (50), optional
    treatment_3?: string; // VARCHAR (50), optional
    treatment_4?: string; // VARCHAR (50), optional
    treatment_5?: string; // VARCHAR (50), optional
    treatment_ready_1?: number;
    treatment_ready_2?: number;
    treatment_ready_3?: number;
    treatment_ready_4?: number;
    treatment_ready_5?: number;
    treatment_start_1?: number;
    treatment_start_2?: number;
    treatment_start_3?: number;
    treatment_start_4?: number;
    treatment_start_5?: number;
    treatment_end_1?: number;
    treatment_end_2?: number;
    treatment_end_3?: number;
    treatment_end_4?: number;
    treatment_end_5?: number;
    quantity_treat_1?: number; // INTEGER
    quantity_treat_2?: number; // INTEGER, optional
    quantity_treat_3?: number; // INTEGER, optional
    quantity_treat_4?: number; // INTEGER, optional
    quantity_treat_5?: number; // INTEGER, optional
    treatment_room?: number; // INTEGER
    patient_care_room?: string;
    doctor: string;
    doctor_1?: string; // VARCHAR (50)
    doctor_2?: string; // VARCHAR (50)
    doctor_3?: string; // VARCHAR (50)
    doctor_4?: string; // VARCHAR (50)
    doctor_5?: string; // VARCHAR (50)
    anesthesia_note?: string; // VARCHAR (300), optional
    skincare_specialist_1?: string; // VARCHAR (50)
    skincare_specialist_2?: string; // VARCHAR (50), optional
    nursing_staff_1?: string; // VARCHAR (50)
    nursing_staff_2?: string; // VARCHAR (50), optional
    coordinator?: string; // VARCHAR (50)
    consultant?: string; // VARCHAR (50)
    comment_caution?: string; // VARCHAR (300), optional
    locking_user?: string | null;
    delete_yn?: boolean;
    [key: string]: any;
  };
}
