import type { ActionFunction, ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { LoginButton, LoginModal } from "~/components/Landing";
import { useState } from "react";
import { badRequest } from "~/utils/request.server";
import { createUserSession, login, register } from "~/services/session.server";
import { ROLE } from "~/constant";

function validateUsername(username: string) {
  if (username.length < 3) {
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
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  console.log("Loader");
  return null;
};
export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const requestType = form.get("requestType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl((form.get("redirectTo") as string) || "/");

  if (typeof password !== "string" || typeof username !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  let fields: { [key: string]: string } = { password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (requestType) {
    case "login": {
      let user = await login({ username, password });

      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `Username/Password combination is incorrect`,
        });
      }
      fields["role"] = ROLE.DOCTOR;
      fields["username"] = "Doccoco";
      fields["id"] = "123124";
      return await createUserSession(user, redirectTo);
    }

    case "register": {
      let email = form.get("useremail");
      if (!email || typeof email !== "string") {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `Username/Password combination is incorrect`,
        });
      }

      fields["email"] = email;
      let user = await register({ username, email, password });

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
