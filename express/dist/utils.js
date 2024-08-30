/** @format */
import { KEY_OF_CLIENT_PRECORD, KEY_OF_CLIENT_TREATMENT } from "./contants.js";
export const deconstructRecord = (record) => {
    const newRecord = {};
    for (const s of KEY_OF_CLIENT_PRECORD) {
        newRecord[s] = record[s];
    }
    const values = Object.values(newRecord);
    if (values.length > 0) {
        const idOrCreatedAt = values.shift();
        if (record.id) {
            values.push(idOrCreatedAt);
        }
        else {
            values.shift();
        }
    }
    return values;
};
export const updateQuery = (tableName, keys, idfieldName) => {
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
export const setUserSessionQuery = (tableName) => {
    return `UPDATE ${tableName} SET session_id=$1 WHERE contact_id=$2 RETURNING *;`;
};
export const lockOrUnlockRowsQuery = (tableName, length) => {
    return `UPDATE ${tableName} SET locking_user=$1
  WHERE record_id IN (${Array.from({ length }, (_, k) => `$${k + 2}`).join(", ")}) RETURNING *;`;
};
export const deconstructTreatement = (treatment) => {
    const newTreatment = {};
    for (const s of KEY_OF_CLIENT_TREATMENT) {
        newTreatment[s] = treatment[s];
    }
    console.log(newTreatment);
    const values = Object.values(newTreatment);
    if (values && values.length > 0) {
        if (treatment.id) {
            values.push(values.shift());
        }
    }
    return values;
};
