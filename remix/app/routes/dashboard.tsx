/** @format */

import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { SIDE_MENU } from "~/constant";
import { useEffect, useState } from "react";
import { Menu, SubMenu } from "react-pro-sidebar";
import { SideMenu, User } from "~/type";
import Icon, { ICONS } from "~/components/Icons";
import { useRecoilState, useSetRecoilState } from "recoil";
import { sessionExpireModalOpenState, userState } from "~/recoil_state";
import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { destoryBrowserSession, destroyUserSession, getUserSession } from "~/services/session.server";
import { getUserByID } from "~/utils/request.server";
import DashboardHeader from "~/components/Dashboard/Header";

function MenuItemLi({
  onClick,
  to,
  name,
  clickedMenu,
  icon,
  fontSize,
  isSubMenu = false,
}: {
  onClick: () => void;
  to: string;
  name: string;
  clickedMenu: SideMenu | undefined;
  icon: string;
  isSubMenu?: boolean;
  fontSize?: string;
}) {
  return (
    <li className={`w-full ${clickedMenu == to ? "bg-button text-white" : "hover:bg-gray-100"}`}>
      <Link onClick={onClick} className={`flex items-center h-[50px] text-current cursor-pointer pr-[20px] ${isSubMenu ? "pl-[40px]" : "pl-[20px]"}`} to={to}>
        <Icon className={`text-gray-500 mr-[10px] ${fontSize} css-wx7wi4`} iconName={icon} />
        <span className={`${fontSize} inline-block flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap`}>{name}</span>
      </Link>
    </li>
  );
}

const isSideMenu = (value: any): value is SideMenu => {
  return Object.values(SIDE_MENU).includes(value);
};

export async function loader({ request }: LoaderFunctionArgs) {
  let sessionData = await getUserSession(request);

  if (sessionData.status === "session-expired") {
    return await destroyUserSession(request, sessionData.id);
  } else if (sessionData.status === "invalid-session") {
    return destoryBrowserSession("/", request);
  } else if (sessionData.status !== "active") {
    return redirect("/");
  }

  let result = await getUserByID(sessionData.id);
  if ("user" in result) {
    return result.user;
  }

  return redirect("/");
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const requestType = formData.get("requestType");

  switch (requestType) {
    case "destroySession":
      const userId = formData.get("userId")?.toString();
      if (userId) {
        const result = await destroyUserSession(request, userId);
        return result;
      }
      return null;

    default:
      return null;
  }
};

export default function Dashboard() {
  const [clickedMenu, setClickedMenu] = useState<SideMenu>();
  const location = useLocation();
  const [user, setUser] = useRecoilState(userState);
  const loadData = useLoaderData();
  const setModalOpen = useSetRecoilState(sessionExpireModalOpenState);

  useEffect(() => {
    if (loadData === "session-expired") {
      setModalOpen(true);
    } else if (typeof loadData === "object") {
      setUser(loadData as User);
    }
    const path = location.pathname.split("/");
    if (isSideMenu(path[path.length - 1])) {
      setClickedMenu(path[path.length - 1] as SideMenu);
    }
    console.log(SIDE_MENU);
  }, []);

  return user ? (
    <div className="flex flex-col pr-5 h-screen w-full">
      <DashboardHeader selectedMenu={clickedMenu} />
      <div className="flex max-w-full h-full">
        <aside className="font-work pr-5 w-[220px]">
          <Menu>
            <SubMenu icon={<Icon className={"text-gray-500 "} iconName={ICONS.EVENT_NOTE} />} label="Schedule">
              <MenuItemLi
                onClick={() => setClickedMenu(SIDE_MENU.SCHEDULING)}
                to={"scheduling"}
                name={"Scheduling"}
                icon={"edit_calendar"}
                clickedMenu={clickedMenu}
                fontSize="text-sm"
                isSubMenu={true}
              />
              <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.ARCHIVE)} to={"archive"} name={"Archive"} icon={"home_storage"} clickedMenu={clickedMenu} fontSize="text-sm" isSubMenu={true} />
            </SubMenu>
            <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.MEMBERS)} to={"members"} name={"Members"} icon={"groups"} clickedMenu={clickedMenu} />
            <SubMenu icon={<Icon className={"text-gray-500 "} iconName={"settings"} />} label="Settings">
              <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.TREATMENTS)} to={"treatments"} name={"Treatments"} icon={"syringe"} clickedMenu={clickedMenu} isSubMenu={true} />
            </SubMenu>
          </Menu>
        </aside>
        <Outlet />
      </div>
    </div>
  ) : (
    <></>
  );
}
