import { Link, Outlet } from "@remix-run/react";
import { SIDE_MENU } from "~/constant";
import { useState } from "react";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import { SideMenu } from "~/type";
import DashboardHeader from "~/components/DashboardHeader";
import Icon, { ICONS } from "~/components/Icons";

function MenuItemLi({ onClick, to, name, clickedMenu }: { onClick: () => void, to: string, name: string, clickedMenu: SideMenu | undefined }) {
  return (
    <li onClick={onClick} className={`w-full relative ${clickedMenu == to ? "bg-button text-white" : "hover:bg-gray-100"}`}>
      <Link className="flex items-center h-[50px] text-current cursor-pointer pr-[20px] pl-[40px]" to={to}>
        <span className="flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">{name}</span>
      </Link>
    </li>
  )
}

export default function Dashboard() {
  const [clickedMenu, setClickedMenu] = useState<SideMenu>()

  return (
    <div className="flex-col pr-5">
      <DashboardHeader selectedMenu={clickedMenu} />
      <div className="flex">
        <Sidebar className="font-work pr-5">
          <Menu>
            <SubMenu
              icon={
                <Icon className={"text-gray-500 "} iconName={ICONS.EVENT_NOTE} />
              }
              label="Schedule"
            >
              <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.SCHEDULING)} to={"scheduling"} name={"Scheduling"} clickedMenu={clickedMenu} />
              <MenuItemLi onClick={() => setClickedMenu(SIDE_MENU.MYWORKS)} to={"myworks"} name={"My works"} clickedMenu={clickedMenu} />
            </SubMenu>
            <MenuItem
              icon={
                <Icon className={"text-gray-500"} iconName={ICONS.DASHBOARD} />
              }
            >
              Dashboard
            </MenuItem>
            <MenuItem
              icon={
                <Icon className={"text-gray-500"} iconName={ICONS.NOTIFICATION} />
              }
            >
              {" "}
              Notifications{" "}
            </MenuItem>
          </Menu>
        </Sidebar>
        <Outlet />
      </div>
    </div>
  );
}
