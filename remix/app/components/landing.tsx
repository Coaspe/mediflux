interface ModalProps {
  onClose: () => void;
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
      className="bg-button text-white font-semibold text-3xl py-4 px-10 rounded-xl shadow-lg transition-all delay-0 duration-200 ease-out [translate:0] hover:[translate:0_-2px]"
    >
      {name}
      {/* <Link to="/login">{name}</Link> */}
    </button>
  );
}

// Modal.tsx

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col justify-center items-center bg-white p-8 rounded-md">
        <form>
          <div className="flex flex-col justify-center items-center mt-4 mb-4 gap-3">
            <input
              className="shadow appearance-none border-2 border-gray-600 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
            />
            <input
              className="shadow appearance-none border-2 border-gray-600 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
            />
          </div>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Log in
          </button>
        </form>
        <button className="text-blue-500 hover:underline" onClick={onClose}>
          Create account
        </button>
      </div>
    </div>
  );
};

export default Modal;
