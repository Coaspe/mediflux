/** @format */

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const dayjsKST = (date?: dayjs.ConfigType) => {
  return dayjs(date).tz("Asia/Seoul");
};

export default dayjsKST;
