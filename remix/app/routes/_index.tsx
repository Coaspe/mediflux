/** @format */

import type { ActionFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { LoginButton, LoginModal } from "~/components/Landing";
import { useState } from "react";
import { badRequest, checkSameIdExists } from "~/utils/request.server";
import { createUserSession, getUserSession, login, register } from "~/services/session.server";
import { LoginResponse } from "~/types/type";
import { ServerUser } from "shared";
import { json } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import "../css/Animation.scss";
import { convertServerUserToClientUser } from "~/utils/utils";
import { DEFAULT_REDIRECT } from "~/constant";

// 유효성 검사 함수 분리
async function validateUserId(userId: string): Promise<string | undefined> {
  if (userId.length <= 3) return "아이디는 4글자 이상이어야 합니다.";

  try {
    const result = await checkSameIdExists(userId);
    return result.status === 200 ? undefined : result.data.message;
  } catch (error: any) {
    return error.response?.data?.message || "서버 오류";
  }
}

function validatePassword(password: string): string | undefined {
  return password.length < 6 ? "비밀번호는 7자 이상이어야 합니다." : undefined;
}

function validateConfirmPassword(password: string, confirm: string): string | undefined {
  return password !== confirm ? "비밀번호가 일치하지 않습니다." : undefined;
}

function validateUrl(url: string): string {
  return url;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionResult = await getUserSession(request);
  if (sessionResult.status === "active") {
    return redirect("/dashboard/scheduling");
  }
  return null;
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
  const redirectTo = validateUrl((form.get("redirectTo") as string) || DEFAULT_REDIRECT);

  if (typeof password !== "string" || typeof userId !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  // 유효성 검사 분리
  const fieldErrors = {
    userId: await validateUserId(userId),
    password: validatePassword(password),
    confirm: requestType === "register" ? validateConfirmPassword(password, form.get("confirm") as string) : undefined,
  };

  if (Object.values(fieldErrors).some(Boolean) && requestType === "register") {
    return badRequest({ fieldErrors, formError: null });
  }

  return requestType === "login" ? handleLogin({ userId, password, redirectTo, request }) : handleRegister({ userId, password, form, redirectTo, request });
};

// 로그인 처리 함수
async function handleLogin({ userId, password, redirectTo, request }: { userId: string; password: string; redirectTo: string; request: Request }) {
  const result = (await login({ userId, password })) as LoginResponse;

  if (result.status !== 200) {
    const fieldErrors = {
      userId: result.errorType === 1 ? result.message : undefined,
      password: result.errorType === 2 ? result.message : undefined,
    };

    return badRequest({
      fieldErrors,
      formError: null,
      serverError: result.errorType === 3,
    });
  }

  const user = result.user as ServerUser;
  const clientUser = convertServerUserToClientUser(user);

  return createUserSession(clientUser, redirectTo, request);
}

// 회원가입 처리 함수
async function handleRegister({ userId, password, form, redirectTo, request }: { userId: string; password: string; form: FormData; redirectTo: string; request: Request }) {
  const firstName = form.get("firstName") as string;
  const lastName = form.get("lastName") as string;
  const role = form.get("role") as string;

  if (!firstName || !lastName || !role) {
    return badRequest({
      fieldErrors: null,
      formError: "Form not submitted correctly.",
    });
  }

  const result = await register({ userId, password, role, firstName, lastName });

  if (result.status === 200) {
    const user = result.data.user as ServerUser;
    const clientUser = convertServerUserToClientUser(user);
    return createUserSession(clientUser, redirectTo, request);
  }

  return badRequest({
    fieldErrors: null,
    formError: null,
    serverError: true,
  });
}

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="flex justify-center">
        <div className="rounded-lg animated-paper p-8 font-noto relative animated-title">
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
