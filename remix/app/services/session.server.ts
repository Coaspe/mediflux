/** @format */

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { LoginForm, RegisgerForm, User } from "~/types/type";
import axios from "axios";
import { getUserByID, setUserSession } from "~/utils/request.server";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { encryptSessionId } from "~/utils/utils";
import { DEFAULT_REDIRECT, TEST_TAG } from "~/constant";

const sessionSecret = process.env.SESSION_SECRET || "";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
const SESSION_AGE = 60 * 60 * 24 * 30;
const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: false,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: DEFAULT_REDIRECT,
    maxAge: SESSION_AGE,
    httpOnly: true,
  },
});

export async function login({ userId, password }: LoginForm) {
  try {
    const response = await axios.post(`${process.env.SERVER_BASE_URL}/api/login`, { userId, password }, { withCredentials: true });
    if (response.status === 200) {
      return { status: response.status, user: response.data.user };
    }
  } catch (error: any) {
    const res = error.response;
    if (res) {
      return { status: res.status, message: res.data.message, errorType: res.data.errorType };
    }
    return { status: 500, message: "Internal server error" };
  }
}

export async function createUserSession(user: User, redirectTo: string, request: Request) {
  const ip = getClientIPAddress(request.headers);
  const session = await storage.getSession();
  const browser = request.headers.get("User-Agent");
  const sessionId = encryptSessionId(ip, browser, sessionSecret, user.id);

  session.set("id", user.id);
  session.set("expires", Date.now() + SESSION_AGE);
  session.set("ip", ip);
  session.set("browser", browser);

  user.sessionId = sessionId;
  const setUserSessionResult = await setUserSession(user);

  if (setUserSessionResult.statusCode === 200) {
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }
  return redirect("/dashboard/scheduling");
}

export async function register({ userId, password, role, firstName, lastName }: RegisgerForm) {
  try {
    let result = await axios.post(`${process.env.SERVER_BASE_URL}/api/register`, { userId, password, role, firstName, lastName, clinic: TEST_TAG });
    return result;
  } catch (error: any) {
    return error;
  }
}

export async function destoryBrowserSession(redirectTo: string, request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  if (session) {
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.destroySession(session),
      },
    });
  }
  return redirect(redirectTo);
}

export async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));

  const userId = session.get("id");
  const expires = session.get("expires");
  const ip = getClientIPAddress(request.headers);
  const browser = request.headers.get("User-Agent");

  if (!userId) {
    return { status: "no-session" };
  }

  if (Date.now() > expires) {
    return { status: "session-expired" };
  }

  const sessionId = encryptSessionId(ip, browser, sessionSecret, userId);

  if (userId === process.env.ADMIN || userId === process.env.ADMIN2) {
    return { status: "active", id: userId, sessionId };
  }

  const { statusCode, body: { data = {}, error = null } = {} } = await getUserByID(userId);

  if (statusCode === 200) {
    if (data.sessionId !== sessionId) {
      return { status: "invalid-session", id: userId };
    }
  } else {
    return { status: "user-dose-not-exist" };
  }

  return { status: "active", id: userId, sessionId: sessionId };
}

export async function destoryDBSession(userId: string) {
  return await setUserSession({ id: userId, sessionId: null } as User);
}

export async function destroyUserSession(request: Request, userId: string) {
  try {
    const result = await destoryDBSession(userId);
    if (result.statusCode == 200) {
      return destoryBrowserSession(DEFAULT_REDIRECT, request);
    }
  } catch (error) {
    return redirect(DEFAULT_REDIRECT);
  }
  return redirect(DEFAULT_REDIRECT);
}
