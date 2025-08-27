const mockMatches = [
  {
    id: 1,
    name: "Anna",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    isNew: true,
  },
  {
    id: 2,
    name: "Maria",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    isNew: false,
  },
  {
    id: 3,
    name: "Sofia",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    isNew: true,
  },
  {
    id: 4,
    name: "Elena",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    isNew: false,
  },
  {
    id: 5,
    name: "Kate",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face",
    isNew: false,
  },
  {
    id: 6,
    name: "Lisa",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    isNew: true,
  },
];

interface MatchesScreenProps {
  language: string;
}

export default function MatchesScreen({ language }: MatchesScreenProps) {
  const translations = {
    en: {
      matches: "Matches",
      newMatches: "new matches",
      newMatch: "New Match!",
    },
    ru: {
      matches: "Совпадения",
      newMatches: "новых совпадений",
      newMatch: "Новое совпадение!",
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className="p-4 space-y-6 animate-fadeInUp">
      <div className="text-center animate-scaleIn component-bg rounded-2xl py-4 border border-border shadow-md">
        <h2 className="text-3xl font-bold gradient-text mb-2">{t.matches}</h2>
        <p className="text-foreground/70 animate-pulse-custom">
          {mockMatches.filter((m) => m.isNew).length} {t.newMatches}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockMatches.map((match, index) => (
          <div
            key={match.id}
            className="relative p-6 text-center transition-all duration-300 card-hover cursor-pointer shadow-md animate-slideInLeft rounded-xl component-bg border border-border"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {match.isNew && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center animate-pulse-custom">
                <span className="text-white text-xs font-bold animate-float">
                  !
                </span>
              </div>
            )}

            <div className="w-20 h-20 mx-auto mb-3 ring-4 ring-white/20 transition-all duration-300 hover:ring-white/40 rounded-full overflow-hidden">
              <img
                src={match.image}
                alt={match.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-bold text-lg text-foreground">{match.name}</h3>

            {match.isNew && (
              <p className="text-xs gradient-text font-medium mt-1 animate-pulse-custom">
                {t.newMatch}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
