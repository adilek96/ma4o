"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Stack from "./Stack";
import { FaTimes, FaHeart, FaHeartBroken, FaSearch } from "react-icons/fa";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import PreferencesSetupForm from "./PreferencesSetupForm";

const DiscoverScreen = () => {
  const [showPreferencesSetup, setShowPreferencesSetup] = useState(false);
  const { t } = useTranslation();
  const [seed] = useState(() => Math.random());
  const { user, refreshUserData } = useAuth();

  const { results, handleSearch, loading } = useSearch();

  useEffect(() => {
    const fetchData = async () => {
      await handleSearch();
    };
    fetchData();
  }, [handleSearch]);

  // if (results.length > 0) {
  //   console.log("results", results);
  // }

  // Получаем данные предпочтений пользователя
  const preferences = user?.preferences;

  return (
    <>
      {/* Preferences Setup Form */}
      {showPreferencesSetup && user && (
        <PreferencesSetupForm
          userId={user.id}
          isEditMode={preferences ? true : false}
          initialData={
            preferences
              ? {
                  userId: preferences.userId,
                  genderPreference:
                    preferences.genderPreference?.toLowerCase() || "",
                  minAge: preferences.minAge,
                  maxAge: preferences.maxAge,
                  locationPreference: preferences.locationPreference as any,
                  maxDistance: preferences.maxDistance,
                  datingGoalPreference: Array.isArray(
                    preferences.datingGoalPreference
                  )
                    ? (preferences.datingGoalPreference as any)
                    : [preferences.datingGoalPreference as any],
                  smokingPreference: preferences.smokingPreference as any,
                  drinkingPreference: preferences.drinkingPreference as any,
                }
              : undefined
          }
          onSubmit={async () => {
            // Обновляем данные пользователя после сохранения предпочтений
            await refreshUserData();
            handleSearch();
            setShowPreferencesSetup(false);
          }}
          onCancel={() => setShowPreferencesSetup(false)}
        />
      )}

      {loading ? (
        <div className="flex flex-col h-[calc(100vh-8rem)]   animate-fadeInUp">
          <div className="flex-1 flex w-full   items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute top-1/2 -translate-y-1/2  scale-y-150 flex flex-col items-center justify-center">
              <FaSearch size={180} className="text-blue-500/25" />
              <p className="text-center text-3xl font-bold ">
                {t("discover.searching")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-8rem)]   animate-fadeInUp">
          <div className="flex-1 flex w-full   items-center justify-center mb-6 relative overflow-hidden">
            {/* Background half-icons */}

            {!results || results === null ? (
              <>
                <div className="absolute top-1/2 -translate-y-1/2 text-red-500/25 scale-y-150">
                  <FaHeartBroken size={280} />
                </div>
                <div className="flex flex-col items-center justify-center relative z-10">
                  <p className="text-center text-2xl font-bold relative z-10">
                    {t("discover.searchFailed")}
                    <br />
                    <span className="text-sm text-gray-500">
                      {t("discover.searchFailedSubtitle")}
                    </span>
                  </p>
                  <button
                    onClick={() => setShowPreferencesSetup(true)}
                    className="mt-7 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white btn-bounce px-6 py-2 rounded-full relative z-10"
                  >
                    {t("discover.updatePreferences")}
                  </button>
                  <button
                    onClick={() => handleSearch()}
                    className="px-6 py-3 mt-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all duration-20 relative z-10"
                  >
                    {t("discover.retrySearch")}
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DiscoverScreen;
