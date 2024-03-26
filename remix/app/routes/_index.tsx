import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { LoginButton } from "~/components/landing";
import { useState } from "react";
import { Form, Link, Outlet, useActionData } from "@remix-run/react";
import { badRequest } from "~/utils/request.server";
import Icon, { ICONS } from "~/components/icons";

export const meta: MetaFunction = () => {
  return [
    { title: "MediFlux" },
    { name: "description", content: "Welcome to MediFlux!" },
  ];
};

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
  return "/";
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const requestType = form.get("requestType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl((form.get("redirectTo") as string) || "/");
  if (
    typeof requestType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fields = { requestType, password, username };
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

  return (
    <div className="min-h-screen">
      <div className="flex justify-center bg-gray-100">
        <div className="rounded-lg shadow-lg p-8 font-noto">
          <h2 className="text-9xl font-bold font-playfair mb-10">
            Efficient care,
          </h2>
          <h2 className="text-9xl font-bold font-playfair mb-10">Every time</h2>
          <LoginButton onClose={setIsModalOpenNot} name="Get started" />
        </div>
      </div>

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-work">
          <div className="relative bg-white p-8 rounded-md w-[400px] h-[400px] transition-all duration-100 transform">
            <Icon
              onClick={setIsModalOpenNot}
              className={"absolute right-0 top-0 pr-3 pt-3 cursor-pointer"}
              iconName={ICONS.CLOSE}
            />
            <div className="flex flex-col justify-center items-center h-full">
              <Form method="post">
                <div className="w-[300px] flex flex-col justify-center items-center mb-8 gap-3 text-sm ">
                  <div className="w-full">
                    <input
                      className="shadow appearance-none border-2 border-black rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="username-input"
                      type="text"
                      placeholder="Name"
                      name="username"
                      defaultValue={actionData?.fields?.username}
                      aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                      aria-errormessage={
                        actionData?.fieldErrors?.username
                          ? "username-error"
                          : undefined
                      }
                    />
                    {actionData?.fieldErrors?.username && (
                      <p role="alert">{actionData.fieldErrors.username}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <input
                      className="shadow appearance-none border-2 border-black rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      id="password"
                      type="password"
                      placeholder="Password"
                      name="password"
                      defaultValue={actionData?.fields?.password}
                      aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                      aria-errormessage={
                        actionData?.fieldErrors?.password
                          ? "password-error"
                          : undefined
                      }
                    />
                    {actionData?.fieldErrors?.password && (
                      <p role="alert">{actionData.fieldErrors.password}</p>
                    )}
                  </div>
                </div>
                <button
                  className="bg-black text-gray-300 font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
                  type="submit"
                >
                  <Link to="dashboard">Log in</Link>
                </button>
              </Form>
              <p
                className="text-blue-500 hover:underline cursor-pointer pt-5"
                onClick={setIsModalOpenNot}
              >
                Create account
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
