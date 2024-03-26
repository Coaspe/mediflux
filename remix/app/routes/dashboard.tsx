import { Link, Outlet } from "@remix-run/react";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import Icon, { ICONS } from "~/components/icons";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar className="font-work">
        <Menu>
          <SubMenu
            icon={
              <Icon className={"text-gray-500 "} iconName={ICONS.EVENT_NOTE} />
            }
            label="Schedule"
          >
            <Link to={"scheduling"}>
              <MenuItem> Scheduling </MenuItem>
            </Link>
            <MenuItem> My works </MenuItem>
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
  );
}
