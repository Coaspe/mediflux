import { useRecoilState, useSetRecoilState } from "recoil";
import { sessionExpireModalOpenState, userState } from "~/recoil_state";
import { redirect } from "@remix-run/node";
import { useState } from "react";

export const SessionExpiredModal = () => {
  const [open, setOpen] = useRecoilState(sessionExpireModalOpenState);
  const [isBlock, setIsBlock] = useState(true);
  const setUser = useSetRecoilState(userState);

  const handleClose = () => {
    setUser(undefined);
    setOpen(false);
    redirect("/");
  };

  return (
    <div
      onAnimationStart={() => {
        if (open) {
          setIsBlock(true);
        }
      }}
      onAnimationEnd={() => {
        if (!open) {
          setIsBlock(false);
        }
      }}
      className={`transition-all ${isBlock ? "block" : "none"} ${open ? "opacity-100" : "opacity-0"}`}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ background: "white", padding: "20px", borderRadius: "5px" }}>
        <h2>세션 만료</h2>
        <p>세션이 만료되었습니다. 다시 로그인해 주세요.</p>
        <button onClick={handleClose}>확인</button>
      </div>
    </div>
  );
};
