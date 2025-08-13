"use client";

import Dock from "./Dock";
import { FaHeart } from "react-icons/fa6";
import { FaUsersViewfinder } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa";

type Screen = "discover" | "matches" | "profile";

interface BottomNavigationProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNavigation = ({ active, onNavigate }: BottomNavigationProps) => {
  const items = [
    {
      icon: <FaUsersViewfinder size={18} />,
      label: "Discover",
      onClick: () => onNavigate("discover"),
      className: active === "discover" ? "border-white bg-white/10" : undefined,
    },
    {
      icon: <FaHeart size={18} />,
      label: "Matches",
      onClick: () => onNavigate("matches"),
      className: active === "matches" ? "border-white bg-white/10" : undefined,
    },
    {
      icon: <FaUserAlt size={18} />,
      label: "Profile",
      onClick: () => onNavigate("profile"),
      className: active === "profile" ? "border-white bg-white/10" : undefined,
    },
  ];

  return (
    <Dock items={items} panelHeight={68} baseItemSize={50} magnification={70} />
  );
};

export default BottomNavigation;
