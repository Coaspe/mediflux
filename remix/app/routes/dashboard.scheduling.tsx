import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SchedulingTable from "~/components/Table/SchedulingTable";

const queryClient = new QueryClient();

export default function Scheduling() {

  return (
    <QueryClientProvider client={queryClient}>
      <SchedulingTable />
    </QueryClientProvider>
  );
}
