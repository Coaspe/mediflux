import { ROLE, SIDE_MENU } from "~/constant";
import { Role, SideMenu } from "~/type";

export function getMenuName(menu: SideMenu | undefined): string {
    switch (menu) {
        case SIDE_MENU.SCHEDULING:
            return 'Scheduling';
        case SIDE_MENU.MYWORKS:
            return 'My works';
        default:
            return ""
    }
}

export function getRoleName(role: Role) {
    switch (role) {
        case ROLE.DOCTOR:
            return "Doctor"
        case ROLE.NURSE:
            return "Nurse"
        default:
            return "Staff"
    }
}