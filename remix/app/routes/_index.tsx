import type { ActionFunctionArgs } from "@remix-run/node";
import { AlertP, LoginButton, LoginInput, LoginModal } from "~/components/Landing";
import { useState } from "react";
import { Form, redirect, useActionData } from "@remix-run/react";
import { badRequest } from "~/utils/request.server";
import Icon, { ICONS } from "~/components/Icons";
import { useRecoilState } from "recoil";
import { userState } from "~/recoil_state";

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

export const action = async ({ request }: ActionFunctionArgs) => {
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

  const fields = { password, username };
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
      return redirect(redirectTo);
    }
    case "register": {
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
  const actionData = useActionData<typeof action>();

  const [user, setUser] = useRecoilState(userState);

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
