import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MOCK } from "~/constant";
import React from "react";
import { Interval } from "~/type";

type ChartData = {
  name: string;
  numOfPRecords: number;
};

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

type props = {
  numOfInterval: number;
  interval: Interval;
  baseDate: Dayjs;
};

const ArchiveChart: React.FC<props> = ({ numOfInterval, interval, baseDate }) => {
  const [chartData, setChartData] = useState<ChartData[]>();

  const calIntervalAndSetChartData = (interval: Interval, numOfInterval: number): void => {
    let mapping: { [key: number]: ChartData } = {};
    let date = dayjs(baseDate).startOf(interval).unix();

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
    setChartData(en);
  };

  useEffect(() => {
    calIntervalAndSetChartData(interval, numOfInterval);
  }, [interval, numOfInterval, baseDate]);

  return (
    <div className="w-full h-1/3">
      {chartData && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
            <Line name="Number of records" type="monotone" dataKey="numOfPRecords" stroke="#8884d8" activeDot={{ r: 8 }} />
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ArchiveChart;
