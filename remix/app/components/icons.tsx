/** @format */

import React from "react";

export const ICONS = {
  EVENT_NOTE: "event_note",
  CLOSE: "close",
  DASHBOARD: "team_dashboard",
  NOTIFICATION: "notifications",
};

type ICON = (typeof ICONS)[keyof typeof ICONS];

type props = {
  iconName: ICON;
  onClick?: () => void;
  className?: string;
};
const Icon: React.FC<props> = ({ iconName, onClick, className }) => {
  return (
    <button type="submit">
      <span onClick={onClick} className={`material-symbols-outlined ${className}`}>
        {iconName}
      </span>
    </button>
  );
};

export default Icon;
