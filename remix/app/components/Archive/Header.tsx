/** @format */

import React from "react";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { Interval } from "~/type";
import { styled } from "@mui/material/styles";

type HeaderProps = {
  handleIntervalChange: (event: SelectChangeEvent<Interval>) => void;
  handleNumOfIntervalChange: (event: SelectChangeEvent<number>) => void;
  handleBaseDateChange: (value: Dayjs | null) => void;
  interval: Interval;
  numOfInterval: number;
};

const ArchiveHeader: React.FC<HeaderProps> = ({ handleBaseDateChange, handleIntervalChange, handleNumOfIntervalChange, interval, numOfInterval }) => {
  const commonStyles = {
    height: 40,
    fontSize: 14,
  };
  const DatePickerCustom = styled(DatePicker)({ "& input": { width: 100, height: 7, fontSize: 14 } });
  return (
    <header className="flex gap-3 pb-5">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePickerCustom label="기준일" defaultValue={dayjs()} format="YYYY/MM/DD" onChange={handleBaseDateChange} />
      </LocalizationProvider>
      <FormControl className="w-30">
        <InputLabel id="interval-select-label">인터벌</InputLabel>
        <Select sx={commonStyles} labelId="interval-select-label" id="interval-select" value={interval} label="Interval" onChange={handleIntervalChange}>
          <MenuItem value={"day"}>일(day)</MenuItem>
          <MenuItem value={"week"}>주(week)</MenuItem>
          <MenuItem value={"month"}>월(month)</MenuItem>
          <MenuItem value={"year"}>년(year)</MenuItem>
        </Select>
      </FormControl>
      <FormControl className="w-20">
        <InputLabel id="number-of-interval-select-label">인터벌 수</InputLabel>
        <Select sx={commonStyles} labelId="number-of-interval-select-label" id="number-of-interval-select" value={numOfInterval} label="Number of Interval" onChange={handleNumOfIntervalChange}>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={7}>7</MenuItem>
          <MenuItem value={10}>10</MenuItem>
        </Select>
      </FormControl>
    </header>
  );
};

export default ArchiveHeader;
