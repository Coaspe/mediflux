import { PRecord } from "./type";

export const SIDE_MENU = {
    SCHEDULING: 'scheduling',
    MYWORKS: 'myworks'
} as const;

export const ROLE = {
    DOCTOR: "doctor",
    NURSE: "nurse",
    STAFF: "staff"
} as const

export const JOIN_ROOM = "join-room";
export const CONNECTED_USERS = "connected-users";
export const LOCK_RECORD = "lock-record";
export const SAVE_RECORD = "save-record";
export const DELETE_RECORD = "delete-record";
export const CONNECTION = "connection";
export const USER_JOINED = "user-join";
export const CREATE_RECORD = "create-record";
export const CONNECT = "connect";
export const ROOM_ID = 100;
export const CANCEL_EDITING = 'cancel-editing'
export const UNLOCK_RECORD = 'unlock-record'

export const mock: PRecord[] = [
    {
        id: "1",
        patientName: "나나미",
        doctor: "이우람",
        checkInTime: 1716729790,
        chartNum: '131242',
        opReadiness: true,
        treatment1: '리쥬란',
        quantityTreat1: 2,
        treatmentRoom: 3,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '김김김',
        skincareSpecialist2: '김김김',
        nursingStaff1: '이이이',
        nursingStaff2: '이이이',
        coordinator: '김코디',
        consultant: '김상담',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "2",
        patientName: "나나미",
        doctor: "이우람",
        checkInTime: 1716729790,
    } as PRecord,
    {
        id: "3",
        patientName: "나나미",
        doctor: "이우람",
        checkInTime: 1716729790,
    } as PRecord,
    {
        id: "4",
        patientName: "나나미",
        doctor: "이우람",
        checkInTime: 1716729790,
    } as PRecord,
    {
        id: "5",
        patientName: "나나미",
        doctor: "이우람",
        checkInTime: 1716729790,
    } as PRecord,
];

const DOCTORS = []