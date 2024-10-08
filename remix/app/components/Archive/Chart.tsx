/** @format */

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import React from "react";
import { ChartData, Interval } from "~/types/type";
import dayjs, { Dayjs } from "dayjs";
import { PRecord } from "shared";

type ArchiveChartProps = {
  numOfInterval: number;
  interval: Interval;
  baseDate: Dayjs;
  data: PRecord[];
};

const ArchiveChart: React.FC<ArchiveChartProps> = ({ numOfInterval, interval, baseDate, data }) => {
  const [chartData, setChartData] = useState<ChartData[]>();

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
  const calIntervalAndSetChartData = (interval: Interval, numOfInterval: number): void => {
    let mapping: { [key: number]: ChartData } = {};
    let date = dayjs(baseDate).startOf(interval).unix();

    for (let i = 0; i < numOfInterval; i++) {
      mapping[date] = {
        name: formatDateString(date, interval),
        numOfPRecords: 0,
      };
      date = dayjs(date * 1000)
        .subtract(1, interval)
        .unix();
    }

    data.forEach((record) => {
      if (record.createdAt !== undefined) {
        const start = dayjs(record.createdAt).startOf(interval).unix();

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
    if (data) {
      calIntervalAndSetChartData(interval, numOfInterval);
    }
  }, [interval, numOfInterval, baseDate, data]);

  return (
    <>
      {chartData && (
        <ResponsiveContainer width="100%" height="45%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
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
    </>
  );
};

export default ArchiveChart;
