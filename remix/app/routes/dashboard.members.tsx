/** @format */

import { useLoaderData } from "@remix-run/react";
import { AgGridReactProps } from "ag-grid-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { ROLE } from "shared";
import { SERVER_URL, TEST_TAG } from "~/constant";
import { globalSnackbarState } from "~/recoil_state";
import { CustomAgGridReactProps, Member, Treatment } from "~/type";
import { getAllRoleEmployees, getAllTreatments, getRecords } from "~/utils/request";
import { ColDef } from "ag-grid-community";
import { convertServerTreatmentToClient, getRevenueForPeriod } from "~/utils/utils";
import SearchableGrid from "~/components/Table/SearchableGrid";

export async function loader() {
  const {
    statusCode: s1,
    body: {
      data: { rows: doctors },
    },
  } = await getAllRoleEmployees(ROLE.DOCTOR, TEST_TAG, SERVER_URL);
  const {
    statusCode: s2,
    body: {
      data: { rows: records },
    },
  } = await getRecords([], TEST_TAG, SERVER_URL);
  const {
    statusCode: s3,
    body: {
      data: { rows: t },
    },
  } = await getAllTreatments(TEST_TAG, SERVER_URL);

  if (s1 === 200 && s2 === 200 && s3 === 200) {
    const treatments: { [key: string]: Treatment } = {};
    t.forEach((treatment: any) => {
      treatments[treatment.tr_id] = convertServerTreatmentToClient(treatment);
    });
    return { revenue: getRevenueForPeriod(doctors, records, treatments), treatments };
  }
  return null;
}

const Members = () => {
  const loaderData = useLoaderData<typeof loader>();
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);
  const gridRef = useRef<CustomAgGridReactProps<Treatment>>(null);

  useEffect(() => {
    if (!loaderData) return;
    const { revenue, treatments }: { revenue: { [key: string]: { [key: string]: number | string } }; treatments: { [key: string]: Treatment } } = loaderData;
    const setMembersRevenue = () => {
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

      setIsLoading(false);
    };
    setMembersRevenue();
  }, [loaderData]);

  // Columns definition
  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      { field: "name", headerName: "이름", width: 100 },
      { field: "numOfTreatments", headerName: "시술 건수", width: 100 },
      { field: "revenue", headerName: "매출", width: 100 },
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
  return <SearchableGrid gridRef={gridRef} originalData={rowData} gridProps={agGridProps} addButton={false} />;
};

export default Members;
