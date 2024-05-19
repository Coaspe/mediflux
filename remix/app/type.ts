import { ROLE, SIDE_MENU } from "~/constant";

export type SideMenu = typeof SIDE_MENU[keyof typeof SIDE_MENU];
export type Role = typeof ROLE[keyof typeof ROLE]
export type User = {
    id: number
    name: string
    image: string
    role: Role
}