import { atom } from "recoil";
import { GlobalSnackBark, SearchHelp, Treatment, User } from "./types/type";

export const userState = atom<User | undefined>({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
});

export const sessionExpireModalOpenState = atom<boolean>({
  key: "sessionExpireModalOpenState",
  default: false,
});

export const globalSnackbarState = atom<GlobalSnackBark>({
  key: "globalSnackbarState",
  default: { open: false, msg: "", severity: "success" },
});

export const treatmentSearchHelpState = atom<Treatment[]>({
  key: "treatmentSearchHelp",
  default: [],
});

export const doctorSearchHelpState = atom<SearchHelp[]>({
  key: "doctorSearchHelp",
  default: [],
});
