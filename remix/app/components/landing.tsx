/** @format */

import { Form, useActionData } from "@remix-run/react";
import React, { Dispatch, HTMLInputTypeAttribute, useEffect, useRef, useState } from "react";
import Icon, { ICONS } from "./Icons";
import { Transition } from "@headlessui/react";
import "../css/LoginModal.css";
import { useSubmit } from "@remix-run/react";
import { ROLE, Role } from "shared";
import { useSetRecoilState } from "recoil";
import { globalSnackbarState } from "~/recoil_state";
import "../css/Animation.scss";
export const LoginButton = ({ name, onClick }: { name: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="animated-button bg-button font-work text-white font-semibold text-3xl py-4 px-10 rounded-xl shadow-lg transition-all delay-0 duration-200 ease-out [translate:0] hover:[translate:0_-2px]">
      {name}
    </button>
  );
};

export const AlertP = ({ msg }: { msg: string | undefined }) => {
  return (
    <p className={`h-2 absolute bottom-0 text-red-400 text-xs transition-opacity ${msg ? "opacity-100" : "opacity-0"} duration-200 translate-y-full`} role="alert">
      {msg}
    </p>
  );
};

type LoginInputProps = {
  id?: string;
  type: HTMLInputTypeAttribute | undefined;
  placeholder: string | undefined;
  name: string | undefined;
  defaultValue?: string;
  ariaInvalid: boolean;
  ariaErrorMessage: string | undefined;
  isLoginMode: boolean;
};

export const LoginInput: React.FC<LoginInputProps> = ({ id, type, placeholder, name, defaultValue, ariaErrorMessage, ariaInvalid, isLoginMode }) => {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    setValue("");
  }, [isLoginMode]);

  return (
    <div className="relative group/item">
      <input
        className="shadow appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
        id={id}
        type={type}
        placeholder={placeholder}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={ariaInvalid}
        aria-errormessage={ariaErrorMessage}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Icon
        onClick={() => {
          setValue("");
        }}
        className={"text-gray-400 text-xs absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer invisible group-hover/item:visible "}
        iconName={ICONS.CLOSE}
      />
    </div>
  );
};

type LoginModalProps = {
  setIsModalOpen: Dispatch<boolean>;
  isModalOpen: boolean;
};

type LoginAction = {
  fieldErrors: {
    password?: string | undefined;
    userId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: string | undefined;
    confirm?: string | undefined;
  };
  formError?: null;
  serverError?: boolean;
};

