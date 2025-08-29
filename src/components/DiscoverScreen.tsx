"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Stack from "./Stack";
import { FaTimes, FaHeart } from "react-icons/fa";
import { useSearch } from "@/hooks/useSearch";

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

  // if (results.length > 0) {
  //   console.log("results", results);
  // }

  if (loading) {
    return (
      <div className="flex h-[100vh] w-full justify-center items-center text-center text-2xl font-bold">
        Loading...
      </div>
    );
  }

  if (!results || results === null) {
    return (
      <div className="flex h-[100vh] w-full justify-center items-center text-center text-2xl font-bold">
        No results found
      </div>
    );
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
            cardsData={results.map((p: any) => ({
              id: p.id,
              img: p.photo,
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
