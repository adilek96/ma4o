"use client";
import { useTranslation } from "react-i18next";
import Dock from "./Dock";
import { FaHeart } from "react-icons/fa6";
import { FaUsersViewfinder } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa";

const BottomNavigation = () => {
  const items = [
    {
      icon: <FaUsersViewfinder size={18} />,
      label: "Home",
      onClick: () => alert("Home!"),
    },
    {
      icon: <FaHeart size={18} />,
      label: "Archive",
      onClick: () => alert("Archive!"),
    },
    {
      icon: <FaUserAlt size={18} />,
      label: "Profile",
      onClick: () => alert("Profile!"),
    },
  ];

  return (
    <Dock items={items} panelHeight={68} baseItemSize={50} magnification={70} />
  );
};

export default BottomNavigation;
