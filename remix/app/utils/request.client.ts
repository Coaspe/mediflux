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
