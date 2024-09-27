/** @format */

import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { DEFAULT_REDIRECT, SideMenu } from "~/constants/constant";
import { useEffect, useState } from "react";
import { Menu, SubMenu } from "react-pro-sidebar";
import { User } from "~/types/type";
import Icon, { ICONS } from "~/components/Icons";
import { useRecoilState, useSetRecoilState } from "recoil";
import { sessionExpireModalOpenState, userState } from "~/recoil_state";
import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { destoryBrowserSession, destroyUserSession, getSessionId } from "~/services/session.server";
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
    <li className={`w-full ${clickedMenu === to ? "bg-button text-white" : "hover:bg-gray-100"}`}>
      <Link onClick={onClick} className={`flex items-center h-[50px] text-current cursor-pointer pr-[20px] ${isSubMenu ? "pl-[40px]" : "pl-[20px]"}`} to={to}>
        <Icon className={`text-gray-500 mr-[10px] ${fontSize} css-wx7wi4`} iconName={icon} />
        <span className={`${fontSize} inline-block flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap`}>{name}</span>
      </Link>
    </li>
  );
}

const isSideMenu = (value: any): value is SideMenu => {
  return Object.values(SideMenu).includes(value);
};

export async function loader({ request }: LoaderFunctionArgs) {
  let sessionData = await getSessionId(request);

  if (sessionData.status === "session-expired") {
    return await destroyUserSession(request, sessionData.id);
  } else if (sessionData.status === "invalid-session") {
    return destoryBrowserSession(DEFAULT_REDIRECT, request);
  } else if (sessionData.status !== "active") {
    return redirect(DEFAULT_REDIRECT);
  }

  const { statusCode, body: { data: user = {}, error = null } = {} } = await getUserByID(sessionData.id);
  if (statusCode === 200) {
    return user;
  }

  return redirect(DEFAULT_REDIRECT);
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
    const path = location.pathname.split(DEFAULT_REDIRECT);
    if (isSideMenu(path[path.length - 1])) {
      setClickedMenu(path[path.length - 1] as SideMenu);
    }
  }, []);

  return user ? (
    <div className="flex flex-col h-screen w-full pr-5">
      <DashboardHeader selectedMenu={clickedMenu} />
      <div className="flex h-full w-full">
        <aside className="w-[220px] pr-5 font-work">
          <Menu>
            <SubMenu icon={<Icon className="text-gray-500" iconName={ICONS.EVENT_NOTE} />} label="Schedule">
              <MenuItemLi onClick={() => setClickedMenu(SideMenu.SCHEDULING)} to="scheduling" name="Scheduling" icon="edit_calendar" clickedMenu={clickedMenu} fontSize="text-sm" isSubMenu />
              <MenuItemLi onClick={() => setClickedMenu(SideMenu.ARCHIVE)} to="archive" name="Archive" icon="home_storage" clickedMenu={clickedMenu} fontSize="text-sm" isSubMenu />
            </SubMenu>
            <MenuItemLi onClick={() => setClickedMenu(SideMenu.MEMBERS)} to="members" name="Members" icon="groups" clickedMenu={clickedMenu} />
            <SubMenu icon={<Icon className="text-gray-500" iconName="settings" />} label="Settings">
              <MenuItemLi onClick={() => setClickedMenu(SideMenu.TREATMENTS)} to="treatments" name="Treatments" icon="syringe" clickedMenu={clickedMenu} isSubMenu />
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
