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
  export const PORT: number;
  //     export type Treatment = {
  //         name: string;
  //         treatmentTime: number;
  //         assistTime: number;
  //         // materialCategory: MaterialCategory;
  //     };

  export type TreatmentCategory =
    | typeof SHURINK
    | typeof INMODE
    | typeof OLIGIO
    | typeof ULTHERA
    | typeof THERMAGE
    | typeof LDM
    | typeof LIFTING
    | typeof LASER_TONING
    | typeof TATTOO_LASER
    | typeof DOT_LASER;
}
