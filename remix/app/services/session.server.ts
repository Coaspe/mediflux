import { createCookieSessionStorage, json, redirect } from "@remix-run/node";
import { ROLE } from "~/constant";
import axios from "axios";
import { User } from "~/type";

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
  try {
    const response = await axios.post("http://localhost:5000/api/login", { userId: username, password }, { withCredentials: true });
    console.log(response);
    if (response.status === 200) {
      return json({ user: response.data, status: response.status, message: undefined });
    }
    return json({ status: response.status, message: response.data, user: undefined });
  } catch (error) {
    return redirect("/login");
  }
}

// const sessionSecret = process.env.SESSION_SECRET;
const sessionSecret = "remxe12i2mfdmx";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

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
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(user: User, redirectTo: string) {
  const session = await storage.getSession();
  session.set("username", user.name);
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
