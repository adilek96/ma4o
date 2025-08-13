"use client";

import { useState } from "react";

// import ProfileCard from "./ProfileCard";
import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";

const mockProfiles = [
  {
    id: 1,
    name: "Anna",
    age: 25,
    bio: "Love traveling and photography 📸✈️",
    image: "/placeholder.svg?height=600&width=400",
    interests: ["Travel", "Photography", "Coffee"],
  },
  {
    id: 2,
    name: "Maria",
    age: 28,
    bio: "Yoga instructor and nature lover 🧘‍♀️🌿",
    image: "/placeholder.svg?height=600&width=400",
    interests: ["Yoga", "Nature", "Meditation"],
  },
  {
    id: 3,
    name: "Sofia",
    age: 24,
    bio: "Artist and coffee enthusiast ☕🎨",
    image: "/placeholder.svg?height=600&width=400",
    interests: ["Art", "Coffee", "Music"],
  },
];

const DiscoverScreen = () => {
  useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAction = (action: "like" | "pass" | "superlike") => {
    console.log(`${action} on profile ${mockProfiles[currentIndex]?.name}`);
    setCurrentIndex((prev) => (prev + 1) % mockProfiles.length);
  };

  const currentProfile = mockProfiles[currentIndex];

  if (!currentProfile) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] p-4 animate-fadeInUp">
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="animate-scaleIn">
          {/* <ProfileCard profile={currentProfile} /> */}
        </div>
      </div>

      <div className="flex justify-center items-center gap-6 pb-4 animate-slideInLeft">
        <Button
          onClick={() => handleAction("pass")}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/20 transition-all duration-300 btn-bounce glass-effect group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
            ✕
          </span>
        </Button>

        <Button
          onClick={() => handleAction("superlike")}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 transition-all duration-300 btn-bounce glass-effect group animate-pulse-custom"
        >
          <span className="text-xl group-hover:scale-125 transition-transform duration-200 animate-float">
            ⭐
          </span>
        </Button>

        <Button
          onClick={() => handleAction("like")}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950/20 transition-all duration-300 btn-bounce glass-effect group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform duration-200 text-red-500">
            ♥
          </span>
        </Button>
      </div>
    </div>
  );
};

export default DiscoverScreen;
