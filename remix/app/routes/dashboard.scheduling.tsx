import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { sessionExpireModalOpenState } from "~/recoil_state";
import { checkSessionExists } from "~/services/session.server";
export async function loader({ request }: LoaderFunctionArgs) {
  let idOrRedirect = checkSessionExists(request);
  return idOrRedirect;
}
export default function Scheduling() {
  const setModalOpen = useSetRecoilState(sessionExpireModalOpenState);
  const loadData = useLoaderData();

  return <SchedulingTable />;
}
