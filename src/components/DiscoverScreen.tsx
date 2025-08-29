"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Stack from "./Stack";
import { FaTimes, FaHeart } from "react-icons/fa";
import { useSearch } from "@/hooks/useSearch";

const mockProfiles = [
  {
    id: 1,
    name: "Anna",
    age: 25,
    bio: "Love traveling and photography 📸✈️",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    interests: ["Travel", "Photography", "Coffee"],
  },
  {
    id: 2,
    name: "Maria",
    age: 28,
    bio: "Yoga instructor and nature lover 🧘‍♀️🌿",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    interests: ["Yoga", "Nature", "Meditation"],
  },
  {
    id: 3,
    name: "Sofia",
    age: 24,
    bio: "Artist and coffee enthusiast ☕🎨",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
    interests: ["Art", "Coffee", "Music"],
  },
];

const DiscoverScreen = () => {
  useTranslation();
  const [seed] = useState(() => Math.random());

  const { results, handleSearch, loading } = useSearch();

  useEffect(() => {
    const fetchData = async () => {
      await handleSearch();
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (results.length === 0) {
    return <div>No results found</div>;
  }
  if (results.length > 0) {
    console.log("results", results);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]   animate-fadeInUp">
      <div className="flex-1 flex w-full   items-center justify-center mb-6 relative overflow-hidden">
        {/* Background half-icons */}
        <div className="pointer-events-none    absolute inset-0 z-0">
          <div className="absolute left-[-80px] top-1/2 -translate-y-1/2 text-rose-500/25 scale-y-150">
            <FaTimes size={280} />
          </div>
          <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 text-red-500/25 scale-y-150">
            <FaHeart size={280} />
          </div>
        </div>
        <div className="w-full max-w-sm h-[34rem] flex items-center justify-center relative z-10">
          <Stack
            key={seed}
            randomRotation
            sensitivity={180}
            sendToBackOnClick
            cardDimensions={{ width: 320, height: 520 }}
            cardsData={mockProfiles.map((p) => ({
              id: p.id,
              img: p.image,
              name: p.name,
              age: p.age,
              bio: p.bio,
              interests: p.interests,
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoverScreen;
