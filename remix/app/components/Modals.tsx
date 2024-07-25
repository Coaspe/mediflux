/** @format */

import { useRecoilState, useSetRecoilState } from "recoil";
import { sessionExpireModalOpenState, userState } from "~/recoil_state";
import { useNavigate } from "@remix-run/react";

export const SessionExpiredModal = () => {
  const [open, setOpen] = useRecoilState(sessionExpireModalOpenState);
  const setUser = useSetRecoilState(userState);
  const navigator = useNavigate();

  const handleClose = () => {
    setUser(undefined);
    setOpen(false);
    navigator("/");
  };

  return (
    <div
      id="session-expired-modal"
      className={`${open ? "flex" : "hidden"} ${open ? "opacity-100" : "opacity-0"}`}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" }}>
      <div className="flex flex-col" style={{ background: "white", padding: "20px", borderRadius: "5px" }}>
        <p>세션이 존재하지 않습니다. 다시 로그인해 주세요.</p>
        <button className="self-end " onClick={handleClose}>
          확인
        </button>
      </div>
    </div>
  );
};
