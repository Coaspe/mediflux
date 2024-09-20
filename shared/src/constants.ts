/** @format */

// Socket event
export const JOIN_ROOM = "join-room";
export const CONNECTED_USERS = "connetced-users";
export const LOCK_RECORD = "lock-record";
export const SAVE_RECORD = "save-record";
export const DELETE_RECORD = "delete-record";
export const CREATE_RECORD = "create-record";
export const LOCK_EXCEPT_RECORD = "lock-except-record";
export const SAVE_EXCEPT_RECORD = "save-except-record";
export const DELETE_EXCEPT_RECORD = "delete-except-record";
export const CREATE_EXCEPT_RECORD = "create-except-record";
export const CONNECTION = "connection";
export const USER_JOINED = "user-join";
export const CONNECT = "connect";
export const SCHEDULING_ROOM_ID = "100";
export const ARCHIVE_ROOM_ID = "200";
export const CANCEL_EDITING = "cancel-editing";
export const UNLOCK_RECORD = "unlock-record";
export const PORT = 5000;

export const KEY_OF_SERVER_PRECORD = [
  "id",
  "created_at",
  "chart_num",
  "patient_name",
  "op_readiness",
  "treatment_1",
  "treatment_2",
  "treatment_3",
  "treatment_4",
  "treatment_5",
  "quantity_treat_1",
  "quantity_treat_2",
  "quantity_treat_3",
  "quantity_treat_4",
  "quantity_treat_5",
  "treatment_room",
  "doctor_1",
  "doctor_2",
  "doctor_3",
  "doctor_4",
  "doctor_5",
  "anesthesia_note",
  "skincare_specialist_1",
  "skincare_specialist_2",
  "nursing_staff_1",
  "nursing_staff_2",
  "coordinator",
  "consultant",
  "comment_caution",
  "locking_user",
  "patient_care_room",
  "treatment_ready_1",
  "treatment_ready_2",
  "treatment_ready_3",
  "treatment_ready_4",
  "treatment_ready_5",
  "treatment_end_1",
  "treatment_end_2",
  "treatment_end_3",
  "treatment_end_4",
  "treatment_end_5",
  "treatment_start_1",
  "treatment_start_2",
  "treatment_start_3",
  "treatment_start_4",
  "treatment_start_5",
  "delete_yn",
];
const snakeToCamel = (origin: string) => {
  return origin
    .split("_")
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
};
export const KEY_OF_CLIENT_PRECORD = KEY_OF_SERVER_PRECORD.map((key) => snakeToCamel(key));
export const KEY_OF_SERVER_TREATMENT = ["id", "group", "title", "duration", "point", "price"];
export const KEY_OF_CLIENT_TREATMENT = [...KEY_OF_SERVER_TREATMENT];

export type SearchHelp = {
  id: string;
  group: string;
  title: string;
};

export const INTERNAL_SERVER_ERROR = "Internal server error";
