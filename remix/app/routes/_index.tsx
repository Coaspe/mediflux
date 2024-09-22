import type { ActionFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { LoginButton, LoginModal } from "~/components/Landing";
import { useState } from "react";
import { badRequest, checkSameIdExists } from "~/utils/request.server";
import { createUserSession, getSessionId, login, register } from "~/services/session.server";
import { LoginResponse } from "~/types/type";
import { ServerUser } from "shared";
import { json } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import "../css/Animation.scss";
import { convertServerUserToClientUser } from "~/utils/utils";
import { DEFAULT_REDIRECT } from "~/constants/constant";
import { LoginError, RequestType } from "~/constants/enum";

const validateUserid = async (userId: string) => {
  if (userId.length <= 3) {
    return "아이디는 4글자 이상이어야합니다.";
  }

  try {
    const result = await checkSameIdExists(userId);
    return result.status === 200 ? undefined : result.data.message;
  } catch (error: any) {
    return error.response?.data?.message || "서버 오류";
  }
};

const validatePassword = (password: string) => {
  return password.length < 6 ? "비밀번호는 7자 이상이어야합니다." : undefined;
};

const validateConfirm = (password: string, confirm: string) => {
  return password !== confirm ? "비밀번호가 일치하지 않습니다." : undefined;
};

const validateUrl = (url: string) => url;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionResult = await getSessionId(request);
  return sessionResult.status !== "active" ? null : redirect("/dashboard/scheduling");
};

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const clear = form.get("clear");

  if (clear === "true") {
    return json({ fieldErrors: null, fields: null, formError: null }, { status: 200 });
  }

  const requestType: RequestType | null = form.get("requestType") as RequestType | null;
  const password = form.get("password");
  const userId = form.get("userId");
  const redirectTo = validateUrl((form.get("redirectTo") as string) || DEFAULT_REDIRECT);

  if (typeof password !== "string" || typeof userId !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const handleLogin = async () => {
    const result = (await login({ userId, password })) as LoginResponse;

    if (result.status !== 200) {
      const fieldErrors = {
        userId: result.errorType === LoginError.IdError ? result.message : undefined,
        password: result.errorType === LoginError.PasswordError ? result.message : undefined,
      };

      return badRequest({
        fieldErrors,
        formError: null,
        serverError: result.errorType === LoginError.EtcError,
      });
    }

    const user = result.user as ServerUser;
    const clientUser = convertServerUserToClientUser(user);

    return await createUserSession(clientUser, redirectTo, request);
  };

  const handleRegister = async () => {
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
        formError: null,
      });
    }

    const result = await register({ userId, password, role, firstName, lastName, clinic: "gn_ss_bailor" });

    if (result.status === 200) {
      const user = result.data.user as ServerUser;
      const clientUser = convertServerUserToClientUser(user);

      return await createUserSession(clientUser, redirectTo, request);
    }

    return badRequest({
      fieldErrors: null,
      formError: null,
      serverError: true,
    });
  };

  switch (requestType) {
    case RequestType.Login:
      return await handleLogin();
    case RequestType.Register:
      return await handleRegister();
    default:
      return badRequest({
        fieldErrors: null,
        formError: "Login type invalid",
      });
  }
};

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex justify-center">
        <div className="relative rounded-lg p-8 font-noto animated-paper animated-title">
          <div className="overflow-hidden">
            <h2 className="text-9xl font-bold font-playfair select-none">Efficient care,</h2>
          </div>
          <div className="overflow-hidden">
            <h2 className="text-9xl font-bold font-playfair select-none mb-10">Every time</h2>
          </div>
          <LoginButton onClick={() => setIsModalOpen(true)} name="Get started" />
        </div>
      </div>
      {/* Login Modal */}
      {isModalOpen && <LoginModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />}
    </div>
  );
}
