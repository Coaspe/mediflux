import axios from "axios";
import { Role } from "shared";

export const getAllRoleEmployees = async (role: Role, tag: string) => {
  return await axios.get(`http://localhost:5000/api/getAllRoleEmployees`, { params: { role, tag } });
};
export const getRecords = async (where: string[] = [], tag: string) => {
  return await axios.post("http://localhost:5000/api/getRecords", { where, tag });
};
export const getAllTreatments = async (tag: string) => {
  return await axios.get(`http://localhost:5000/api/getAllTreatments`, { params: { tag } });
};
