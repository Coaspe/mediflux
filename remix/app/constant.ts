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
        doctor: "문지원",
        checkInTime: 1716729790,
        chartNum: '48047',
        opReadiness: true,
        treatment1: '울쎄라 600샷',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '이지혜',
        skincareSpecialist2: '김김김',
        nursingStaff1: '이이이',
        nursingStaff2: '이이이',
        coordinator: '신아영',
        consultant: '김진하',
        commentCaution: '배가 많이 고픈 상태'
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
export const FIELDS_STAFF = ['피부1', '피부2', '코디', '상담']
export const FIELDS_NURSE = ['간호1', '간호2']
export const FIELDS_DOCTOR = ['의사']
export const FIELDS_PAITENT = ['고객 이름']