/** @format */

import axios from "axios";
import { CustomResponse, PRecord, Treatment } from "~/types/type";
import { handleError } from "./request";

export const insertRecords = async (records: PRecord[], tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.post(`${baseURL}/api/insertRecords`, { records, tag });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const hideRecords = async (ids: string[], tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.put(`${baseURL}/api/hideRecords`, { ids, tag });
    return { statusCode: result.status } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const updateRecord = async (record: PRecord, tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.put(`${baseURL}/api/updateRecord`, { record, tag });
    return { statusCode: result.status } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const lockOrUnlockRecords = async (recordIds: string[], lockingUser: string | null, tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.put(`${baseURL}/api/lockOrUnlockRecords`, { recordIds, lockingUser, tag });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const updateTreatment = async (treatment: Treatment, tag: string, baseURL: string | undefined) => {
  try {
    const result = await axios.put(`${baseURL}/api/updateTreatment`, { treatment, tag });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteTreatement = async (id: string, tag: string, baseURL: string | undefined) => {
  try {
    const result = await axios.delete(`${baseURL}/api/deleteTreatment`, { params: { id, tag } });
    return { statusCode: result.status } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};

export const insertTreatment = async (tag: string, baseURL: string | undefined) => {
  try {
    const result = await axios.post(`${baseURL}/api/insertTreatment`, { tag });
    return { statusCode: result.status } as CustomResponse;
  } catch (error: any) {
    return handleError(error);
  }
};

export const getAllVacantRooms = async (tag: string, baseURL: string | undefined) => {
  try {
    const result = await axios.get(`${baseURL}/api/getAllVacantRooms`, { params: { tag } });
    return { statusCode: result.status, body: { data: result.data } } as CustomResponse;
  } catch (error) {
    return handleError(error);
  }
};
