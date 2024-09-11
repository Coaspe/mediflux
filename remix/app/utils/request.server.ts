/** @format */

import { json } from "@remix-run/node";
import axios from "axios";
import { convertServerUserToClientUser } from "./utils";
import { CustomResponse, User } from "~/types/type";
import { handleError } from "./request";

/**
 * This helper function helps us to return the accurate HTTP status,
 * 400 Bad Request, to the client.
 */
export const badRequest = <T>(data: T) => json<T>(data, { status: 400 });
export const getUserByID = async (id: string): Promise<CustomResponse> => {
  try {
    const result = await axios.get(`${process.env.SERVER_BASE_URL}/api/getUserByID`, { params: { id } });
    const user = result.data.rows[0];
    if (user) {
      const clientUser = convertServerUserToClientUser(user);
      return { statusCode: result.status, body: { data: clientUser } };
    } else {
      return { statusCode: result.status, body: { error: "User not found" } };
    }
  } catch (error) {
    return handleError(error);
  }
};
export const checkSameIdExists = async (userId: string) => {
  return await axios.get(`${process.env.SERVER_BASE_URL}/api/checkSameIDExists`, { params: { userId } });
};

export const setUserSession = async (user: User) => {
  try {
    const result = await axios.put(`${process.env.SERVER_BASE_URL}/api/setUserSession`, { sessionId: user.sessionId, id: user.id });
    const resultUser = result.data.rows[0];
    const clientUser = convertServerUserToClientUser(resultUser);
    return { statusCode: result.status, data: clientUser };
  } catch (error) {
    return handleError(error);
  }
};
