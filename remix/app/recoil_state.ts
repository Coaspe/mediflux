import { atom } from "recoil";
import { User } from "./type";

export const userState = atom<User>({
    key: 'userState', // unique ID (with respect to other atoms/selectors)
    default: undefined, // default value (aka initial value)
});