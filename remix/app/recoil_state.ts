/** @format */

import { atom } from "recoil";
import { ChipColor, User } from "./type";

export const userState = atom<User | undefined>({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
});

export const sessionExpireModalOpenState = atom<boolean>({
  key: "sessionExpireModalOpenState",
  default: false,
});

export const globalSnackbarState = atom<{ open: boolean; msg: string; severity: "error" | "info" | "success" | "warning" }>({
  key: "glbaoSnackbarState",
  default: { open: false, msg: "", severity: "success" },
});
