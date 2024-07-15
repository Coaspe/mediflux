import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { MOCK, MOCK2 } from "~/constant";
import { QueryDataName, PRecord } from "~/type";
import { isInvalidOpReadiessWithTable } from "../utils";
import dayjs, { Dayjs } from "dayjs";

function useUpdatePRecord(queryDataName: QueryDataName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (precord: PRecord) => {
      return Promise.resolve();
    },
    onMutate: (newPRecord: PRecord) => {
      queryClient.setQueryData([queryDataName], (prevs: any) => {
        let newPRecords: PRecord[] = [];
        prevs?.forEach((prevPRecord: PRecord) => {
          if (prevPRecord.id !== newPRecord.id) {
            newPRecords.push(prevPRecord);
          } else if (!isInvalidOpReadiessWithTable(newPRecord, queryDataName)) {
            newPRecords.push(newPRecord);
          }
        });
        return newPRecords;
      });
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }),
    // Refetch precords after mutation, disabled for demo.
  });
}

function useDeletePRecord(queryDataName: QueryDataName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (precordId: string) => {
      return Promise.resolve();
    },
    onMutate: (id: string) => {
      queryClient.setQueryData([queryDataName], (prevPRecords: any) => prevPRecords?.filter((precord: PRecord) => precord.id !== id));
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }),
    // Refetch precords after mutation, disabled for demo.
  });
}

function useGetPRecords(queryDataName: QueryDataName, startDate?: Dayjs, endDate?: Dayjs) {
  return useQuery<PRecord[]>({
    queryKey: startDate ? [queryDataName, startDate, endDate] : [queryDataName],
    queryFn: async () => {
      let mock: PRecord[] = [];

      if (queryDataName !== "Ready_PRecord") {
        mock = MOCK;
      } else {
        mock = MOCK2;
      }

      if (startDate && endDate) {
        const startDateUnix = dayjs(startDate).startOf("day").unix();
        const endDateUnix = dayjs(endDate).endOf("day").unix();
        mock = mock.filter((record) => record.checkInTime && startDateUnix <= record.checkInTime && record.checkInTime <= endDateUnix);
      }
      mock.sort((a, b) => (a.checkInTime ?? 0) - (b.checkInTime ?? 0));
      return Promise.resolve(mock);
    },
    refetchOnWindowFocus: false,
  });
}

function useCreatePRecord(queryDataName: QueryDataName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (precord: PRecord) => {
      return Promise.resolve();
    },
    // Client side optimistic update
    onMutate: (newPRecordInfo: PRecord) => {
      queryClient.setQueryData([queryDataName], (prevPRecords: any) => {
        return [newPRecordInfo, ...prevPRecords] as PRecord[];
      });
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['precords'] }),
    // Refetch precords after mutation, disabled for demo
  });
}

export { useCreatePRecord, useDeletePRecord, useGetPRecords, useUpdatePRecord };
