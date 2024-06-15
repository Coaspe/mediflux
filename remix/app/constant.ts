import { PRecord, SearchHelp } from "./type";

export const SIDE_MENU = {
    SCHEDULING: 'scheduling',
    MYWORKS: 'myworks'
} as const;

export const ROLE = {
    DOCTOR: "doctor",
    NURSE: "nurse",
    STAFF: "staff"
} as const


export const MOCK: PRecord[] = [
    {
        id: "1",
        patientName: "나나미",
        doctor: "1",
        checkInTime: 1717686534,
        chartNum: '131242',
        opReadiness: 'C',
        treatment1: '1',
        quantityTreat1: 2,
        treatmentRoom: 3,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '2',
        skincareSpecialist2: '3',
        nursingStaff1: '4',
        nursingStaff2: '5',
        coordinator: '5',
        consultant: '5',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "2",
        patientName: "김미미",
        doctor: "",
        checkInTime: 1716729890,
        chartNum: '12412312',
        opReadiness: 'N',
        treatment1: '2',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '3',
        skincareSpecialist2: '4',
        nursingStaff1: '5',
        nursingStaff2: '5',
        coordinator: '6',
        consultant: '6',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "3",
        patientName: "내루미",
        doctor: "1",
        checkInTime: 1716729990,
        chartNum: '2341241',
        opReadiness: 'C',
        treatment1: '3',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '2',
        skincareSpecialist2: '1',
        nursingStaff1: '2',
        nursingStaff2: '3',
        coordinator: '3',
        consultant: '4',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "4",
        patientName: "폴킴",
        doctor: "5",
        checkInTime: 1716729790,
        chartNum: '123124',
        opReadiness: 'P',
        treatment1: '4',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '5',
        skincareSpecialist2: '2',
        nursingStaff1: '3',
        nursingStaff2: '4',
        coordinator: '1',
        consultant: '2',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "5",
        patientName: "제임스",
        doctor: "6",
        checkInTime: 1716729790,
        chartNum: '1231214',
        opReadiness: 'P',
        treatment1: '5',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '2',
        skincareSpecialist2: '4',
        nursingStaff1: '3',
        nursingStaff2: '1',
        coordinator: '2',
        consultant: '3',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,

];

export const MOCK2: PRecord[] = [

    {
        id: "10",
        patientName: "나나미",
        doctor: "",
        checkInTime: 1717686534,
        chartNum: '131242',
        opReadiness: 'Y',
        treatment1: '1',
        quantityTreat1: 2,
        treatmentRoom: 3,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '2',
        skincareSpecialist2: '3',
        nursingStaff1: '4',
        nursingStaff2: '5',
        coordinator: '5',
        consultant: '5',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "6",
        patientName: "김미미",
        doctor: "",
        checkInTime: 1716729890,
        chartNum: '12412312',
        opReadiness: 'Y',
        treatment1: '2',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '3',
        skincareSpecialist2: '4',
        nursingStaff1: '5',
        nursingStaff2: '5',
        coordinator: '6',
        consultant: '6',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "7",
        patientName: "내루미",
        doctor: "",
        checkInTime: 1716729990,
        chartNum: '2341241',
        opReadiness: 'Y',
        treatment1: '3',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '2',
        skincareSpecialist2: '1',
        nursingStaff1: '2',
        nursingStaff2: '3',
        coordinator: '3',
        consultant: '4',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "8",
        patientName: "폴킴",
        doctor: "",
        checkInTime: 1716729790,
        chartNum: '123124',
        opReadiness: 'Y',
        treatment1: '4',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '5',
        skincareSpecialist2: '2',
        nursingStaff1: '3',
        nursingStaff2: '4',
        coordinator: '1',
        consultant: '2',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
    {
        id: "9",
        patientName: "제임스",
        doctor: "",
        checkInTime: 1716729790,
        chartNum: '1231214',
        opReadiness: 'Y',
        treatment1: '5',
        quantityTreat1: 1,
        treatmentRoom: 8,
        anesthesiaNote: "눈 마취 안 하심",
        skincareSpecialist1: '2',
        skincareSpecialist2: '4',
        nursingStaff1: '3',
        nursingStaff2: '1',
        coordinator: '2',
        consultant: '3',
        commentCaution: '배가 많이 고픈 상태'
    } as PRecord,
];
export const CHECK_IN_TIME = 'checkInTime'
export const CHECK_IN_TIME_H = '수납시간'
export const CHART_NUMBER = 'chartNum'
export const CHART_NUMBER_H = '차트번호'
export const PATIENT_NAME = 'patientName'
export const PATIENT_NAME_H = '고객이름'
export const OP_READINESS = 'opReadiness'
export const OP_READINESS_H = '상태'
export const TREATMENT1 = 'treatment1'
export const TREATMENT1_H = '시술'
export const QUANTITYTREAT1 = 'quantityTreat1'
export const QUANTITYTREAT1_H = '수량'
export const TREATMENT_ROOM = 'treatmentRoom'
export const TREATMENT_ROOM_H = '시술실'
export const DOCTOR = 'doctor'
export const DOCTOR_H = '의사'
export const ANESTHESIANOTE = 'anesthesiaNote'
export const ANESTHESIANOTE_H = '마취 시간'
export const SKINCARESPECIALIST1 = 'skincareSpecialist1'
export const SKINCARESPECIALIST1_H = '피부1'
export const SKINCARESPECIALIST2 = 'skincareSpecialist2'
export const SKINCARESPECIALIST2_H = '피부2'
export const NURSINGSTAFF1 = 'nursingStaff1'
export const NURSINGSTAFF1_H = '간호1'
export const NURSINGSTAFF2 = 'nursingStaff2'
export const NURSINGSTAFF2_H = '간호2'
export const COORDINATOR = 'coordinator'
export const COORDINATOR_H = '코디'
export const CONSULTANT = 'consultant'
export const CONSULTANT_H = '상담'
export const COMMENTCAUTION = 'commentCaution'
export const COMMENTCAUTION_H = '비고/주의'

export const SHORT_COLUMN_LENGTH = 110
export const SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH = 140
export const MEDIUM_COLUMN_LENGTH = 120
export const MEDIUM_CENTER_JUSTIFIED_COLUMN_LENGTH = 150

export const LONG_JUSTIFIED_CENTER_COLUMN_LENGTH = 190
export const LONG_LEFT_JUSTIFIED_COLUMN_LENGTH = 120

export const FIELDS_STAFF = ['피부1', '피부2', '코디', '상담']
export const FIELDS_NURSE = ['간호1', '간호2']
export const FIELDS_DOCTOR = ['의사']
export const FIELDS_PAITENT = ['고객 이름']


export const DOCTORS: SearchHelp[] = [
    { id: '1', group: '', title: '이우람', },
    { id: '2', group: '', title: '강승완', },
    { id: '3', group: '', title: '황희찬', },
    { id: '4', group: '', title: '손흥민', },
    { id: '5', group: '', title: '즐라탄', },
    { id: '6', group: '', title: '매머드', },
]

export const EMPTY_SEARCHHELP: SearchHelp = {
    id: '',
    group: '',
    title: '',
}