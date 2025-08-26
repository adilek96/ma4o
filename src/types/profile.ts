export type DatingGoal = "RELATIONSHIP" | "FRIENDSHIP" | "CASUAL" | "MARRIAGE" | "NETWORKING";

export const DATING_GOALS: { value: DatingGoal; label: string }[] = [
  { value: "RELATIONSHIP", label: "Серьезные отношения" },
  { value: "FRIENDSHIP", label: "Дружба" },
  { value: "CASUAL", label: "Несерьезные отношения" },
  { value: "MARRIAGE", label: "Брак" },
  { value: "NETWORKING", label: "Нетворкинг" }
];

export type PreferredLocation = "SAME_CITY" | "SAME_COUNTRY" | "ANYWHERE" | "NEARBY";

export const PREFERRED_LOCATION_OPTIONS: { value: PreferredLocation; label: string }[] = [
  { value: "SAME_CITY", label: "Тот же город" },
  { value: "SAME_COUNTRY", label: "Та же страна" },
  { value: "NEARBY", label: "Поблизости" },
  { value: "ANYWHERE", label: "Где угодно" }
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

export type Education = "HIGH_SCHOOL" | "COLLEGE" | "BACHELOR" | "MASTER" | "PHD" | "SELF_TAUGHT" | "OTHER";

export const EDUCATION_OPTIONS: { value: Education; label: string }[] = [
  { value: "HIGH_SCHOOL", label: "Среднее образование" },
  { value: "COLLEGE", label: "Колледж" },
  { value: "BACHELOR", label: "Бакалавриат" },
  { value: "MASTER", label: "Магистратура" },
  { value: "PHD", label: "Докторантура" },
  { value: "SELF_TAUGHT", label: "Самообразование" },
  { value: "OTHER", label: "Другое" }
];

export type Occupation = "STUDENT" | "EMPLOYEE" | "FREELANCER" | "ENTREPRENEUR" | "UNEMPLOYED" | "RETIRED" | "OTHER";

export const OCCUPATION_OPTIONS: { value: Occupation; label: string }[] = [
  { value: "STUDENT", label: "Студент" },
  { value: "EMPLOYEE", label: "Сотрудник" },
  { value: "FREELANCER", label: "Фрилансер" },
  { value: "ENTREPRENEUR", label: "Предприниматель" },
  { value: "UNEMPLOYED", label: "Безработный" },
  { value: "RETIRED", label: "Пенсионер" },
  { value: "OTHER", label: "Другое" }
];

export interface ProfileData {
  userId: string;
  // Основная информация
  gender: string;
  birthDate: string;
  height: number;
  // Локация
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  // Дополнительная информация
  languages: string[];
  bio: string;
  interests: string[];
  education?: Education;
  occupation?: Occupation;
  smoking?: SmokingStatus;
  drinking?: DrinkingStatus;
}

export interface PreferencesData {
  userId: string;
  genderPreference: string;
  minAge: number | "";
  maxAge: number | "";
  locationPreference: PreferredLocation | "";
  maxDistance: number;
  datingGoalPreference: DatingGoal[];
  smokingPreference?: SmokingStatus;
  drinkingPreference?: DrinkingStatus;
}

export interface OptimisticProfileData extends ProfileData {
  id: string;
  isOptimistic?: boolean;
}
