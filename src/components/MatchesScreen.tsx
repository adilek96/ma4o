import { useEffect } from "react";
import { useMatch } from "../hooks/useMatch";

interface MatchesScreenProps {
  language: string;
}

export default function MatchesScreen({ language }: MatchesScreenProps) {
  const { results, handleSearch, loading } = useMatch();

  const translations = {
    en: {
      matches: "Matches",
      newMatches: "new matches",
      newMatch: "New Match!",
      loading: "Loading matches...",
      noMatches: "No matches yet",
      noMatchesDescription: "Start swiping to find your matches!",
    },
    ru: {
      matches: "Совпадения",
      newMatches: "новых совпадений",
      newMatch: "Новое совпадение!",
      loading: "Загрузка совпадений...",
      noMatches: "Пока нет совпадений",
      noMatchesDescription: "Начните свайпать, чтобы найти совпадения!",
    },
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Выводим результаты в консоль если есть матчи
  useEffect(() => {
    if (results && results.length > 0) {
      console.log("Matches found:", results);
    }
  }, [results]);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-fadeInUp">
        <div className="text-center animate-scaleIn component-bg rounded-2xl py-4 border border-border shadow-md">
          <h2 className="text-3xl font-bold gradient-text mb-2">{t.matches}</h2>
          <p className="text-foreground/70 animate-pulse-custom">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Состояние когда нет матчей
  if (!results || results.length === 0) {
    return (
      <div className="p-4 space-y-6 animate-fadeInUp">
        <div className="text-center animate-scaleIn component-bg rounded-2xl py-4 border border-border shadow-md">
          <h2 className="text-3xl font-bold gradient-text mb-2">{t.matches}</h2>
          <p className="text-foreground/70 mb-4">{t.noMatches}</p>
          <p className="text-foreground/50 text-sm">{t.noMatchesDescription}</p>
        </div>
      </div>
    );
  }

  // Если есть матчи, показываем только заголовок (данные выводятся в консоль)
  return (
    <div className="p-4 space-y-6 animate-fadeInUp">
      <div className="text-center animate-scaleIn component-bg rounded-2xl py-4 border border-border shadow-md">
        <h2 className="text-3xl font-bold gradient-text mb-2">{t.matches}</h2>
        <p className="text-foreground/70">
          {results.length} {t.newMatches}
        </p>
      </div>
    </div>
  );
}
