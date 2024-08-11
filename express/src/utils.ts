/** @format */

import pkg from "pg";
import { KEYOFSERVERPRECORD } from "./contants.js";

export const getUserByLoginID = async (pool: pkg.Pool, loginId: string) => {
  return await pool.query("select * from admin.user where login_id=$1;", [loginId]);
};

export const getSchema = async (pool: pkg.Pool) => {
  return await pool.query("select * FROM information_schema.tables where table_schema ilike '%SS%' or table_schema ilike '%share%' or table_schema like '%admin%' order by table_schema");
};

export const getChart = async (pool: pkg.Pool) => {
  return await pool.query("select * from gn_ss_bailor.chart_schedule");
};

export const deleteAllChart = async (pool: pkg.Pool) => {
  return await pool.query("delete from gn_ss_bailor.chart_schedule");
};
export const convertTime = (time: number | undefined) => {
  return time ? new Date(time * 1000) : undefined;
};
export const deconstructRecord = (record: any) => {
  const {
    checkInTime,
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
    doctor,
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
    convertTime(checkInTime),
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
    doctor,
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
    // convertTime(treatmentStart1),
    // convertTime(treatmentStart2),
    // convertTime(treatmentStart3),
    // convertTime(treatmentStart4),
    // convertTime(treatmentStart5),
  ];

  const { id } = record;

  if (id) {
    retVal.push(id);
  } else {
    retVal.shift();
  }

  return retVal;
};

export const updateQuery = (tableName: string) => {
  let baseQuery = `UPDATE ${tableName} SET `;
  for (let i = 1; i < KEYOFSERVERPRECORD.length; i++) {
    const field = KEYOFSERVERPRECORD[i];
    baseQuery += `${field}=$${i}`;
    if (i !== KEYOFSERVERPRECORD.length - 1) {
      baseQuery += ", ";
    }
  }
  baseQuery += ` WHERE record_id=$${KEYOFSERVERPRECORD.length}`;
  return baseQuery;
};

export const lockOrUnlockRowsQuery = (tableName: string, length: number) => {
  return `UPDATE ${tableName} SET locking_user=$1
  WHERE record_id IN (${Array.from({ length }, (_, k) => `$${k + 2}`).join(", ")}) RETURNING *;`;
};
