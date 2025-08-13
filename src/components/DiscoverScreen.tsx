"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Stack from "./Stack";
import { Button } from "../components/ui/button";
import { FaTimes, FaHeart } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

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
  const [seed] = useState(() => Math.random());

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] p-4 animate-fadeInUp">
      <div className="flex-1 flex items-center justify-center mb-6 relative">
        <div className="w-full max-w-md h-96 flex items-center justify-center">
          <Stack
            key={seed}
            randomRotation
            sensitivity={180}
            sendToBackOnClick
            cardDimensions={{ width: 360, height: 420 }}
            cardsData={mockProfiles.map((p) => ({
              id: p.id,
              img: p.image,
              name: p.name,
              age: p.age,
              bio: p.bio,
            }))}
          />
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 pb-3 component-bg rounded-2xl p-3 border border-border shadow-md max-w-sm mx-auto">
        <Button
          onClick={() => {}}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/20 transition-all duration-300 btn-bounce group"
        >
          <span className="text-2xl text-foreground group-hover:scale-125 transition-transform duration-200">
            <FaTimes />
          </span>
        </Button>
        <Button
          onClick={() => {}}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950/20 transition-all duration-300 btn-bounce group"
        >
          <span className="text-2xl text-red-500 group-hover:scale-125 transition-transform duration-200">
            <FaHeart />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default DiscoverScreen;
