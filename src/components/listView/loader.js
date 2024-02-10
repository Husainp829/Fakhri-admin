import React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { styled } from "@mui/material";

const Placeholder = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  height: "100px",
}));

const getColsForWidth = (width) => {
  if (width === "xs") return 2;
  if (width === "sm") return 3;
  if (width === "md") return 4;
  if (width === "lg") return 5;
  return 5;
};

export default () => (
  <ImageList cols={getColsForWidth(4)} sx={{ margin: 0 }}>
    <ImageListItem>
      <Placeholder />
    </ImageListItem>
  </ImageList>
);
