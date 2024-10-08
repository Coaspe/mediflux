/** @format */

import { useLoaderData } from "@remix-run/react";
import { AgGridReactProps, CustomCellRendererProps } from "ag-grid-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Role } from "shared";
import { ID, NAME, NAME_H, NUM_OF_TREATMENTS, NUM_OF_TREATMENTS_H, REVENUE, REVENUE_H } from "~/constants/constant";
import { CustomAgGridReactProps, Member, Treatment } from "~/types/type";
import { getAllRoleEmployees, getAllTreatments, getRecords } from "~/utils/request";
import { ColDef } from "ag-grid-community";
import { formatNumberWithCommas, getRevenueForPeriod } from "~/utils/utils";
import SearchableGrid from "~/components/Table/SearchableGrid";
import { getSession } from "~/services/session.server";

export async function loader({ request }: { request: Request }) {
  const clinic = (await getSession(request)).get("clinic");

  if (!clinic) {
    return null;
  }

  const [doctorsResponse, recordsResponse, treatmentsResponse] = await Promise.all([
    getAllRoleEmployees(Role.DOCTOR, clinic, process.env.SERVER_BASE_URL),
    getRecords([], clinic, process.env.SERVER_BASE_URL),
    getAllTreatments(clinic, process.env.SERVER_BASE_URL),
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
      { field: ID, headerName: ID, hide: true },
      { field: NAME, headerName: NAME_H, width: 100 },
      { field: NUM_OF_TREATMENTS, headerName: NUM_OF_TREATMENTS_H, width: 100 },
      { field: REVENUE, headerName: REVENUE_H, width: 100, cellRenderer: (params: CustomCellRendererProps) => formatNumberWithCommas(params.value) },
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
