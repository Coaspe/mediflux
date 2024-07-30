/** @format */

import React from "react";

export const ICONS = {
  EVENT_NOTE: "event_note",
  CLOSE: "close",
  DASHBOARD: "team_dashboard",
  NOTIFICATION: "notifications",
};

type ICON = (typeof ICONS)[keyof typeof ICONS];

type IconProps = {
  iconName: ICON;
  onClick?: () => void;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ iconName, onClick, className }) => {
  return (
    <span onClick={onClick} className={`material-symbols-outlined ${className}`}>
      {iconName}
    </span>
  );
};

export default Icon;
