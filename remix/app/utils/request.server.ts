/** @format */

import { json } from "@remix-run/node";
import axios from "axios";
import { convertServerUserToClientUser } from "./utils";
import { User } from "~/type";
/**
 * This helper function helps us to return the accurate HTTP status,
 * 400 Bad Request, to the client.
 */
export const badRequest = <T>(data: T) => json<T>(data, { status: 400 });
export const getUserByID = async (id: string) => {
  try {
    const result = await axios.get(`http://localhost:5000/api/getUserByID`, { params: { id } });
    if (result.data && result.data.user) {
      const user = result.data.user;
      const clientUser = convertServerUserToClientUser(user);
      return { statusCode: result.status, user: clientUser };
    }
    return { statusCode: result.status, body: { error: "User not found" } };
  } catch (error) {
    return handleError(error);
  }
};
export const checkSameIdExists = async (userId: string) => {
  return await axios.get(`http://localhost:5000/api/checkSameIDExists`, { params: { userId } });
};

export const getSchedulingRecords = async (where: string[] = []) => {
  return await axios.post("http://localhost:5000/api/getRecords", { where });
};

export const setUserSession = async (user: User) => {
  try {
    const result = await axios.put(`http://localhost:5000/api/setUserSession`, { sessionId: user.sessionId, id: user.id });

    if (result.data && result.data.rows.length > 0) {
      const resultUser = result.data.rows[0];
      const clientUser = convertServerUserToClientUser(resultUser);

      return { statusCode: result.status, user: clientUser };
    } else {
      throw { statusCode: result.status, body: { error: "User data is missing from response" } };
    }
  } catch (error) {
    return handleError(error);
  }
};
const handleError = (error: any) => {
  let statusCode = 500;
  let message = "An unexpected error occurred.";

  if (error.isBadRequest) {
    statusCode = 400;
    message = "Bad Request: " + (error.message || "Invalid request.");
  } else if (error.isUnauthorized) {
    statusCode = 401;
    message = "Unauthorized: " + (error.message || "Authentication required.");
  } else if (error.isForbidden) {
    statusCode = 403;
    message = "Forbidden: " + (error.message || "You do not have permission to access this resource.");
  } else if (error.isNotFound) {
    statusCode = 404;
    message = "Not Found: " + (error.message || "Resource not found.");
  } else if (error.isConflict) {
    statusCode = 409;
    message = "Conflict: " + (error.message || "Conflict with current state.");
  } else if (error.isUnprocessableEntity) {
    statusCode = 422;
    message = "Unprocessable Entity: " + (error.message || "Unprocessable entity.");
  } else if (error.isServiceUnavailable) {
    statusCode = 503;
    message = "Service Unavailable: " + (error.message || "Service temporarily unavailable.");
  }

  return {
    statusCode,
    body: {
      error: message,
    },
  };
};
