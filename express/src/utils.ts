/** @format */

import { KEY_OF_CLIENT_PRECORD, KEY_OF_CLIENT_TREATMENT, PRecord } from "shared";

export const deconstructRecord = (record: PRecord) => {
  const newRecord = {} as any;
  for (const s of KEY_OF_CLIENT_PRECORD) {
    newRecord[s] = record[s];
  }

  const values = Object.values(newRecord);

  if (values.length > 0) {
    const id = values.shift();
    if (newRecord.id) {
      values.push(id);
    }
    if (!newRecord.createdAt) {
      values.shift();
    }
  }
  return values;
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
  baseQuery += ` WHERE ${idfieldName}=$${keys.length} RETURNING *`;
  return baseQuery;
};

export const setUserSessionQuery = (tableName: string) => {
  return `UPDATE ${tableName} SET session_id=$1 WHERE id=$2 RETURNING *;`;
};
export const lockOrUnlockRowsQuery = (tableName: string, length: number) => {
  return `UPDATE ${tableName} SET locking_user=$1
  WHERE id IN (${Array.from({ length }, (_, k) => `$${k + 2}`).join(", ")}) RETURNING *;`;
};
export const deconstructTreatement = (treatment: any) => {
  const newTreatment: any = {};
  for (const s of KEY_OF_CLIENT_TREATMENT) {
    newTreatment[s] = treatment[s];
  }

  const values = Object.values(newTreatment);
  if (values && values.length > 0) {
    if (treatment.id) {
      values.push(values.shift());
    }
  }
  return values;
};
