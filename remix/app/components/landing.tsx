import { Form, useActionData } from "@remix-run/react";
import React, { Dispatch, HTMLInputTypeAttribute } from "react";
import Icon, { ICONS } from "./Icons";
import { Transition } from "@headlessui/react";

export const LoginButton = ({ name, onClose }: { name: string; onClose: () => void }) => {
  return (
    <button
      onClick={onClose}
      className="bg-button font-work text-white font-semibold text-3xl py-4 px-10 rounded-xl shadow-lg transition-all delay-0 duration-200 ease-out [translate:0] hover:[translate:0_-2px]"
    >
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
  defaultValue: string | undefined;
  ariaInvalid: boolean;
  ariaErrorMessage: string | undefined;
};
export const LoginInput: React.FC<LoginInputProps> = ({ id, type, placeholder, name, defaultValue, ariaErrorMessage, ariaInvalid }) => {
  return (
    <input
      className="shadow appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
      id={id}
      type={type}
      placeholder={placeholder}
      name={name}
      defaultValue={defaultValue}
      aria-invalid={ariaInvalid}
      aria-errormessage={ariaErrorMessage}
    />
  );
};

type LoginModalProps = {
  setIsModalOpen: Dispatch<boolean>;
  isModalOpen: boolean;
};

type LoginAction = {
  fieldErrors: {
    password: string | undefined;
    username: string | undefined;
  };
  fields: {
    password: string | undefined;
    username: string | undefined;
  };
  formError: null;
};

export const LoginModal: React.FC<LoginModalProps> = ({ setIsModalOpen, isModalOpen }) => {
  const actionData = useActionData<LoginAction>();
  return (
    <Transition
      show={isModalOpen}
      enter="transition-opacity duration-300 ease-in-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300 ease-in-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div onClick={() => setIsModalOpen(false)} className={`fixed bg-black bg-opacity-50 inset-0 flex items-center justify-center`}>
        <div onClick={(event) => event.stopPropagation()} className="flex flex-col items-center relative bg-white p-8 rounded-md w-[400px] h-[400px] transition-all duration-100 transform">
          <Icon onClick={() => setIsModalOpen(!isModalOpen)} className={"absolute right-0 top-0 pr-3 pt-3 cursor-pointer"} iconName={ICONS.CLOSE} />
          <span className="font-semibold text-2xl">Login</span>
          <div className="flex flex-col justify-center items-center h-full">
            <Form method="post">
              <div className="w-[300px] flex flex-col justify-center items-center mb-8 gap-4 text-sm ">
                <div className="w-full">
                  <LoginInput
                    id="username-input"
                    type="text"
                    placeholder="아이디"
                    name="username"
                    defaultValue={actionData?.fields?.username}
                    ariaInvalid={Boolean(actionData?.fieldErrors?.username)}
                    ariaErrorMessage={actionData?.fieldErrors?.username ? "username-error" : undefined}
                  />
                  <AlertP msg={actionData?.fieldErrors?.username} />
                </div>
                <div className="w-full">
                  <LoginInput
                    id="password"
                    type="password"
                    placeholder="Password"
                    name="password"
                    defaultValue={actionData?.fields?.password}
                    ariaInvalid={Boolean(actionData?.fieldErrors?.password)}
                    ariaErrorMessage={actionData?.fieldErrors?.password ? "password-error" : undefined}
                  />
                  <AlertP msg={actionData?.fieldErrors?.password} />
                </div>
                <input className="hidden" id="logintype-input" type="text" name="requestType" defaultValue={"login"} />
                <input className="hidden" id="logintype-input" type="text" name="redirectTo" defaultValue={"/dashboard"} />
              </div>
              <button
                className="bg-button hover:bg-blue-800 text-gray-200 font-bold py-2.5 px-4 rounded-3xl focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
                type="submit"
              >
                Log in
              </button>
            </Form>
            <p className="text-blue-500 hover:underline cursor-pointer pt-5" onClick={() => setIsModalOpen(!isModalOpen)}>
              Create account
            </p>
          </div>
        </div>
      </div>
    </Transition>
  );
};
