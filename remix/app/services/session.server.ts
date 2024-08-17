/** @format */

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { LoginForm, RegisgerForm, User } from "~/type";
import axios from "axios";

export async function login({ userId, password }: LoginForm) {
  try {
    const response = await axios.post("http://localhost:5000/api/login", { userId, password }, { withCredentials: true });
    if (response.status === 200) {
      return { status: response.status, user: response.data.user };
    }
  } catch (error: any) {
    return { status: error.response.status, message: error.response.data.message, errorType: error.response.data.errorType };
  }
}

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

export async function createUserSession(user: User, redirectTo: string) {
  const session = await storage.getSession();

  session.set("id", user.id);
  session.set("expires", Date.now() + SESSION_AGE);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function register({ userId, password, role, firstName, lastName }: RegisgerForm) {
  try {
    let result = await axios.post("http://localhost:5000/api/register", { userId, password, role, firstName, lastName });
    return result;
  } catch (error: any) {
    return error;
  }
}

export async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const userId = session.get("id");
  const expires = session.get("expires");

  if (!userId) {
    return { status: "no-session" };
  }
  if (Date.now() > expires) {
    return { status: "session-expired" };
  }

  return { status: "active", id: userId };
}

export async function destroyUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  if (session) {
    return redirect("/", {
      headers: {
        "Set-Cookie": await storage.destroySession(session),
      },
    });
  }
  return null;
}
