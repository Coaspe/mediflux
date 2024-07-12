import { createCookieSessionStorage, json, redirect } from "@remix-run/node";
import { ROLE } from "~/constant";
// import bcrypt from "bcryptjs";
// import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};
type RegisgerForm = {
  email: string;
  username: string;
  password: string;
};
export async function login({ username, password }: LoginForm) {
  // const user = await db.user.findUnique({
  //   where: { username },
  // });
  // if (!user) {
  //   return null;
  // }
  // const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  // if (!isCorrectPassword) {
  //   return null;
  // }

  return { id: password, username: username, role: ROLE.DOCTOR };
}

// const sessionSecret = process.env.SESSION_SECRET;
const sessionSecret = "xx";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(
  user: {
    id: string;
    username: string;
    role: "doctor";
  },
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("username", user.username);
  session.set("id", user.id);
  session.set("role", user.role);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function register({ email, username, password }: RegisgerForm) {
  // Check userEmail exists and assign new id to user email.
  // if same email exists, return empty object
  let id = email;
  return { id, username, role: ROLE.DOCTOR };
}
