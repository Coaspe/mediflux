/** @format */

import { getMenuName, getRoleName } from "~/utils/utils";
import DropdownMenu from "./Dropdown";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import { Role } from "shared";
import { useSubmit } from "@remix-run/react";
import { SideMenu } from "~/constants/constant";

function DashboardUser() {
  const [doesAlarmExist, setDoesAlarmExist] = useState(true);
  const user = useRecoilValue(userState);
  const submit = useSubmit();

  const logout = () => {
    if (user) {
      const formData = new FormData();
      formData.append("requestType", "destroySession");
      formData.append("userId", user?.id);
      submit(formData, { method: "POST" });
    }
  };

  return (
    <div className="flex items-center gap-3 font-work">
      <div className="flex items-center gap-3 select-none">
        <div className="flex items-center justify-center w-8 h-8 border-2 border-black rounded-md">
          <span className="text-4xl material-symbols-rounded">person</span>
        </div>
        <div className="flex flex-col justify-between">
          <span className="text-sm">{user && user.name}</span>
          <span className="text-xs text-gray-500">{getRoleName(Role.DOCTOR)}</span>
        </div>
        <span onClick={logout} className="text-4xl cursor-pointer material-symbols-outlined">
          logout
        </span>
      </div>
    </div>
  );
}

export default function DashboardHeader({ selectedMenu }: { selectedMenu: SideMenu | undefined }) {
  return (
    <header className="flex items-center justify-between w-full min-h-24 pl-12 pr-12 font-playfair">
      <div className="flex items-center">
        <h1 className="w-[250px] text-4xl font-extrabold text-button cursor-pointer select-none">MediFlux</h1>
        <h2 className="text-xl font-bold select-none font-work">{getMenuName(selectedMenu)}</h2>
      </div>
      <div className="flex gap-10">
        <DashboardUser />
      </div>
    </header>
  );
}