export const LoginModal: React.FC<LoginModalProps> = ({ setIsModalOpen }) => {
  const actionData = useActionData<LoginAction>();
  const [open, setOpen] = useState(true);
  const [role, setRole] = useState<Role>(ROLE.DOCTOR);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const submit = useSubmit();
  const divRef = useRef<HTMLDivElement | null>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const closeModal = () => {
    setOpen(false);
  };
  const clearActionData = () => {
    const formData = new FormData();
    formData.append("clear", "true");
    submit(formData, { method: "POST" });
  };
  const changeMode = () => {
    setIsLoginMode((origin) => !origin);
    clearActionData();
  };

  const onTransitionEnd = () => {
    if (!open) {
      setIsModalOpen(false);
      clearActionData();
    }
  };

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    if (actionData?.serverError) {
      setGlobalSnackBar({ open: true, msg: "서버 오류", severity: "error" });
    } else {
    }
  }, [actionData]);

  return (
    <Transition
      show={open}
      enter="transition-opacity duration-300 ease-in-out"
      enterFrom="opacity-0 block"
      enterTo="opacity-100"
      leave="transition-opacity duration-300 ease-in-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0 none">
      <div ref={divRef} onTransitionEnd={onTransitionEnd} onClick={closeModal} className={`fixed bg-black bg-opacity-50 inset-0 flex items-center justify-center example-style`}>
        <div
          onClick={(event) => event.stopPropagation()}
          style={{ height: isLoginMode ? "400px" : "500px" }}
          className={`flex flex-col items-center relative bg-white p-8 rounded-md w-[400px] transition-all`}>
          <Icon onClick={closeModal} className={"absolute right-0 top-0 pr-3 pt-3 cursor-pointer"} iconName={ICONS.CLOSE} />
          <span className="font-work font-semibold text-2xl">{isLoginMode ? "Login" : "Register"}</span>
          <div className="flex flex-col justify-evenly items-center h-full">
            <Form onSubmit={() => setIsLoading(true)} method="post">
              <div className="w-[300px] flex flex-col justify-center items-center mb-8 gap-4 text-sm ">
                {!isLoginMode && (
                  <>
                    <div className="flex justify-between items-center w-full gap-2">
                      <div className="w-2/5 relative">
                        <LoginInput
                          id="first-name-input"
                          type="text"
                          placeholder="성"
                          name="firstName"
                          ariaInvalid={Boolean(actionData?.fieldErrors?.firstName)}
                          ariaErrorMessage={actionData?.fieldErrors?.firstName ? "firstName-error" : undefined}
                          isLoginMode={isLoginMode}
                        />
                        <AlertP msg={actionData?.fieldErrors?.firstName} />
                      </div>
                      <div className="w-2/5 relative">
                        <LoginInput
                          id="last-name-input"
                          type="text"
                          placeholder="이름"
                          name="lastName"
                          ariaInvalid={Boolean(actionData?.fieldErrors?.lastName)}
                          ariaErrorMessage={actionData?.fieldErrors?.lastName ? "lastName-error" : undefined}
                          isLoginMode={isLoginMode}
                        />
                        <AlertP msg={actionData?.fieldErrors?.lastName} />
                      </div>
                      <select
                        className="w-1/5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(event) => {
                          setRole(event.target.value as Role);
                        }}
                        value={role}>
                        <option value="doctor">의사</option>
                        <option value="nurse">간호사</option>
                        <option value="staff">스태프</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="w-full relative">
                  <LoginInput
                    id="userId-input"
                    type="text"
                    placeholder="아이디"
                    name="userId"
                    ariaInvalid={Boolean(actionData?.fieldErrors?.userId)}
                    ariaErrorMessage={actionData?.fieldErrors?.userId ? "userId-error" : undefined}
                    isLoginMode={isLoginMode}
                  />
                  <AlertP msg={actionData?.fieldErrors?.userId} />
                </div>
                <div className="w-full relative">
                  <LoginInput
                    id="password"
                    type="password"
                    placeholder="패스워드"
                    name="password"
                    ariaInvalid={Boolean(actionData?.fieldErrors?.password)}
                    ariaErrorMessage={actionData?.fieldErrors?.password ? "password-error" : undefined}
                    isLoginMode={isLoginMode}
                  />
                  <AlertP msg={actionData?.fieldErrors?.password} />
                </div>
                {!isLoginMode && (
                  <div className="w-full relative">
                    <LoginInput
                      id="confirm-input"
                      type="password"
                      placeholder="패스워드 확인"
                      name="confirm"
                      ariaInvalid={Boolean(actionData?.fieldErrors?.confirm)}
                      ariaErrorMessage={actionData?.fieldErrors?.confirm ? "confirm-error" : undefined}
                      isLoginMode={isLoginMode}
                    />
                    <AlertP msg={actionData?.fieldErrors?.confirm} />
                  </div>
                )}
                <input className="hidden" id="role-input" type="text" name="role" onChange={() => {}} value={role} />
                <input className="hidden" id="logintype-input" type="text" name="requestType" onChange={() => {}} value={isLoginMode ? "login" : "register"} />
                <input className="hidden" id="redirectTo-input" type="text" name="redirectTo" defaultValue={"/dashboard/scheduling"} />
              </div>
              <div className="w-full h-10 flex items-center justify-center">
                {!isLoading ? (
                  <button
                    className="bg-button hover:bg-blue-800 text-gray-200 font-noto font-bold py-2.5 px-4 rounded-3xl focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
                    type="submit">
                    확인
                  </button>
                ) : (
                  <span className="loader"></span>
                )}
              </div>
            </Form>
            <p className="text-blue-500 hover:underline cursor-pointer font-noto" onClick={changeMode}>
              {isLoginMode ? "회원가입" : "로그인"}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  );
};
