/** @format */

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { LoginForm, RegisgerForm, User } from "~/type";
import axios from "axios";
import { getUserByID, setUserSession } from "~/utils/request.server";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { encryptSessionId } from "~/utils/utils";
import { TEST_TAG } from "~/constant";

// const sessionSecret = process.env.SESSION_SECRET;
const sessionSecret = "remxe12i2mfdmx";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
const SESSION_AGE = 60 * 60 * 24 * 30;
const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE,
    httpOnly: true,
  },
});

export async function login({ userId, password }: LoginForm) {
  try {
    const response = await axios.post("http://localhost:5000/api/login", { userId, password }, { withCredentials: true });
    if (response.status === 200) {
      console.log(response.data.user);

      return { status: response.status, user: response.data.user };
    }
  } catch (error: any) {
    return { status: error.response.status, message: error.response.data.message, errorType: error.response.data.errorType };
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
  return redirect("/");
}

export async function register({ userId, password, role, firstName, lastName }: RegisgerForm) {
  try {
    let result = await axios.post("http://localhost:5000/api/register", { userId, password, role, firstName, lastName, clinic: TEST_TAG });
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

  const sessionId = encryptSessionId(ip, browser, sessionSecret, userId);

  if (userId === process.env.ADMIN) {
    return { status: "active", id: userId, sessionId };
  }

  if (!userId) {
    return { status: "no-session" };
  }

  if (Date.now() > expires) {
    return { status: "session-expired" };
  }

  const result = await getUserByID(userId);

  if ("user" in result) {
    if (result.user?.sessionId !== sessionId) {
      return { status: "invalid-session", id: userId };
    }
  } else {
    return { status: "user-dose-not-exist" };
  }

  return { status: "active", id: userId, sessionId: sessionId };
}

export async function destroyUserSession(request: Request, userId: string) {
  try {
    const result = await setUserSession({ id: userId, sessionId: null } as User);
    if (result.statusCode == 200) {
      return destoryBrowserSession("/", request);
    }
  } catch (error) {
    return redirect("/");
  }
  return redirect("/");
}
