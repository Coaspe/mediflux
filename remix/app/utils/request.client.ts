/** @format */

import axios from "axios";
import { Role } from "shared";
import { PRecord, Treatment } from "~/type";

export const insertRecords = async (records: PRecord[], tag: string) => {
  try {
    const result = await axios.post("http://localhost:5000/api/insertRecords", { records, tag });
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

export const hideRecords = async (ids: string[], tag: string) => {
  return await axios.put("http://localhost:5000/api/hideRecords", { ids, tag });
};

export const updateRecord = async (record: PRecord, tag: string) => {
  return await axios.put("http://localhost:5000/api/updateRecord", { record, tag });
};

export const getRecords = async (where: string[] = [], tag: string) => {
  return await axios.post("http://localhost:5000/api/getRecords", { where, tag });
};

export const lockOrUnlockRecords = async (recordIds: string[], lockingUser: string | null, tag: string) => {
  return await axios.put("http://localhost:5000/api/lockOrUnlockRecords", { recordIds, lockingUser, tag });
};

export const getAllRoleEmployees = async (role: Role, tag: string) => {
  return await axios.get(`http://localhost:5000/api/getAllRoleEmployees`, { params: { role, tag } });
};

export const getAllTreatments = async (tag: string) => {
  return await axios.get(`http://localhost:5000/api/getAllTreatments`, { params: { tag } });
};

export const getAllVacantRooms = async (tag: string) => {
  return await axios.get(`http://localhost:5000/api/getAllVacantRooms`, { params: { tag } });
};

export const updateTreatment = async (treatment: Treatment, tag: string) => {
  return await axios.put(`http://localhost:5000/api/updateTreatment`, { treatment, tag });
};

export const deleteTreatement = async (id: string, tag: string) => {
  return await axios.delete(`http://localhost:5000/api/deleteTreatment`, { params: { id, tag } });
};

export const insertTreatment = async (tag: string) => {
  return await axios.post(`http://localhost:5000/api/insertTreatment`, { tag });
};
