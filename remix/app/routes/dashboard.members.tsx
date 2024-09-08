import { useLoaderData } from "@remix-run/react";
import { AgGridReactProps } from "ag-grid-react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ROLE } from "shared";
import { TEST_TAG, TREATMENT_NAME_COLUMN } from "~/constant";
import { globalSnackbarState, userState } from "~/recoil_state";
import { CustomAgGridReactProps, Member, Treatment } from "~/type";
import { getAllRoleEmployees, getAllTreatments } from "~/utils/request";
import { getRecords, getRevenueForPeriod } from "~/utils/request.server";
import { ColDef } from "ag-grid-community";
import { convertServerTreatmentToClient } from "~/utils/utils";
import SearchableGrid from "~/components/Table/SearchableGrid";

export async function loader() {
  const { data: doctors } = await getAllRoleEmployees(ROLE.DOCTOR, TEST_TAG);
  const {
    data: { rows: records },
  } = await getRecords([], TEST_TAG);
  const { data: t } = await getAllTreatments(TEST_TAG);
  const treatments: { [key: string]: Treatment } = {};
  t.forEach((treatment: any) => {
    treatments[treatment.tr_id] = convertServerTreatmentToClient(treatment);
  });
  return { revenue: getRevenueForPeriod(doctors, records, treatments), treatments };
}

const Members = () => {
  const loaderData = useLoaderData<typeof loader>();
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);

  useEffect(() => {
    const { revenue, treatments }: { revenue: { [key: string]: { [key: string]: number | string } }; treatments: { [key: string]: Treatment } } = loaderData;
    const getTreatments = async () => {
      try {
        setIsLoading(true);
        const data = [];

        for (const [id, performedTreatments] of Object.entries(revenue)) {
          let member = { id, revenue: 0, numOfTreatments: 0, name: performedTreatments["name"], performedTreatments } as Member;
          Object.entries(performedTreatments || {}).forEach(([tid, v], i) => {
            if (typeof v === "number") {
              member.numOfTreatments += v;
              member.revenue += v * (treatments[tid].price || 0);
            } else {
              member.name = v;
              member.searchTitle = v;
            }
          });
          data.push(member);
        }

        data.sort((a, b) => b.revenue - a.revenue);
        setRowData(data);
      } catch (error) {
        setGlobalSnackBar({ msg: "Internal server error", severity: "error", open: true });
        console.error("Error fetching treatments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getTreatments();
  }, [loaderData]);

  // Columns definition
  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      { field: "name", headerName: "이름", width: TREATMENT_NAME_COLUMN },
      { field: "numOfTreatments", headerName: "시술 건수", width: TREATMENT_NAME_COLUMN },
      { field: "revenue", headerName: "매출", width: TREATMENT_NAME_COLUMN },
    ]);
  }, []);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: false,
    };
  }, []);

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  const rowStyle = {
    fontSize: "0.75rem" /* 12px */,
    lineheight: "1rem" /* 16px */,
  };
  const agGridProps: AgGridReactProps = {
    defaultColDef,
    columnDefs: colDefs,
    pagination: true,
    paginationPageSize: 20,
    rowSelection: "multiple",
    rowStyle,
    loading: isLoading,
    noRowsOverlayComponent,
  };
  return <SearchableGrid originalData={rowData} gridProps={agGridProps} addButton={false} />;
};

export default Members;
