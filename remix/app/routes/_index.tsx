/** @format */

import type { ActionFunction, ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { LoginButton, LoginModal } from "~/components/Landing";
import { useEffect, useState } from "react";
import { badRequest } from "~/utils/request.server";
import { createUserSession, login, register } from "~/services/session.server";
import { ROLE } from "~/constant";
import { LoginResponse, User } from "~/type";
import { ServerUser } from "shared";

function validateUserid(userid: string) {
  if (userid.length < 3) {
    return "Usernames must be at least 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

function validateUrl(url: string) {
  // const urls = ["/jokes", "/", "https://remix.run"];
  // if (urls.includes(url)) {
  //   return url;
  // }
  return url;
}

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const requestType = form.get("requestType");
  const password = form.get("password");
  const userId = form.get("userId");
  const redirectTo = validateUrl((form.get("redirectTo") as string) || "/");

  if (typeof password !== "string" || typeof userId !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  let fields: { [key: string]: string } = { password, userId };

  switch (requestType) {
    case "login": {
      let result = (await login({ userId, password })) as LoginResponse;
      console.log(result.status);

      if (result.status !== 200) {
        const fieldErrors = {
          userId: result.errorType === 1 ? result.message : undefined,
          password: result.errorType === 2 ? result.message : undefined,
        };

        return badRequest({
          fieldErrors,
          fields,
          formError: result.message,
        });
      }

      const user = result.user as ServerUser;
      fields["role"] = ROLE.DOCTOR;
      fields["name"] = user.first_name + user.last_name;
      fields["id"] = user.contact_id;
      const clientUser = { id: user.contact_id, userid: user.login_id, role: ROLE.DOCTOR } as User;

      return await createUserSession(clientUser, redirectTo);
    }

    case "register": {
      const firstName = form.get("firstName");
      const lastName = form.get("lastName");
      const role = form.get("role");

      const fieldErrors = {
        password: validatePassword(password),
        userId: validateUserid(userId),
      };

      if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
          fieldErrors,
          fields,
          formError: null,
        });
      }

      let email = form.get("useremail");
      if (!email || typeof email !== "string") {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `User ID/Password combination is incorrect`,
        });
      }

      fields["email"] = email;
      let user = await register({ userId, email, password });

      if (!user) {
        badRequest({
          fieldErrors: null,
          fields,
          formError: `Already exists user`,
        });
      }

      return user;
    }

    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Login type invalid",
      });
    }
  }
};

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setIsModalOpenNot = () => setIsModalOpen((origin) => !origin);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="flex justify-center ">
        <div className="rounded-lg shadow-lg p-8 font-noto">
          <h2 className="text-9xl font-bold font-playfair mb-10">Efficient care,</h2>
          <h2 className="text-9xl font-bold font-playfair mb-10">Every time</h2>
          <LoginButton onClose={setIsModalOpenNot} name="Get started" />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </div>
  );
}
