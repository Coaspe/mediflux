/** @format */

import { useLoaderData } from "@remix-run/react";
import { AgGridReactProps, CustomCellRendererProps } from "ag-grid-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Role } from "shared";
import { TEST_TAG } from "~/constant";
import { CustomAgGridReactProps, Member, Treatment } from "~/types/type";
import { getAllRoleEmployees, getAllTreatments, getRecords } from "~/utils/request";
import { ColDef } from "ag-grid-community";
import { formatNumberWithCommas, getRevenueForPeriod } from "~/utils/utils";
import SearchableGrid from "~/components/Table/SearchableGrid";

export async function loader() {
  const [doctorsResponse, recordsResponse, treatmentsResponse] = await Promise.all([
    getAllRoleEmployees(Role.DOCTOR, TEST_TAG, process.env.SERVER_BASE_URL),
    getRecords([], TEST_TAG, process.env.SERVER_BASE_URL),
    getAllTreatments(TEST_TAG, process.env.SERVER_BASE_URL),
  ]);

  const {
    statusCode: s1,
    body: {
      data: { rows: doctors },
    },
  } = doctorsResponse;
  const {
    statusCode: s2,
    body: {
      data: { rows: records },
    },
  } = recordsResponse;
  const {
    statusCode: s3,
    body: {
      data: { rows: treatmentsData },
    },
  } = treatmentsResponse;

  if (s1 === 200 && s2 === 200 && s3 === 200) {
    const treatments = treatmentsData.reduce((acc: { [key: string]: Treatment }, treatment: Treatment) => {
      acc[treatment.id] = treatment;
      return acc;
    }, {} as { [key: string]: Treatment });

    return { revenue: getRevenueForPeriod(doctors, records, treatments), treatments };
  }
  return null;
}

const Members = () => {
  const loaderData = useLoaderData<typeof loader>();
  const [rowData, setRowData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);
  const gridRef = useRef<CustomAgGridReactProps<Treatment>>(null);

  useEffect(() => {
    if (!loaderData) return;

    const { revenue, treatments } = loaderData;

    const membersData = Object.entries(revenue).map(([id, performedTreatments]) => {
      let member: Member = { id, revenue: 0, numOfTreatments: 0, name: "", performedTreatments };

      Object.entries(performedTreatments).forEach(([tid, value]) => {
        if (typeof value === "number") {
          member.numOfTreatments += value;
          member.revenue += value * (treatments[tid].price || 0);
        } else {
          member.name = value;
          member.searchTitle = value;
        }
      });

      return member;
    });

    membersData.sort((a, b) => b.revenue - a.revenue);
    setRowData(membersData);
    setIsLoading(false);
  }, [loaderData]);

  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      { field: "name", headerName: "이름", width: 100 },
      { field: "numOfTreatments", headerName: "시술 건수", width: 100 },
      { field: "revenue", headerName: "매출", width: 100, cellRenderer: (params: CustomCellRendererProps) => formatNumberWithCommas(params.value) },
    ]);
  }, []);

  const defaultColDef = useMemo<ColDef>(() => ({ editable: false }), []);

  const noRowsOverlayComponent = () => <span>차트가 존재하지 않습니다</span>;

  const rowStyle = {
    fontSize: "0.75rem",
    lineHeight: "1rem",
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
