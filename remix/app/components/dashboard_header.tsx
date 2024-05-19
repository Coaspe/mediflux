import { ROLE } from "~/constant";
import { SideMenu, User } from "~/type";
import { getMenuName, getRoleName } from "~/utils/utils";
import DropdownMenu from "./dropdown";
import { useState } from "react";

const mockUser: User = {
    id: 123,
    name: "이우람",
    image: "",
    role: ROLE.DOCTOR,
}

function DashboardUser({ user }: { user: User }) {
    let [doesAlarmExist, setDoesAlarmExist] = useState(true)

    return <div className="flex items-center gap-3 font-work">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-alarmButtonBg relative cursor-pointer">
            {doesAlarmExist && (<div className="absolute w-1 h-1 rounded-full bg-red-600 right-1 top-1"> </div>)}
            <span className="material-symbols-outlined text-alarmButtonLine">
                notifications
            </span>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center border-2 border-black w-8 h-8 rounded-md">
                <span className="material-symbols-rounded text-4xl">
                    person
                </span>
            </div>
            <div className="flex flex-col justify-between">
                <span className="text-sm">
                    {user.name}
                </span>
                <span className="text-xs text-gray-500">
                    {getRoleName(user.role)}
                </span>
            </div>
        </div>
    </div>
}

export default function DashboardHeader({ selectedMenu }: { selectedMenu: SideMenu | undefined }) {
    return (<header className="min-h-24 font-playfair flex items-center justify-between pl-12 pr-12 w-full">
        <div className="flex items-center">
            <h1 className="w-[250px] font-extrabold text-4xl">
                MediFlux
            </h1>
            <h2 className="font-work text-xl font-bold">
                {getMenuName(selectedMenu)}
            </h2>
        </div>
        <div className="flex gap-10">
            <DropdownMenu />
            <DashboardUser user={mockUser} />
        </div>
    </header>)
}
