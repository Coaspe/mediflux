import { atom } from "recoil";
import { PRecord, User } from "./type";
import { MRT_TableInstance } from "material-react-table";

export const userState = atom<User>({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
});

export const readyTableState = atom<MRT_TableInstance<PRecord>>({
  key: "readyTableState",
  default: undefined,
});
