import Box from "@mui/material/Box";
import React from "react";
import { User } from "~/type";

type RankRowProps = {
  rank: number;
  user: User;
  width: string;
  height: string;
};
const RankRow: React.FC<RankRowProps> = ({ rank, user, width, height }) => {
  return (
    <Box className="border border-black" sx={{ padding: "0px 10px", width, maxWidth: "1300px", height, display: "flex", alignItems: "center" }}>
      <p className="text-gray-400 font-work text-3xl w-5 text-center">{rank}</p>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Box sx={{ height: "100%", position: "absolute", display: "flex", alignItems: "center", gap: "5px" }}>
          <span className="material-symbols-rounded text-4xl">person</span>
          {user.name}
        </Box>
      </Box>
    </Box>
  );
};

export default RankRow;
