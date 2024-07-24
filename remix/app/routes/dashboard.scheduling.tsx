/** @format */

import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { userState } from "~/recoil_state";
import { checkSessionExists } from "~/services/session.server";
import { User } from "~/type";
import { getUserByID } from "~/utils/request.server";
import { redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const uuid = await checkSessionExists(request);
  if (uuid) {
    const user = await getUserByID(uuid);
    return user;
  }
  return redirect("/");
}
export default function Scheduling() {
  const loadData = useLoaderData();
  const setUserState = useSetRecoilState(userState);

  useEffect(() => {
    setUserState(loadData as User);
  }, [loadData]);

  return <SchedulingTable />;
}
