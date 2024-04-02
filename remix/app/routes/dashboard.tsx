import { Link, Outlet } from "@remix-run/react";
import { useState } from "react";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import Icon, { ICONS } from "~/components/icons";
function MenuItemLi({ onClick, to, name, clickedMenu }: { onClick: () => void, to: string, name: string, clickedMenu: MENU | undefined }) {
  return (
    <li onClick={onClick} className={`w-full relative ${clickedMenu == to ? "bg-button text-white" : "hover:bg-gray-100"}`}>
      <Link className="flex items-center h-[50px] text-current cursor-pointer pr-[20px] pl-[40px]" to={to}>
        <span className="flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">{name}</span>
      </Link>
    </li>
  )
}


const MENU = {
  SCHEDULING: 'scheduling',
  MYWORKS: 'myworks'
} as const;
type MENU = typeof MENU[keyof typeof MENU];

function getMenuName(menu: MENU | undefined): string {
  switch (menu) {
    case MENU.SCHEDULING:
      return 'Scheduling';
    case MENU.MYWORKS:
      return 'My works';
    default:
      return ""
  }
}

function Header({ selectedMenu }: { selectedMenu: MENU | undefined }) {
  return <header className="min-h-24 font-playfair flex items-center pl-12 pr-12 w-full">
    <h1 className="w-[250px] font-extrabold text-4xl">
      MediFlux
    </h1>
    <h2 className="font-work text-xl font-bold">
      {getMenuName(selectedMenu)}
    </h2>
  </header>
}

export default function Dashboard() {
  const [clickedMenu, setClickedMenu] = useState<MENU>()

  return (
    <div className="flex-col">
      <Header selectedMenu={clickedMenu} />
      <div className="flex">
        <Sidebar className="font-work">
          <Menu>
            <SubMenu
              icon={
                <Icon className={"text-gray-500 "} iconName={ICONS.EVENT_NOTE} />
              }
              label="Schedule"
            >
              <MenuItemLi onClick={() => setClickedMenu(MENU.SCHEDULING)} to={"scheduling"} name={"Scheduling"} clickedMenu={clickedMenu} />
              <MenuItemLi onClick={() => setClickedMenu(MENU.MYWORKS)} to={"myworks"} name={"My works"} clickedMenu={clickedMenu} />
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
        <div className="pl-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
