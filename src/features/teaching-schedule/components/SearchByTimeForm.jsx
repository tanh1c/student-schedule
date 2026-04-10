import React from "react";
import TimeFilterPanelDesktop from "./TimeFilterPanelDesktop";
import TimeFilterPanelMobile from "./TimeFilterPanelMobile";
import TimeFilterSummaryCard from "./TimeFilterSummaryCard";
import { dayNames } from "../constants/searchConfig";

export default function SearchByTimeForm(props) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <TimeFilterPanelMobile {...props} />
      <TimeFilterSummaryCard {...props} dayNames={dayNames} />
      <TimeFilterPanelDesktop {...props} />
    </div>
  );
}
