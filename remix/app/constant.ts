import { OpReadiness, PRecord, SearchHelp } from "./type";

export const SIDE_MENU = {
  SCHEDULING: "scheduling",
  MYWORKS: "myworks",
} as const;

export const ROLE = {
  DOCTOR: "doctor",
  NURSE: "nurse",
  STAFF: "staff",
} as const;

export const MOCK: PRecord[] = [];

const doctorAndStaffIds = ["1", "2", "3", "4", "5", "6"];
const opReadinessOptions: OpReadiness[] = ["P", "N", "C"];
const treatmentOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
const patientNames = [
  "나나미",
  "김미미",
  "내루미",
  "폴킴",
  "제임스",
  "사이먼",
  "조지",
  "마이크",
  "리사",
  "수지",
]; // 예시 이름 리스트

const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

for (let i = 1; i <= 1000; i++) {
  const record: PRecord = {
    id: i.toString(),
    patientName: getRandomElement(patientNames),
    doctor: getRandomElement(doctorAndStaffIds),
    checkInTime: Date.now() - Math.floor(Math.random() * 1000000000),
    chartNum: Math.floor(Math.random() * 100000000).toString(),
    opReadiness: getRandomElement(opReadinessOptions),
    treatment1: getRandomElement(treatmentOptions),
    quantityTreat1: Math.floor(Math.random() * 5) + 1, // 1부터 5까지의 숫자
    treatmentRoom: Math.floor(Math.random() * 10) + 1, // 1부터 10까지의 숫자
    anesthesiaNote: "눈 마취 안 하심",
    skincareSpecialist1: getRandomElement(doctorAndStaffIds),
    skincareSpecialist2: getRandomElement(doctorAndStaffIds),
    nursingStaff1: getRandomElement(doctorAndStaffIds),
    nursingStaff2: getRandomElement(doctorAndStaffIds),
    coordinator: getRandomElement(doctorAndStaffIds),
    consultant: getRandomElement(doctorAndStaffIds),
    commentCaution: "배가 많이 고픈 상태",
  };

  MOCK.push(record);
}

const opReadinessOptions2: OpReadiness[] = ["Y"];
export const MOCK2: PRecord[] = [];

for (let i = 1; i <= 1000; i++) {
  const record: PRecord = {
    id: (i + 100).toString(),
    patientName: getRandomElement(patientNames),
    doctor: getRandomElement(doctorAndStaffIds),
    checkInTime: Date.now() - Math.floor(Math.random() * 1000000000),
    chartNum: Math.floor(Math.random() * 100000000).toString(),
    opReadiness: getRandomElement(opReadinessOptions2),
    treatment1: getRandomElement(treatmentOptions),
    quantityTreat1: Math.floor(Math.random() * 5) + 1, // 1부터 5까지의 숫자
    treatmentRoom: Math.floor(Math.random() * 10) + 1, // 1부터 10까지의 숫자
    anesthesiaNote: "눈 마취 안 하심",
    skincareSpecialist1: getRandomElement(doctorAndStaffIds),
    skincareSpecialist2: getRandomElement(doctorAndStaffIds),
    nursingStaff1: getRandomElement(doctorAndStaffIds),
    nursingStaff2: getRandomElement(doctorAndStaffIds),
    coordinator: getRandomElement(doctorAndStaffIds),
    consultant: getRandomElement(doctorAndStaffIds),
    commentCaution: "배가 많이 고픈 상태",
  };

  MOCK2.push(record);
}

export const CHECK_IN_TIME = "checkInTime";
export const CHECK_IN_TIME_H = "수납시간";
export const CHART_NUMBER = "chartNum";
export const CHART_NUMBER_H = "차트번호";
export const PATIENT_NAME = "patientName";
export const PATIENT_NAME_H = "고객이름";
export const OP_READINESS = "opReadiness";
export const OP_READINESS_H = "상태";
export const TREATMENT1 = "treatment1";
export const TREATMENT1_H = "시술";
export const QUANTITYTREAT1 = "quantityTreat1";
export const QUANTITYTREAT1_H = "수량";
export const TREATMENT_ROOM = "treatmentRoom";
export const TREATMENT_ROOM_H = "시술실";
export const DOCTOR = "doctor";
export const DOCTOR_H = "의사";
export const ANESTHESIANOTE = "anesthesiaNote";
export const ANESTHESIANOTE_H = "마취 시간";
export const SKINCARESPECIALIST1 = "skincareSpecialist1";
export const SKINCARESPECIALIST1_H = "피부1";
export const SKINCARESPECIALIST2 = "skincareSpecialist2";
export const SKINCARESPECIALIST2_H = "피부2";
export const NURSINGSTAFF1 = "nursingStaff1";
export const NURSINGSTAFF1_H = "간호1";
export const NURSINGSTAFF2 = "nursingStaff2";
export const NURSINGSTAFF2_H = "간호2";
export const COORDINATOR = "coordinator";
export const COORDINATOR_H = "코디";
export const CONSULTANT = "consultant";
export const CONSULTANT_H = "상담";
export const COMMENTCAUTION = "commentCaution";
export const COMMENTCAUTION_H = "비고/주의";

export const SHORT_COLUMN_LENGTH = 110;
export const SHORT_CENTER_JUSTIFIED_COLUMN_LENGTH = 140;
export const MEDIUM_COLUMN_LENGTH = 120;
export const MEDIUM_CENTER_JUSTIFIED_COLUMN_LENGTH = 150;

export const LONG_JUSTIFIED_CENTER_COLUMN_LENGTH = 190;
export const LONG_LEFT_JUSTIFIED_COLUMN_LENGTH = 120;

export const FIELDS_STAFF = ["피부1", "피부2", "코디", "상담"];
export const FIELDS_NURSE = ["간호1", "간호2"];
export const FIELDS_DOCTOR = ["의사"];
export const FIELDS_PAITENT = ["고객 이름"];

export const DOCTORS: SearchHelp[] = [
  { id: "1", group: "", title: "이우람" },
  { id: "2", group: "", title: "강승완" },
  { id: "3", group: "", title: "황희찬" },
  { id: "4", group: "", title: "손흥민" },
  { id: "5", group: "", title: "즐라탄" },
  { id: "6", group: "", title: "매머드" },
];

export const EMPTY_SEARCHHELP: SearchHelp = {
  id: "",
  group: "",
  title: "",
};
