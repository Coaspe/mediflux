/** @format */
export const deconstructRecord = (record) => {
    const values = Object.values(record);
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
    const { id, duration, price, point, group, title } = treatment;
    return [duration, point, title, group, price, id];
};
