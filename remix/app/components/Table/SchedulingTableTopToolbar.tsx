import { Button } from "@mui/material"
import dayjs from "dayjs"
import { MRT_TableInstance } from "material-react-table"
import { FC, MutableRefObject } from "react"
import { MOCK, MOCK2, OP_READINESS } from "~/constant"
import { PRecord, TableType } from "~/type"

interface Props {
    table: MRT_TableInstance<PRecord>,
    originalPRecord: MutableRefObject<PRecord | undefined>,
    tableType: TableType
}

function getMaxId(): string {
    let mocks = [...MOCK, ...MOCK2]
    let maxValue = mocks.reduce((maxId, record) => parseInt(record.id, 10) > parseInt(maxId, 10) ? record.id : maxId, mocks[0].id);
    return (parseInt(maxValue, 10) + 1).toString()
}

const SchedulingTableTopToolbar: FC<Props> = ({ table, originalPRecord, tableType }) => {
    return <Button
        variant="contained"
        className="bg-button"
        onClick={() => {
            // table.getColumn(OP_READINESS).columnDef.editSelectOptions = tableType === 'Ready' ? [{ label: '준비 완료', value: 'Y' }] : [{ label: '준비 미완료', value: 'N' }, { label: '시술 완료', value: 'C' }, { label: "시술 중", value: 'P' }]
            table.getColumn(OP_READINESS).columnDef.editSelectOptions = []
            originalPRecord.current = { id: getMaxId(), checkInTime: dayjs().unix() } as PRecord
            table.setCreatingRow(true)
        }}
    >
        레코드 추가
    </Button>
}

export default SchedulingTableTopToolbar