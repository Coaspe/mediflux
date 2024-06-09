import { EMPTY_SEARCHHELP, ROLE, SIDE_MENU } from "~/constant";
import { Role, SearchHelp, SideMenu } from "~/type";

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

export function getRoleName(role: Role): string {
    switch (role) {
        case ROLE.DOCTOR:
            return "Doctor"
        case ROLE.NURSE:
            return "Nurse"
        default:
            return "Staff"
    }
}

export const getValueWithId = (searchHelp: SearchHelp[], id?: string): SearchHelp => {
    for (let i = 0; i < searchHelp.length; i++) {
        const element = searchHelp[i];
        if (element.id === id) {
            return searchHelp[i]
        }
    }
    return EMPTY_SEARCHHELP
}