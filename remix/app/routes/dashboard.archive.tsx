import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import ArchiveChart from "~/components/Archive/Chart";
import { Interval } from "~/type";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ArchiveTable from "~/components/Archive/ArchiveTable";

export default function Archive() {
  const [numOfInterval, setNumOfInterval] = useState<number>(7);
  const [interval, setInterval] = useState<Interval>("week");
  const [baseDate, setBaseDate] = useState<Dayjs>(dayjs());

  const handleIntervalChange = (event: SelectChangeEvent) => {
    setInterval(event.target.value as Interval);
  };
  const handleNumOfIntervalChange = (event: SelectChangeEvent<number>) => {
    setNumOfInterval(Number(event.target.value));
  };
  const haldneBaseDateChange = (value: Dayjs | null) => {
    if (value) {
      setBaseDate(value);
    }
  };
  return (
    <div className="w-full">
      <div className="flex gap-3 pb-5">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Base Date" defaultValue={dayjs()} format="YYYY/MM/DD" onChange={haldneBaseDateChange} />
        </LocalizationProvider>
        <FormControl className="w-30">
          <InputLabel id="interval-select-label">Interval</InputLabel>
          <Select labelId="interval-select-label" id="interval-select" value={interval} label="Interval" onChange={handleIntervalChange}>
            <MenuItem value={"day"}>일(day)</MenuItem>
            <MenuItem value={"week"}>주(week)</MenuItem>
            <MenuItem value={"month"}>월(month)</MenuItem>
            <MenuItem value={"year"}>년(year)</MenuItem>
          </Select>
        </FormControl>
        <FormControl className="w-32">
          <InputLabel id="number-of-interval-select-label">Number Of Interval</InputLabel>
          <Select labelId="number-of-interval-select-label" id="number-of-interval-select" value={numOfInterval} label="Number of Interval" onChange={handleNumOfIntervalChange}>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </FormControl>
      </div>
      <ArchiveChart numOfInterval={numOfInterval} interval={interval} baseDate={baseDate} />
      <ArchiveTable />
    </div>
  );
}
