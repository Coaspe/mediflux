/** @format */

import axios from "axios";
import { CustomResponse, PRecord, Treatment } from "~/type";
import { handleError } from "./request";

export const insertRecords = async (records: PRecord[], tag: string): Promise<CustomResponse> => {
  try {
    const result = await axios.post("http://localhost:5000/api/insertRecords", { records, tag });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const hideRecords = async (ids: string[], tag: string): Promise<CustomResponse> => {
  try {
    const result = await axios.put("http://localhost:5000/api/hideRecords", { ids, tag });
    return { statusCode: result.status } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const updateRecord = async (record: PRecord, tag: string): Promise<CustomResponse> => {
  try {
    const result = await axios.put("http://localhost:5000/api/updateRecord", { record, tag });
    return { statusCode: result.status } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const lockOrUnlockRecords = async (recordIds: string[], lockingUser: string | null, tag: string): Promise<CustomResponse> => {
  try {
    const result = await axios.put("http://localhost:5000/api/lockOrUnlockRecords", { recordIds, lockingUser, tag });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const updateTreatment = async (treatment: Treatment, tag: string) => {
  try {
    const result = await axios.put(`http://localhost:5000/api/updateTreatment`, { treatment, tag });
    console.log(result);
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteTreatement = async (id: string, tag: string) => {
  try {
    const result = await axios.delete(`http://localhost:5000/api/deleteTreatment`, { params: { id, tag } });
    return { statusCode: result.status } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const insertTreatment = async (tag: string) => {
  try {
    const result = await axios.post(`http://localhost:5000/api/insertTreatment`, { tag });
    return { statusCode: result.status } as CustomResponse;
  } catch (error: any) {
    return handleError(error);
  }
};

export const getAllVacantRooms = async (tag: string) => {
  try {
    const result = await axios.get(`http://localhost:5000/api/getAllVacantRooms`, { params: { tag } });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};
