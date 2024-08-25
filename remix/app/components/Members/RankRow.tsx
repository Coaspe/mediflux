import Box from "@mui/material/Box";
import React from "react";
import { User } from "~/type";

type RankRowProps = {
  user: User;
  width: string;
};
const RankRow: React.FC<RankRowProps> = ({ user, width }) => {
  return (
    <Box style={{ width }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {user.image ? <img src={user.image} /> : <span className="material-symbols-rounded text-4xl">person</span>}
        {user.name}
      </Box>
    </Box>
  );
};

export default RankRow;
