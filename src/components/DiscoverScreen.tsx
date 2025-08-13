"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";

// import ProfileCard from "./ProfileCard";
import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAction = (_action: "like" | "pass" | "superlike") => {
    setCurrentIndex((prev) => (prev + 1) % mockProfiles.length);
  };

  const profilesCount = mockProfiles.length;
  const currentProfile = mockProfiles[currentIndex];
  // const nextProfile = mockProfiles[(currentIndex + 1) % profilesCount];

  // Motion values for swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -40], [1, 0]);

  const onDragEnd = (
    _: any,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;
    const threshold = 140;
    if (offsetX > threshold || velocityX > 800) {
      // like
      handleAction("like");
      x.set(0);
      return;
    }
    if (offsetX < -threshold || velocityX < -800) {
      // pass
      handleAction("pass");
      x.set(0);
      return;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] p-4 animate-fadeInUp">
      <div className="flex-1 flex items-center justify-center mb-6 relative">
        {/* progress */}
        <div className="absolute -top-2 left-0 right-0 h-1 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full bg-foreground/40"
            style={{ width: `${((currentIndex + 1) / profilesCount) * 100}%` }}
          />
        </div>
        {/* next card */}
        <div className="absolute w-full max-w-sm h-72 scale-95 blur-[1px] opacity-70 component-bg glass-effect rounded-2xl border border-border shadow-md" />
        <AnimatePresence mode="popLayout" initial={false}>
          {currentProfile && (
            <motion.div
              key={currentProfile.id + "-card"}
              className="relative w-full max-w-sm h-72 component-bg glass-effect rounded-2xl border border-border shadow-md overflow-hidden"
              style={{ x, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
            >
              <img
                src={currentProfile.image}
                alt={currentProfile.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Overlays */}
              <motion.div
                className="absolute top-4 left-4 px-3 py-1 rounded-xl border border-emerald-400/40 text-emerald-300/90 backdrop-blur-sm"
                style={{ opacity: likeOpacity }}
              >
                LIKE
              </motion.div>
              <motion.div
                className="absolute top-4 right-4 px-3 py-1 rounded-xl border border-rose-400/40 text-rose-300/90 backdrop-blur-sm"
                style={{ opacity: passOpacity }}
              >
                PASS
              </motion.div>

              {/* Footer info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="component-bg glass-effect rounded-xl border border-border p-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {currentProfile.name} • {currentProfile.age}
                      </div>
                      <div className="text-xs text-foreground/70 line-clamp-1">
                        {currentProfile.bio}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentProfile.interests.map((it) => (
                      <span
                        key={it}
                        className="text-xs px-2 py-1 rounded-lg bg-white/20 text-foreground border border-white/30"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-6 pb-4 animate-slideInLeft component-bg glass-effect rounded-2xl p-4 border border-border shadow-md">
        <Button
          onClick={() => handleAction("pass")}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/20 transition-all duration-300 btn-bounce glass-effect group"
        >
          <span className="text-2xl text-foreground group-hover:scale-125 transition-transform duration-200">
            <FaTimes />
          </span>
        </Button>

        <Button
          onClick={() => handleAction("superlike")}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 transition-all duration-300 btn-bounce glass-effect group animate-pulse-custom"
        >
          <span className="text-xl text-foreground group-hover:scale-125 transition-transform duration-200 animate-float">
            <FaStar />
          </span>
        </Button>

        <Button
          onClick={() => handleAction("like")}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950/20 transition-all duration-300 btn-bounce glass-effect group"
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
