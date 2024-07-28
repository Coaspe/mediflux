import axios from "axios"
import { PRecord } from "~/type"

export const insertRecord = async (record: PRecord) => {
    try {
      const result = await axios.post("http://localhost:5000/api/insertRecord", record)
      console.log(result);
      switch (result.status) {
        case 200:
          return result.data
        default:
          return false
      }
    } catch (error) {
      return false
    }
  }