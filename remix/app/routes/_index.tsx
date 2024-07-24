/** @format */

import type { ActionFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { LoginButton, LoginModal } from "~/components/Landing";
import { useEffect, useState } from "react";
import { badRequest } from "~/utils/request.server";
import { createUserSession, getUserSession, login, register } from "~/services/session.server";
import { LoginResponse, User } from "~/type";
import { ROLE, ServerUser } from "shared";
import axios from "axios";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import { useRecoilState } from "recoil";
import { userState } from "~/recoil_state";

async function validateUserid(userId: string) {
  if (userId.length <= 3) {
    return "아이디는 4글자 이상이어야합니다.";
  }

  try {
    const result = await axios.get(`http://localhost:5000/api/checkSameIDExists`, { params: { userId } });
    if (result.status === 200) {
      return undefined;
    } else {
      return result.data.message;
    }
  } catch (error: any) {
    return error.response.data.message;
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "비밀번호는 7자 이상이어야합니다.";
  }
}
function validateConfirm(password: string, confirm: string) {
  if (password !== confirm) {
    return "비밀번호가 일치하지 않습니다.";
  }
}
function validateUrl(url: string) {
  return url;
}

export async function loader({ request }: LoaderFunctionArgs) {
  let id = await getUserSession(request);
  if (!id) {
    return null;
  }
  try {
    const result = await axios.get(`http://localhost:5000/api/getUserByID`, { params: { id } });

    if (result.status === 200) {
      const user = result.data.user;
      const clientUser = { id: user.contact_id, userid: user.login_id, role: user.user_role, name: user.first_name + user.last_name } as User;
      return clientUser;
    }
  } catch (error: any) {
    return null;
  }
}

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const clear = form.get("clear");

  if (clear === "true") {
    return json({ fieldErrors: null, fields: null, formError: null }, { status: 200 });
  }

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

      fields["id"] = user.contact_id;
      const clientUser = { id: user.contact_id, userid: user.login_id, role: ROLE.DOCTOR } as User;

      return await createUserSession(clientUser, redirectTo);
    }

    case "register": {
      const firstName = form.get("firstName");
      const lastName = form.get("lastName");
      const role = form.get("role");
      const confirm = form.get("confirm");

      if (typeof confirm !== "string" || typeof role !== "string" || typeof lastName !== "string" || typeof firstName !== "string") {
        return badRequest({
          fieldErrors: null,
          fields: null,
          formError: "Form not submitted correctly.",
        });
      }

      const fieldErrors = {
        userId: await validateUserid(userId),
        password: validatePassword(password),
        confirm: validateConfirm(password, confirm),
      };

      if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
          fieldErrors,
          fields,
          formError: null,
        });
      }

      let result = await register({ userId, password, role, firstName, lastName });
      if (result.status === 200) {
        const user = result.data.user as ServerUser;
        let clientUser = { id: user.contact_id, name: firstName + lastName, role } as User;
        return await createUserSession(clientUser, redirectTo);
      }

      return null;
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
  const loadData = useLoaderData();
  const [user, setUser] = useRecoilState(userState);
  const navigator = useNavigate();

  useEffect(() => {
    if (loadData) {
      setUser(loadData as User);
    }
  }, [loadData]);

  useEffect(() => {
    if (user) {
      navigator("/dashboard/scheduling");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="flex justify-center ">
        <div className="rounded-lg shadow-lg p-8 font-noto">
          <h2 className="text-9xl font-bold font-playfair mb-10">Efficient care,</h2>
          <h2 className="text-9xl font-bold font-playfair mb-10">Every time</h2>
          <LoginButton
            onClick={() => {
              setIsModalOpen(true);
            }}
            name="Get started"
          />
        </div>
      </div>
      {/* Login Modal */}
      {isModalOpen && <LoginModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />}
    </div>
  );
}
