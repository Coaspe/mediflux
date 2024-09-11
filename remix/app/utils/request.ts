/** @format */

import axios from "axios";
import { Role } from "shared";
import { CustomResponse } from "~/types/type";

export const getAllRoleEmployees = async (role: Role, tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.get(`${baseURL}/api/getAllRoleEmployees`, { params: { role, tag } });
    return { statusCode: result.status, body: { data: result.data } };
  } catch (error) {
    return handleError(error);
  }
};
export const getRecords = async (where: string[] = [], tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.post(`${baseURL}/api/getRecords`, { where, tag });
    return { statusCode: result.status, body: { data: result.data } };
  } catch (error) {
    return handleError(error);
  }
};
export const getAllTreatments = async (tag: string, baseURL: string | undefined): Promise<CustomResponse> => {
  try {
    const result = await axios.get(`${baseURL}/api/getAllTreatments`, { params: { tag } });
    return { statusCode: result.status, body: { data: result.data } };
  } catch (error) {
    return handleError(error);
  }
};

export const handleError = (axiosError: any): CustomResponse => {
  const error = axiosError.response;
  let statusCode = 500;
  let message = "An unexpected error occurred.";

  switch (error.status) {
    case 400:
      statusCode = 400;
      message = "Bad Request: " + (error.message || "Invalid request.");
      break;

    case 401:
      statusCode = 401;
      message = "Unauthorized: " + (error.message || "Authentication required.");
      break;

    case 403:
      statusCode = 403;
      message = "Forbidden: " + (error.message || "You do not have permission to access this resource.");
      break;

    case 404:
      statusCode = 404;
      message = "Not Found: " + (error.message || "Resource not found.");
      break;

    case 409:
      statusCode = 409;
      message = "Conflict: " + (error.message || "Conflict with current state.");
      break;

    case 422:
      statusCode = 422;
      message = "Unprocessable Entity: " + (error.message || "Unprocessable entity.");
      break;

    case 503:
      statusCode = 503;
      message = "Service Unavailable: " + (error.message || "Service temporarily unavailable.");
      break;

    default:
      statusCode = 500;
      message = "Internal Server Error: " + (error.message || "An unknown error occurred.");
      break;
  }

  return {
    statusCode,
    body: {
      error: message,
    },
  };
};
