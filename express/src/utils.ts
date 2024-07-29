/** @format */

import pkg from "pg";

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
  } = record;
  const retVal = [
    new Date(checkInTime),
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
  ];
  const { id } = record;

  if (id) {
    retVal.unshift(id);
  } else {
    retVal.shift();
  }
  return retVal;
};
