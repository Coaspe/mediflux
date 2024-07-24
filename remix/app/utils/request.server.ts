/** @format */

import { json } from "@remix-run/node";
import axios from "axios";
import { User } from "~/type";

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
      const clientUser = { id: user.contact_id, userid: user.login_id, role: user.user_role, name: user.first_name + user.last_name } as User;
      return clientUser;
    }
  } catch (error) {
    return null;
  }
  return null;
};
