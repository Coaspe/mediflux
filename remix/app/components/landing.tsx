/** @format */

import { Form, useActionData } from "@remix-run/react";
import React, { Dispatch, HTMLInputTypeAttribute, useEffect, useRef, useState } from "react";
import Icon, { ICONS } from "./Icons";
import { Transition } from "@headlessui/react";
import "./css/LoginModal.css";
import { Role } from "~/type";
import { ROLE } from "~/constant";

export const LoginButton = ({ name, onClick }: { name: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="bg-button font-work text-white font-semibold text-3xl py-4 px-10 rounded-xl shadow-lg transition-all delay-0 duration-200 ease-out [translate:0] hover:[translate:0_-2px]">
      {name}
    </button>
  );
};

export const AlertP = ({ msg }: { msg: string | undefined }) => {
  return (
    <p className={`h-2 text-red-400 text-xs transition-opacity ${msg ? "opacity-100" : "opacity-0"} duration-200 `} role="alert">
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
};

export const LoginInput: React.FC<LoginInputProps> = ({ id, type, placeholder, name, defaultValue, ariaErrorMessage, ariaInvalid }) => {
  const [value, setValue] = useState<string | undefined>();
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
  fields: {
    password?: string | undefined;
    userId?: string | undefined;
  };
  formError: null;
};

export const LoginModal: React.FC<LoginModalProps> = ({ setIsModalOpen }) => {
  let actionData = useActionData<LoginAction>();
  const [open, setOpen] = useState(true);
  let [role, setRole] = useState<Role>(ROLE.DOCTOR);
  const divRef = useRef<HTMLDivElement | null>(null);
  const clear = useRef(false);
  const closeModal = () => {
    clear.current = true;
    setOpen(false);
  };

  const changeMode = () => {
    setIsLoginMode((origin) => !origin);
  };
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
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
      <div
        ref={divRef}
        onTransitionEnd={() => {
          if (!open) {
            setIsModalOpen(false);
          }
        }}
        onClick={closeModal}
        className={`fixed bg-black bg-opacity-50 inset-0 flex items-center justify-center example-style`}>
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
                      <div className="w-full">
                        <LoginInput
                          id="first-name-input"
                          type="text"
                          placeholder="성"
                          name="firstName"
                          ariaInvalid={Boolean(actionData?.fieldErrors?.firstName)}
                          ariaErrorMessage={actionData?.fieldErrors?.firstName ? "firstName-error" : undefined}
                        />
                        <AlertP msg={actionData?.fieldErrors?.firstName} />
                      </div>
                      <div className="w-full">
                        <LoginInput
                          id="last-name-input"
                          type="text"
                          placeholder="이름"
                          name="lastName"
                          ariaInvalid={Boolean(actionData?.fieldErrors?.lastName)}
                          ariaErrorMessage={actionData?.fieldErrors?.lastName ? "lastName-error" : undefined}
                        />
                        <AlertP msg={actionData?.fieldErrors?.lastName} />
                      </div>
                      <select
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
                <div className="w-full">
                  <LoginInput
                    id="userId-input"
                    type="text"
                    placeholder="아이디"
                    name="userId"
                    ariaInvalid={Boolean(actionData?.fieldErrors?.userId)}
                    ariaErrorMessage={actionData?.fieldErrors?.userId ? "userId-error" : undefined}
                  />
                  <AlertP msg={actionData?.fieldErrors?.userId} />
                </div>
                <div className="w-full">
                  <LoginInput
                    id="password"
                    type="password"
                    placeholder="패스워드"
                    name="password"
                    ariaInvalid={Boolean(actionData?.fieldErrors?.password)}
                    ariaErrorMessage={actionData?.fieldErrors?.password ? "password-error" : undefined}
                  />
                  <AlertP msg={actionData?.fieldErrors?.password} />
                </div>
                {!isLoginMode && (
                  <div className="w-full">
                    <LoginInput
                      id="confirm-input"
                      type="password"
                      placeholder="패스워드 확인"
                      name="confirm"
                      ariaInvalid={Boolean(actionData?.fieldErrors?.confirm)}
                      ariaErrorMessage={actionData?.fieldErrors?.confirm ? "confirm-error" : undefined}
                    />
                    <AlertP msg={actionData?.fieldErrors?.confirm} />
                  </div>
                )}
                <input className="hidden" id="role-input" type="text" name="role" onChange={() => {}} value={role} />
                {clear && <input className="hidden" id="clear-input" type="text" name="clear" onChange={() => {}} value={"clear"} />}
                <input className="hidden" id="logintype-input" type="text" name="requestType" onChange={() => {}} value={isLoginMode ? "login" : "register"} />
                <input className="hidden" id="redirectTo-input" type="text" name="redirectTo" defaultValue={"/dashboard/scheduling"} />
              </div>
              <div className="w-full h-10 flex items-center justify-center">
                {!isLoading ? (
                  <button
                    className="bg-button hover:bg-blue-800 text-gray-200  font-bold py-2.5 px-4 rounded-3xl focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
                    type="submit">
                    확인
                  </button>
                ) : (
                  <span className="loader"></span>
                )}
              </div>
            </Form>
            <p className="text-blue-500 hover:underline cursor-pointer pt-5" onClick={changeMode}>
              {isLoginMode ? "회원가입" : "로그인"}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  );
};
