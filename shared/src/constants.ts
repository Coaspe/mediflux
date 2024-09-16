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

export const SHURINK = "슈링크";
export const INMODE = "인모드";
export const ULTHERA = "울쎄라";
export const TITANIUM = "티타늄";
export const JUVEDERM = "쥬베룩";
export const EXCELV = "엑셀브이";
export const PICOSURE = "피코슈어";
export const BOOSTER = "부스터";
export const FILLER = "필러";
export const BOTOX = "보톡스";
export const IV_THERAPY = "수액";
export const OLIGIO = "올리지오";
export const POTENZA = "포텐자";
export const ERBIUM = "어븀";
export const ETC = "기타";

// Treatment
export const TREATMENT_CATEGORY = [SHURINK, INMODE, ULTHERA, TITANIUM, JUVEDERM, EXCELV, PICOSURE, BOOSTER, FILLER, BOTOX, IV_THERAPY, OLIGIO, POTENZA, ERBIUM, ETC];
export const ROLE = {
  DOCTOR: "doctor",
  NURSE: "nurse",
  STAFF: "staff",
} as const;
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

export const KEY_OF_CLIENT_PRECORD = ["id"];
for (let i = 1; i < KEY_OF_SERVER_PRECORD.length; i++) {
  KEY_OF_CLIENT_PRECORD.push(snakeToCamel(KEY_OF_SERVER_PRECORD[i]));
}

