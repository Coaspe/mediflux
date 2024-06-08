import { Button } from "@mui/material"
import { MRT_TableInstance } from "material-react-table"
import { FC } from "react"
import { PRecord } from "~/type"
interface Props {
    table: MRT_TableInstance<PRecord>
}
const SchedulingTableTopToolbar: FC<Props> = ({ table }) => {
    return <Button
        variant="contained"
        className="bg-button"
        onClick={() => table.setCreatingRow(true)}
    >
        레코드 추가
    </Button>
}

export default SchedulingTableTopToolbar