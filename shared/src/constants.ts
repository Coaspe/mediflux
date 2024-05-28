// Socket event
export const JOIN_ROOM = "join-room";
export const CONNECTED_USERS = "connected-users";
export const LOCK_RECORD = "lock-record";
export const SAVE_RECORD = "save-record";
export const DELETE_RECORD = "delete-record";
export const CONNECTION = "connection";
export const USER_JOINED = "user-join";
export const CREATE_RECORD = "create-record";
export const CONNECT = "connect";
export const ROOM_ID = '100';
export const CANCEL_EDITING = 'cancel-editing'
export const UNLOCK_RECORD = 'unlock-record'

// Treatment
export const SHURINK = '슈링크'
export const INMODE = '인모드'
export const OLIGIO = '올리지오'
export const ULTHERA = '울쎄라'
export const THERMAGE = '써마지'
export const LDM = 'LDM'
export const LIFTING = '리프팅'
export const LASERTONING = '색소 레이저'
export const TATTOOLASER = '문신제거'
export const DOTLASER = '점 제거'

export type TreatmentCategory =
    | typeof SHURINK
    | typeof INMODE
    | typeof OLIGIO
    | typeof ULTHERA
    | typeof THERMAGE
    | typeof LDM
    | typeof LIFTING
    | typeof LASERTONING
    | typeof TATTOOLASER
    | typeof DOTLASER;