export const KEY_OF_SERVER_TREATMENT = ["id", "group", "title", "duration", "point", "price"];
export const KEY_OF_CLIENT_TREATMENT = [...KEY_OF_SERVER_TREATMENT];
export const TREATMENTS: SearchHelp[] = [
  { id: "1", group: SHURINK, title: "슈링크 유니버스 울트라 MP모드 100샷" },
  { id: "2", group: SHURINK, title: "슈링크 유니버스 부스터 모드 100샷" },
  { id: "3", group: SHURINK, title: "아이 슈링크 100샷" },
  { id: "4", group: SHURINK, title: "더마 슈링크 100샷" },
  { id: "5", group: INMODE, title: "인모드 Fx 2:30" },
  { id: "6", group: INMODE, title: "인모드 wFx 5:30" },
  { id: "7", group: INMODE, title: "인모드 mFx 8:00" },
  { id: "8", group: INMODE, title: "인모드 Forma 1k" },
  { id: "9", group: ULTHERA, title: "울쎄라 100샷" },
  { id: "10", group: TITANIUM, title: "티타늄 SHR 10J" },
  { id: "11", group: TITANIUM, title: "티타늄 SHR + STACK 10j" },
  { id: "12", group: JUVEDERM, title: "쥬베룩 볼륨 1/2 vial (4cc)" },
  { id: "13", group: JUVEDERM, title: "쥬베룩 볼룸 1 vial (8cc)" },
  { id: "14", group: JUVEDERM, title: "울트라콜 1 vial" },
  { id: "15", group: EXCELV, title: "엑셀브이 색소모드" },
  { id: "16", group: EXCELV, title: "엑셀브이 홍조모드" },
  { id: "17", group: EXCELV, title: "엑셀브이 붉은 모드" },
  { id: "18", group: EXCELV, title: "엑셀브이 제네시스" },
  { id: "19", group: EXCELV, title: "엑셀브이 제네시스 + 골드PTT" },
  { id: "20", group: EXCELV, title: "엑셀브이 제네시스 + 기미PTT" },
  { id: "21", group: PICOSURE, title: "피코슈어 토닝" },
  { id: "22", group: PICOSURE, title: "피코슈어 줌 (10부위 이하)" },
  { id: "23", group: PICOSURE, title: "피코슈어 줌 (10부위 이상)" },
  { id: "24", group: PICOSURE, title: "피코슈어 포커스" },
  { id: "25", group: PICOSURE, title: "피코슈어 플래티넘 포커스" },
  { id: "26", group: BOOSTER, title: "연어주사 2cc" },
  { id: "27", group: BOOSTER, title: "뉴아티 물광주사 2.5cc" },
  { id: "28", group: BOOSTER, title: "릴리이드 물광주사 5cc" },
  { id: "29", group: BOOSTER, title: "필로가 3cc" },
  { id: "30", group: BOOSTER, title: "쥬베룩 스킨부스터 2cc" },
  { id: "31", group: BOOSTER, title: "리쥬란HB 1cc" },
  { id: "32", group: BOOSTER, title: "리쥬란아이 1cc" },
  { id: "33", group: BOOSTER, title: "리쥬란힐러 1cc" },
  { id: "34", group: BOOSTER, title: "엑소힐러 2.5cc" },
  { id: "35", group: BOOSTER, title: "ASCE 엑소좀 5cc" },
  { id: "36", group: BOOSTER, title: "더마샤인 인젝터" },
  { id: "37", group: BOOSTER, title: "나노소프트 인젝터" },
  { id: "38", group: FILLER, title: "턱 필러 (국산, 순수필)" },
  { id: "39", group: FILLER, title: "팔자 필러 (국산, 순수필)" },
  { id: "40", group: FILLER, title: "입술 필러 (국산, 순수필)" },
  { id: "41", group: FILLER, title: "턱 필러 (수입, 쥬비덤)" },
  { id: "42", group: FILLER, title: "팔자 필러 (수입, 쥬비덤)" },
  { id: "43", group: FILLER, title: "입술 필러 (수입, 쥬비덤)" },
  { id: "44", group: FILLER, title: "입술 필러 (수입, 레스틸렌)" },
  { id: "45", group: FILLER, title: "옆볼 필러 (수입, 쥬비덤)" },
  { id: "46", group: FILLER, title: "앞광대 필러 (수입, 쥬비덤)" },
  { id: "47", group: FILLER, title: "눈밑 필러 (수입, 쥬비덤)" },
  { id: "48", group: FILLER, title: "이마 필러 (수입, 쥬비덤)" },
  { id: "49", group: FILLER, title: "목주름 필러 (수입, 벨로테로)" },
  { id: "50", group: FILLER, title: "눈밑 필러 (수입, 레스틸렌)" },
  { id: "51", group: FILLER, title: "히알라제" },
  { id: "52", group: BOTOX, title: "주름 보톡스 1부위 (뉴럭스)" },
  { id: "53", group: BOTOX, title: "주름 보톡스 1부위 (코어톡스)" },
  { id: "54", group: BOTOX, title: "주름보톡스 1부위 (제오민)" },
  { id: "55", group: BOTOX, title: "콧볼 보톡스 (국산)" },
  { id: "56", group: BOTOX, title: "콧볼 보톡스 (수입)" },
  { id: "57", group: BOTOX, title: "입꼬리 보톡스 (국산)" },
  { id: "58", group: BOTOX, title: "입꼬리 보톡스 (수입)" },
  { id: "59", group: BOTOX, title: "턱 보톡스 (뉴럭스, 50 unit)" },
  { id: "60", group: BOTOX, title: "턱 보톡스 (코어톡스, 50 unit)" },
  { id: "61", group: BOTOX, title: "턱 보톡스 (제오민, 50 unit)" },
  { id: "62", group: BOTOX, title: "귀밑샘 보톡스" },
  { id: "63", group: BOTOX, title: "광대 보톡스" },
  { id: "64", group: BOTOX, title: "측두근 보톡스" },
  { id: "65", group: BOTOX, title: "승모근 보톡스 (뉴럭스, 100unit)" },
  { id: "66", group: BOTOX, title: "승모근 보톡스 (코어톡스, 100unit)" },
  { id: "67", group: BOTOX, title: "승모근 보톡스 (제오민, 100unit)" },
  { id: "68", group: BOTOX, title: "종아리 보톡스" },
  { id: "69", group: BOTOX, title: "다한증 보톡스" },
  { id: "70", group: BOTOX, title: "스킨 보톡스 얼전 (3cc)" },
  { id: "71", group: BOTOX, title: "스킨보톡스 나비존 (2cc)" },
  { id: "72", group: BOTOX, title: "스킨보톡스 턱라인 (2cc)" },
  { id: "73", group: BOTOX, title: "스킨보톡스 팔자 (2cc)" },
  { id: "74", group: BOTOX, title: "스킨보톡스 목주름 (4cc)" },
  { id: "75", group: BOTOX, title: "윗얼굴 보톡스 (이마, 미간, 콧잔등, 눈가, 눈밑)" },
  { id: "76", group: BOTOX, title: "아래 얼굴 (턱50, 자갈턱, 나비존 스보)" },
  { id: "77", group: BOTOX, title: "윗얼굴 + 아래 얼굴" },
  { id: "78", group: BOTOX, title: "가벼운 이마 (이마 + 스보)" },
  { id: "79", group: BOTOX, title: "자연스러운 눈가 (눈가 + 눈 스보)" },
  { id: "80", group: BOTOX, title: "날렵한 턱선 (턱50 + 귀밑50 + 턱라인 스보)" },
  { id: "81", group: BOTOX, title: "젠틀맨 (이마+미간+턱50)" },
  { id: "82", group: BOTOX, title: "주름케어 (이마+미간+눈+콧등+팔자+목주름)" },
  { id: "83", group: IV_THERAPY, title: "백옥주사" },
  { id: "84", group: IV_THERAPY, title: "신데렐라주사" },
  { id: "85", group: IV_THERAPY, title: "비타민D" },
  { id: "86", group: IV_THERAPY, title: "마늘주사" },
  { id: "87", group: IV_THERAPY, title: "아르기닌주사" },
  { id: "88", group: OLIGIO, title: "올리지오 100샷" },
  { id: "89", group: OLIGIO, title: "아이 올리지오 100샷" },
  { id: "90", group: POTENZA, title: "포텐자 AGN 1부위" },
  { id: "91", group: POTENZA, title: "포텐자 AGN 얼전" },
  { id: "92", group: POTENZA, title: "포텐자 ACN" },
  { id: "93", group: POTENZA, title: "포텐자 LPOR" },
  { id: "94", group: POTENZA, title: "포텐자 펌핑" },
  { id: "95", group: ERBIUM, title: "어븀 프락셀 1부위" },
  { id: "96", group: ERBIUM, title: "어븀 프락셀 나비존" },
  { id: "97", group: ERBIUM, title: "어븀 프락셀 풀페이스" },
  { id: "98", group: ERBIUM, title: "어븀 프락셀 (패키지)" },
  { id: "99", group: ERBIUM, title: "카프리" },
  { id: "100", group: ETC, title: "카프리 (패키지)" },
  { id: "101", group: ETC, title: "MTS (스킨부스터)" },
  { id: "102", group: ETC, title: "MTS (패키지)" },
  { id: "103", group: ETC, title: "압출" },
  { id: "104", group: ETC, title: "염증주사" },
  { id: "105", group: ETC, title: "블루토닝" },
  { id: "106", group: ETC, title: "블랙필" },
];

export type SearchHelp = {
  id: string;
  group: string;
  title: string;
};
