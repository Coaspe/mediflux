import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MOCK } from "~/constant";
import { Dropdown } from "@mui/base/Dropdown";
import { Menu, MenuListboxSlotProps } from "@mui/base/Menu";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";
import { MenuItem as BaseMenuItem, menuItemClasses } from "@mui/base/MenuItem";
import { styled } from "@mui/system";
import { CssTransition } from "@mui/base/Transitions";
import { PopupContext } from "@mui/base/Unstable_Popup";
import React from "react";

type ChartData = {
  name: string;
  numOfPRecords: number;
};

type Interval = "day" | "week" | "month" | "year";
function formatDateString(date: number, format: Interval) {
  date *= 1000;
  switch (format) {
    case "day":
      return dayjs(date).format("YYYY-MM-DD");
    case "week":
      return dayjs(date).format("YYYY-MM-DD");
    case "month":
      return dayjs(date).format("YYYY-MM");
    case "year":
      return dayjs(date).format("YYYY");
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
export default function Archive() {
  const [chartData, setChartData] = useState<ChartData[]>();
  const [interval, setInterval] = useState<Interval>("week");
  const [numOfInterval, setNumOfInterval] = useState<number>(7);
  const [startDate, setStartDate] = useState(dayjs().unix());

  const calIntervalAndSetChartData = (interval: Interval, numOfInterval: number): void => {
    let mapping: { [key: number]: ChartData } = {};
    let date = dayjs().startOf(interval).unix();

    for (let i = 0; i < numOfInterval; i++) {
      mapping[date] = {
        name: formatDateString(date, interval),
        numOfPRecords: 0,
      };
      date = dayjs(date * 1000)
        .add(1, interval)
        .unix();
    }

    MOCK.forEach((record) => {
      if (record.checkInTime !== undefined) {
        const start = dayjs(record.checkInTime * 1000)
          .startOf(interval)
          .unix();
        if (start in mapping) {
          mapping[start].numOfPRecords += 1;
        }
      }
    });

    const entries = Object.entries(mapping);
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const en = entries.map((entry) => entry[1]);
    for (let i = 0; i < numOfInterval; i++) {
      en[i].numOfPRecords = Math.floor(Math.random() * 100);
    }
    setChartData(en);
  };

  useEffect(() => {
    calIntervalAndSetChartData(interval, numOfInterval);
  }, [interval, numOfInterval]);

  return (
    <div className="w-full h-full gap-2 flex flex-col">
      <div className="flex gap-3">
        <Dropdown>
          <MenuButton>My account</MenuButton>
          <Menu slots={{ listbox: AnimatedListbox }}>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Language settings</MenuItem>
            <MenuItem>Log out</MenuItem>
          </Menu>
        </Dropdown>

        <Dropdown>
          <MenuButton>My account</MenuButton>
          <Menu slots={{ listbox: AnimatedListbox }}>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Language settings</MenuItem>
            <MenuItem>Log out</MenuItem>
          </Menu>
        </Dropdown>
      </div>
      {chartData && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis dataKey="numOfPRecords" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="numOfPRecords" stroke="#8884d8" activeDot={{ r: 8 }} />
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const blue = {
  50: "#F0F7FF",
  100: "#C2E0FF",
  200: "#99CCF3",
  300: "#66B2FF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E6",
  700: "#0059B3",
  800: "#004C99",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Listbox = styled("ul")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  box-shadow: 0px 4px 30px ${theme.palette.mode === "dark" ? grey[900] : grey[200]};
  z-index: 1;

  .closed & {
    opacity: 0;
    transform: scale(0.95, 0.8);
    transition: opacity 200ms ease-in, transform 200ms ease-in;
  }
  
  .open & {
    opacity: 1;
    transform: scale(1, 1);
    transition: opacity 100ms ease-out, transform 100ms cubic-bezier(0.43, 0.29, 0.37, 1.48);
  }

  .placement-top & {
    transform-origin: bottom;
  }

  .placement-bottom & {
    transform-origin: top;
  }
  `
);

const AnimatedListbox = React.forwardRef(function AnimatedListbox(props: MenuListboxSlotProps, ref: React.ForwardedRef<HTMLUListElement>) {
  const { ownerState, ...other } = props;
  const popupContext = React.useContext(PopupContext);

  if (popupContext == null) {
    throw new Error("The `AnimatedListbox` component cannot be rendered outside a `Popup` component");
  }

  const verticalPlacement = popupContext.placement.split("-")[0];

  return (
    <CssTransition className={`placement-${verticalPlacement}`} enterClassName="open" exitClassName="closed">
      <Listbox {...other} ref={ref} />
    </CssTransition>
  );
});

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &.${menuItemClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === "dark" ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === "dark" ? grey[700] : grey[400]};
  }

  &:hover:not(.${menuItemClasses.disabled}) {
    background-color: ${theme.palette.mode === "dark" ? blue[900] : blue[50]};
    color: ${theme.palette.mode === "dark" ? blue[100] : blue[900]};
  }
  `
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &:hover {
    background: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
  }

  &:active {
    background: ${theme.palette.mode === "dark" ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === "dark" ? blue[300] : blue[200]};
    outline: none;
  }
  `
);
