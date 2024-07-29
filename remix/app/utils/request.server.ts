/** @format */

import { json } from "@remix-run/node";
import axios from "axios";
import { convertServerUserToClientUser } from "./utils";

/**
 * This helper function helps us to return the accurate HTTP status,
 * 400 Bad Request, to the client.
 */
export const badRequest = <T>(data: T) => json<T>(data, { status: 400 });
export const getUserByID = async (id: string) => {
  try {
    const result = await axios.get(`http://localhost:5000/api/getUserByID`, { params: { id } });
    if (result.status === 200) {
      const user = result.data.user;
      const clientUser = convertServerUserToClientUser(user);
      return clientUser;
    }
  } catch (error) {
    return null;
  }
  return null;
};
