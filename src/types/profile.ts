export type DatingGoal = "RELATIONSHIP" | "FRIENDSHIP" | "CASUAL" | "MARRIAGE" | "NETWORKING";

export const DATING_GOALS: { value: DatingGoal; label: string }[] = [
  { value: "RELATIONSHIP", label: "Серьезные отношения" },
  { value: "FRIENDSHIP", label: "Дружба" },
  { value: "CASUAL", label: "Несерьезные отношения" },
  { value: "MARRIAGE", label: "Брак" },
  { value: "NETWORKING", label: "Нетворкинг" }
];

export type SmokingStatus = "NEVER" | "OCCASIONALLY" | "REGULARLY" | "QUIT" | "PREFER_NOT_TO_SAY";
export type DrinkingStatus = "NEVER" | "OCCASIONALLY" | "REGULARLY" | "QUIT" | "PREFER_NOT_TO_SAY";

export const SMOKING_OPTIONS: { value: SmokingStatus; label: string }[] = [
  { value: "NEVER", label: "Никогда не курил(а)" },
  { value: "OCCASIONALLY", label: "Курю иногда" },
  { value: "REGULARLY", label: "Курю регулярно" },
  { value: "QUIT", label: "Бросил(а) курить" },
  { value: "PREFER_NOT_TO_SAY", label: "Предпочитаю не говорить" }
];

export const DRINKING_OPTIONS: { value: DrinkingStatus; label: string }[] = [
  { value: "NEVER", label: "Не пью алкоголь" },
  { value: "OCCASIONALLY", label: "Пью иногда" },
  { value: "REGULARLY", label: "Пью регулярно" },
  { value: "QUIT", label: "Бросил(а) пить" },
  { value: "PREFER_NOT_TO_SAY", label: "Предпочитаю не говорить" }
];

export interface ProfileData {
  // Связь с пользователем
  userId: string;

  // Этап 1: Основная информация
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "male" | "female" | "other" | "";
  height: number;

  // Этап 2: Локация
  country: string;
  city: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  desiredLocation: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };

  // Этап 3: Предпочтения
  seekingGender: "male" | "female" | "any" | "";
  datingGoal: DatingGoal | "";
  interests: string[];
  languages: string[];

  // Этап 4: Дополнительная информация
  bio: string;
  smoking?: SmokingStatus;
  drinking?: DrinkingStatus;
}

export interface OptimisticProfileData extends ProfileData {
  id: string;
  isOptimistic?: boolean;
}
