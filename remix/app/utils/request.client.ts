/** @format */

import axios from "axios";
import { PRecord } from "~/type";

export const insertRecords = async (records: PRecord[]) => {
  try {
    const result = await axios.post("http://localhost:5000/api/insertRecords", { records });
    switch (result.status) {
      case 200:
        return result.data;
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
};

export const hideRecords = async (ids: string[]) => {
  return await axios.put("http://localhost:5000/api/hideRecords", { ids });
};

export const getAllRecords = async () => {
  return await axios.get("http://localhost:5000/api/getAllRecords");
};

export const updateRecord = async (record: PRecord) => {
  return await axios.put("http://localhost:5000/api/updateRecord", { record });
};

export const lockRecord = async (recordId: string, lockingUser: string) => {
  return await axios.put("http://localhost:5000/api/lockRecord", { recordId, lockingUser });
};

export const unlockRecord = async (recordId: string) => {
  return await axios.put("http://localhost:5000/api/unlockRecord", { recordId });
};

export const getSchedulingRecords = async (where: string = "") => {
  console.log(where);

  return await axios.post("http://localhost:5000/api/getRecords", { where });
};

export const lockOrUnlockRecords = async (recordIds: string[], lockingUser: string | null) => {
  return await axios.put("http://localhost:5000/api/lockOrUnlockRecords", { recordIds, lockingUser });
};

export const isLocked = async (recordId: string) => {
  return await axios.get("https://localhost:5000/api/isLocked", { params: { recordId } });
};
