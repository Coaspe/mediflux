import React, { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { convertServerTreatmentToClient } from "~/utils/utils";
import { useRecoilState } from "recoil";
import { treatmentSearchHelpState } from "~/recoil_state";
import { getAllTreatments } from "~/utils/request.client";
import { TEST_TAG } from "~/constant";
import { Treatment } from "~/type";
import VirtualizedList from "~/components/VirtualizedList";

const SearchableList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [treatments, setTreatements] = useRecoilState(treatmentSearchHelpState);
  const [filteredRows, setFilteredRows] = useState<Treatment[]>([]);

  useEffect(() => {
    const getTreatments = async () => {
      try {
        const rows = await getAllTreatments(TEST_TAG);
        if (rows.data) {
          const convertedData = rows.data.map((t: any) => convertServerTreatmentToClient(t));
          setTreatements(convertedData);
          setFilteredRows(convertedData);
        }
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };
    getTreatments();
  }, []);

  useEffect(() => {
    setFilteredRows(treatments.filter((treatment) => treatment.title.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, treatments]);

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 4 }}>
      <TextField fullWidth label="Search" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2 }} />
      <VirtualizedList items={filteredRows} itemHeight={50} containerHeight={300} />
    </Box>
  );
};

export default SearchableList;
