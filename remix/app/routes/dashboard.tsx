/** @format */

import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { ROLE, SIDE_MENU } from "~/constant";
import { useEffect, useState } from "react";
import { Menu, SubMenu } from "react-pro-sidebar";
import { SideMenu, User } from "~/type";
import DashboardHeader from "~/components/DashboardHeader";
import Icon, { ICONS } from "~/components/Icons";
import axios from "axios";
import { useRecoilState } from "recoil";
import { userState } from "~/recoil_state";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserSession } from "~/services/session.server";

function MenuItemLi({ onClick, to, name, clickedMenu }: { onClick: () => void; to: string; name: string; clickedMenu: SideMenu | undefined }) {
  return (
    <li onClick={onClick} className={`w-full relative ${clickedMenu == to ? "bg-button text-white" : "hover:bg-gray-100"}`}>
      <Link className="flex items-center h-[50px] text-current cursor-pointer pr-[20px] pl-[40px]" to={to}>
        <span className="flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">{name}</span>
      </Link>
    </li>
  );
}
const isSideMenu = (value: any): value is SideMenu => {
  return Object.values(SIDE_MENU).includes(value);
};

export async function loader({ request }: LoaderFunctionArgs) {
  let id = await getUserSession(request);
  if (!id) {
    return null;
  }
  try {
    const result = await axios.get(`http://localhost:5000/api/getUserByID`, { params: { id } });

    if (result.status === 200) {
      const user = result.data.user;
      const clientUser = { id: user.contact_id, userid: user.login_id, role: ROLE.DOCTOR, name: user.first_name + user.last_name } as User;
      return clientUser;
    }
  } catch (error: any) {
    return null;
  }
}

export default function Dashboard() {
  const [clickedMenu, setClickedMenu] = useState<SideMenu>();
  const location = useLocation();
  const [user, setUser] = useRecoilState(userState);
  const loadData = useLoaderData<User | null>();

  useEffect(() => {
    const path = location.pathname.split("/");
    if (isSideMenu(path[path.length - 1])) {
      setClickedMenu(path[path.length - 1] as SideMenu);
    }
  }, []);

  useEffect(() => {
    if (loadData) {
      setUser(loadData as User);
    }
  }, [loadData]);

  return (
    user && (
      <div className="flex flex-col pr-5 h-screen w-full">
        <DashboardHeader selectedMenu={clickedMenu} />
        <div className="flex max-w-full h-full">
          <aside className="font-work pr-5 w-[220px]">
            <Menu>
              <SubMenu icon={<Icon className={"text-gray-500 "} iconName={ICONS.EVENT_NOTE} />} label="Schedule">
                <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.SCHEDULING)} to={"scheduling"} name={"Scheduling"} clickedMenu={clickedMenu} />
                <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.ARCHIVE)} to={"archive"} name={"Archive"} clickedMenu={clickedMenu} />
              </SubMenu>
            </Menu>
          </aside>
          <Outlet />
        </div>
      </div>
    )
  );
}
