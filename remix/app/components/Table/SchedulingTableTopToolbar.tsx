import { Button } from "@mui/material"
import dayjs from "dayjs"
import { MRT_TableInstance } from "material-react-table"
import { FC, MutableRefObject } from "react"
import { MOCK, MOCK2 } from "~/constant"
import { PRecord } from "~/type"

interface Props {
    table: MRT_TableInstance<PRecord>,
    originalPRecord: MutableRefObject<PRecord | undefined>,
}

function getMaxId(): string {
    let mocks = [...MOCK, ...MOCK2]
    let maxValue = mocks.reduce((maxId, record) => parseInt(record.id, 10) > parseInt(maxId, 10) ? record.id : maxId, mocks[0].id);
    return (parseInt(maxValue, 10) + 1).toString()
}

const SchedulingTableTopToolbar: FC<Props> = ({ table, originalPRecord }) => {
    return <Button
        variant="contained"
        className="bg-button"
        onClick={() => {
            originalPRecord.current = { id: getMaxId(), checkInTime: dayjs().unix() } as PRecord
            table.setCreatingRow(true)
        }}
    >
        레코드 추가
    </Button>
}

export default SchedulingTableTopToolbar