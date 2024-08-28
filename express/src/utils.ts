/** @format */

import { KEY_OF_SERVER_PRECORD } from "./contants.js";

export const convertTime = (time: number | undefined) => {
  return time ? new Date(time * 1000) : undefined;
};
export const deconstructRecord = (record: any) => {
  const {
    createdAt,
    chartNum,
    patientName,
    opReadiness,
    treatment1,
    treatment2,
    treatment3,
    treatment4,
    treatment5,
    quantityTreat1,
    quantityTreat2,
    quantityTreat3,
    quantityTreat4,
    quantityTreat5,
    treatmentRoom,
    doctor1,
    doctor2,
    doctor3,
    doctor4,
    doctor5,
    anesthesiaNote,
    skincareSpecialist1,
    skincareSpecialist2,
    nursingStaff1,
    nursingStaff2,
    coordinator,
    consultant,
    commentCaution,
    lockingUser,
    deleteYN,
    treatmentReady1,
    treatmentReady2,
    treatmentReady3,
    treatmentReady4,
    treatmentReady5,
    patientCareRoom,
    treatmentEnd1,
    treatmentEnd2,
    treatmentEnd3,
    treatmentEnd4,
    treatmentEnd5,
    treatmentStart1,
    treatmentStart2,
    treatmentStart3,
    treatmentStart4,
    treatmentStart5,
  } = record;

  const retVal = [
    convertTime(createdAt),
    chartNum,
    patientName,
    opReadiness,
    treatment1,
    treatment2,
    treatment3,
    treatment4,
    treatment5,
    quantityTreat1,
    quantityTreat2,
    quantityTreat3,
    quantityTreat4,
    quantityTreat5,
    treatmentRoom,
    doctor1,
    doctor2,
    doctor3,
    doctor4,
    doctor5,
    anesthesiaNote,
    skincareSpecialist1,
    skincareSpecialist2,
    nursingStaff1,
    nursingStaff2,
    coordinator,
    patientCareRoom,
    consultant,
    commentCaution,
    lockingUser,
    deleteYN,
    convertTime(treatmentReady1),
    convertTime(treatmentReady2),
    convertTime(treatmentReady3),
    convertTime(treatmentReady4),
    convertTime(treatmentReady5),
    convertTime(treatmentEnd1),
    convertTime(treatmentEnd2),
    convertTime(treatmentEnd3),
    convertTime(treatmentEnd4),
    convertTime(treatmentEnd5),
    convertTime(treatmentStart1),
    convertTime(treatmentStart2),
    convertTime(treatmentStart3),
    convertTime(treatmentStart4),
    convertTime(treatmentStart5),
  ];

  const { id } = record;

  if (id) {
    retVal.push(id);
  } else {
    retVal.shift();
  }

  return retVal;
};
export const updateRecordsQuery = (tableName: string) => {
  let baseQuery = `UPDATE ${tableName} SET `;
  for (let i = 1; i < KEY_OF_SERVER_PRECORD.length; i++) {
    const field = KEY_OF_SERVER_PRECORD[i];
    baseQuery += `${field}=$${i}`;
    if (i !== KEY_OF_SERVER_PRECORD.length - 1) {
      baseQuery += ", ";
    }
  }
  baseQuery += ` WHERE record_id=$${KEY_OF_SERVER_PRECORD.length}`;
  return baseQuery;
};
export const setUserSessionQuery = (tableName: string) => {
  return `UPDATE ${tableName} SET session_id=$1 WHERE contact_id=$2 RETURNING *;`;
};
export const lockOrUnlockRowsQuery = (tableName: string, length: number) => {
  return `UPDATE ${tableName} SET locking_user=$1
  WHERE record_id IN (${Array.from({ length }, (_, k) => `$${k + 2}`).join(", ")}) RETURNING *;`;
};
