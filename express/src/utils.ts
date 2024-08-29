/** @format */

export const convertTime = (time: number | undefined) => {
  return time ? new Date(time * 1000) : undefined;
};

export const deconstructRecord = (record: any) => {
  console.log(convertTime(record.createdAt));

  const retVal = [
    convertTime(record.createdAt),
    record.chartNum,
    record.patientName,
    record.opReadiness,
    record.treatment1,
    record.treatment2,
    record.treatment3,
    record.treatment4,
    record.treatment5,
    record.quantityTreat1,
    record.quantityTreat2,
    record.quantityTreat3,
    record.quantityTreat4,
    record.quantityTreat5,
    record.treatmentRoom,
    record.doctor1,
    record.doctor2,
    record.doctor3,
    record.doctor4,
    record.doctor5,
    record.anesthesiaNote,
    record.skincareSpecialist1,
    record.skincareSpecialist2,
    record.nursingStaff1,
    record.nursingStaff2,
    record.coordinator,
    record.patientCareRoom,
    record.consultant,
    record.commentCaution,
    record.lockingUser,
    record.deleteYN,
    convertTime(record.treatmentReady1),
    convertTime(record.treatmentReady2),
    convertTime(record.treatmentReady3),
    convertTime(record.treatmentReady4),
    convertTime(record.treatmentReady5),
    convertTime(record.treatmentEnd1),
    convertTime(record.treatmentEnd2),
    convertTime(record.treatmentEnd3),
    convertTime(record.treatmentEnd4),
    convertTime(record.treatmentEnd5),
    convertTime(record.treatmentStart1),
    convertTime(record.treatmentStart2),
    convertTime(record.treatmentStart3),
    convertTime(record.treatmentStart4),
    convertTime(record.treatmentStart5),
  ];

  const { id } = record;

  if (id) {
    retVal.push(id);
  } else {
    retVal.shift();
  }

  return retVal;
};
export const updateQuery = (tableName: string, keys: string[], idfieldName: string) => {
  let baseQuery = `UPDATE ${tableName} SET `;
  for (let i = 1; i < keys.length; i++) {
    const field = keys[i];
    baseQuery += `${field}=$${i}`;
    if (i !== keys.length - 1) {
      baseQuery += ", ";
    }
  }
  baseQuery += ` WHERE ${idfieldName}=$${keys.length}`;
  return baseQuery;
};

export const setUserSessionQuery = (tableName: string) => {
  return `UPDATE ${tableName} SET session_id=$1 WHERE contact_id=$2 RETURNING *;`;
};
export const lockOrUnlockRowsQuery = (tableName: string, length: number) => {
  return `UPDATE ${tableName} SET locking_user=$1
  WHERE record_id IN (${Array.from({ length }, (_, k) => `$${k + 2}`).join(", ")}) RETURNING *;`;
};

export const deconstructTreatement = (treatment: any) => {
  const { id, duration, price, point, group, title } = treatment;
  return [duration, point, title, group, price, id];
};
