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
