import React from "react";
import { Box, ListItem, Typography } from "@mui/material";
import { Treatment } from "~/type";

type VirtualizedListProps = {
  items: Treatment[];
  itemHeight: number;
  containerHeight: number;
};

const VirtualizedList: React.FC<VirtualizedListProps> = ({ items, itemHeight, containerHeight }) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <Box sx={{ height: `${containerHeight}px`, overflowY: "auto", border: "1px solid #ddd" }} onScroll={handleScroll}>
      <Box sx={{ height: `${totalHeight}px`, position: "relative" }}>
        {visibleItems.map((item, index) => (
          <ListItem
            key={startIndex + index}
            sx={{
              position: "absolute",
              top: `${(startIndex + index) * itemHeight}px`,
              height: `${itemHeight}px`,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography>{item.title}</Typography>
          </ListItem>
        ))}
      </Box>
    </Box>
  );
};

export default VirtualizedList;
