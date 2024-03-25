import { TypedResponse } from "@remix-run/node";

interface ModalProps {
  onClose: () => void;
  actionData?: TypedResponse
}

export function LoginButton({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  return (
    <button
      onClick={onClose}
      className="bg-button font-work text-white font-semibold text-3xl py-4 px-10 rounded-xl shadow-lg transition-all delay-0 duration-200 ease-out [translate:0] hover:[translate:0_-2px]"
    >
      {name}
    </button>
  );
}

const LoginModal: React.FC<ModalProps> = ({ onClose, actionData }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-work">
      <div className="relative bg-white p-8 rounded-md w-[400px] h-[400px] transition-all duration-100 transform">
        <div className="flex flex-col justify-center items-center h-full">
          <span onClick={onClose} className="material-symbols-outlined absolute right-0 top-0 pr-3 pt-3 cursor-pointer">close</span>
          <form>
            <div className="w-[300px] flex flex-col justify-center items-center mb-8 gap-3 text-sm ">
              <input
                className="shadow appearance-none border-2 border-black rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                id="username-input"
                type="text"
                placeholder="Name"
                name="username"
              />
              <input
                className="shadow appearance-none border-2 border-black rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                id="password"
                type="password"
                placeholder="Password"
                name="password"
              />
            </div>
            <button
              className="bg-black text-gray-300 font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Log in
            </button>
          </form>
          <p className="text-blue-500 hover:underline cursor-pointer pt-5" onClick={onClose}>
            Create account
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
