import { MRT_ColumnDef, MRT_Row } from "material-react-table"
import { TREATEMENTS } from "shared"
import { checkInTimeCell, checkInTimeEdit, opReadinessCell, treatmentEdit, StaffEdit, nameChipCell } from "~/components/Table/ColumnRenderers"
import { DOCTORS, CHECK_IN_TIME, CHECK_IN_TIME_H, LONG_COLUMN_LENGTH, CHART_NUMBER, CHART_NUMBER_H, PATIENT_NAME, PATIENT_NAME_H, OP_READINESS, OP_READINESS_H, SHORT_COLUMN_LENGTH, TREATMENT1, TREATMENT1_H, QUANTITYTREAT1, QUANTITYTREAT1_H, TREATMENT_ROOM, TREATMENT_ROOM_H, MEDIUM_COLUMN_LENGTH, DOCTOR, DOCTOR_H, ANESTHESIANOTE, ANESTHESIANOTE_H, SKINCARESPECIALIST1, SKINCARESPECIALIST1_H, SKINCARESPECIALIST2, SKINCARESPECIALIST2_H, NURSINGSTAFF1, NURSINGSTAFF1_H, NURSINGSTAFF2, NURSINGSTAFF2_H, COORDINATOR, COORDINATOR_H, CONSULTANT, CONSULTANT_H, COMMENTCAUTION, COMMENTCAUTION_H } from "~/constant"
import { SearchHelp, PRecord } from "~/type"
import { getValueWithId } from "../utils"
import { MutableRefObject } from "react"

export const staffFilterFn = (id: unknown, filterValue: any, searchHelp: SearchHelp[]) => {
    const record = DOCTORS.find(ele => ele.id === id)
    const title = record?.title
    return title ? title.includes(filterValue) : false
}
export const checkinTimeColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        // id: 'date',
        // filterVariant: 'datetime',
        // filterFn: 'lessThan',
        accessorKey: CHECK_IN_TIME,
        header: CHECK_IN_TIME_H,
        sortingFn: 'datetime',
        Cell: checkInTimeCell,
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => checkInTimeEdit(row, originalPRecord),
        size: LONG_COLUMN_LENGTH, //medium column
    }
}
export const chartNumberColumn: MRT_ColumnDef<PRecord> = {
    accessorKey: CHART_NUMBER,
    header: CHART_NUMBER_H,
    size: LONG_COLUMN_LENGTH, //medium column
}
export const patientNameColumn: MRT_ColumnDef<PRecord> = {
    accessorKey: PATIENT_NAME,
    header: PATIENT_NAME_H,
}
export const opReadinessColumn: MRT_ColumnDef<PRecord> = {
    accessorKey: OP_READINESS,
    header: OP_READINESS_H,
    editVariant: 'select',
    editSelectOptions: [{ label: '완료', value: true }, { label: '미완료', value: false }],
    Cell: opReadinessCell,
    size: SHORT_COLUMN_LENGTH, // medium column
}
export const treatment1Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorFn: (row) => getValueWithId(TREATEMENTS, row.treatment1).title,
        accessorKey: TREATMENT1,
        header: TREATMENT1_H,
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => treatmentEdit(row, originalPRecord),
    }
}
export const quantitytreat1Column: MRT_ColumnDef<PRecord> = {
    accessorKey: QUANTITYTREAT1,
    header: QUANTITYTREAT1_H,
    size: SHORT_COLUMN_LENGTH, //medium column
}
export const treatmentRoomColumn: MRT_ColumnDef<PRecord> = {
    accessorKey: TREATMENT_ROOM,
    header: TREATMENT_ROOM_H,
    size: MEDIUM_COLUMN_LENGTH, //medium column
}
export const doctorColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: DOCTOR,
        header: DOCTOR_H,
        size: SHORT_COLUMN_LENGTH, //medium column
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, DOCTOR, DOCTOR_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS)
    }
}
export const anesthesiaNoteColumn: MRT_ColumnDef<PRecord> = {
    accessorKey: ANESTHESIANOTE,
    header: ANESTHESIANOTE_H
}
export const skincareSpecialist1Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: SKINCARESPECIALIST1,
        header: SKINCARESPECIALIST1_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, SKINCARESPECIALIST1, SKINCARESPECIALIST1_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH, //medium column
    }
}
export const skincareSpecialist2Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: SKINCARESPECIALIST2,
        header: SKINCARESPECIALIST2_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, SKINCARESPECIALIST2, SKINCARESPECIALIST2_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH,
    }
}
export const nursingStaff1Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: NURSINGSTAFF1,
        header: NURSINGSTAFF1_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, NURSINGSTAFF1, NURSINGSTAFF1_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH,
    }
}
export const nursingStaff2Column = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: NURSINGSTAFF2,
        header: NURSINGSTAFF2_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, NURSINGSTAFF2, NURSINGSTAFF2_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: MEDIUM_COLUMN_LENGTH,
    }
}
export const coordinatorColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: COORDINATOR,
        header: COORDINATOR_H,
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, COORDINATOR, COORDINATOR_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: SHORT_COLUMN_LENGTH,
    }
}
export const consultantColumn = (originalPRecord: MutableRefObject<PRecord | undefined>): MRT_ColumnDef<PRecord> => {
    return {
        accessorKey: CONSULTANT,
        header: CONSULTANT_H,
        filterFn: (row, id, filterValue) => staffFilterFn(row.getValue(id), filterValue, DOCTORS),
        Edit: ({ row }: { row: MRT_Row<PRecord> }) => StaffEdit(row, originalPRecord, DOCTORS, CONSULTANT, CONSULTANT_H),
        Cell: ({ cell, column }) => nameChipCell(cell, column, DOCTORS),
        size: SHORT_COLUMN_LENGTH,
    }
}
export const commentCautionColumn = {
    accessorKey: COMMENTCAUTION,
    header: COMMENTCAUTION_H
}