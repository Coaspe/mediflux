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
export const CANCEL_EDITING = 'cancel-editing';
export const UNLOCK_RECORD = 'unlock-record';
export const PORT = 5000

// Treatment
export const SHURINK = '슈링크';
export const INMODE = '인모드';
export const OLIGIO = '올리지오';
export const ULTHERA = '울쎄라';
export const THERMAGE = '써마지';
export const LDM = 'LDM';
export const LIFTING = '리프팅';
export const LASER_TONING = '색소 레이저';
export const TATTOO_LASER = '문신제거';
export const DOT_LASER = '점 제거';

export const TREATMENT_CATEGORY = [
    SHURINK,
    INMODE,
    OLIGIO,
    ULTHERA,
    THERMAGE,
    LDM,
    LIFTING,
    LASER_TONING,
    TATTOO_LASER,
    DOT_LASER,
];

export const TREATEMENTS: SearchHelp[] = [
    { id: '1', group: SHURINK, title: '슈링크 유니버스 울트라 MP모드 300샷' },
    { id: '2', group: SHURINK, title: '슈링크 유니버스 울트라 MP모드 100샷' },
    { id: '3', group: SHURINK, title: '슈링크 유니버스 부스터 300샷 + 전용 앰플' },
    { id: '4', group: SHURINK, title: '슈링크 유니버스 부스터 600샷 + 전용 앰플' },
    { id: '4', group: SHURINK, title: '슈링크 유니버스 울트라 MP 모드 300샷 + 부트서 300샷 + 전용 앰플' },
    { id: '5', group: SHURINK, title: '아이 슈링크 100샷' },
    { id: '6', group: SHURINK, title: '더마 슈링크 100샷 (이마, 목주름)' },
    { id: '7', group: INMODE, title: '인모드 FX 1부위' },
    { id: '8', group: INMODE, title: '인모드 FORMA 1부위' },
]

export type SearchHelp = {
    id: string,
    group: string,
    title: string,
}