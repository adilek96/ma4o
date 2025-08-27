# Важное!!!

в дев режиме закоментировать строку с телеграм скриптом в index.html

  <!-- <script src="https://telegram.org/js/telegram-web-app.js"></script> -->

при пуше в проду не забыть откоментировать!

---

vite.config.ts стоит проксирование для пути /upload на наш минио с фотографиями

## Переменное окружение

VITE_APPLICATION="dev" || "production"
VITE_INIT_DATA_DEV="" || берем из продакшин сборки в самом телеграм , может устаревать!
VITE_BASE_API_URL_PROD="" ссылка на апи в проде
VITE_BASE_API_URL_DEV="http://localhost:3002" ссылка на апи в дев режиме

## На будущее

обязатаельно сделать обьщий лоадер, 404 страницу, еррор баундрю

## Константы

### Интересы и языки

В проекте используются константы для интересов и языков, которые можно переиспользовать в разных компонентах.

#### Импорт констант:

```typescript
import { interests, languages } from "../constants";
```

#### Использование в компонентах:

**Для интересов:**

```typescript
// Получение переведенного названия интереса
const getInterestName = (interest: string) => {
  if (interests.includes(interest as any)) {
    return t(`interests.${interest}`);
  }
  return interest;
};

// Отображение интересов пользователя
{
  userInterests.map((interest: string) => (
    <span key={interest}>{getInterestName(interest)}</span>
  ));
}
```

**Для языков:**

```typescript
// Получение переведенного названия языка
const getLanguageName = (language: string) => {
  if (languages.includes(language as any)) {
    return t(`languages.${language}`);
  }
  return language;
};

// Отображение языков пользователя
{
  userLanguages.map((language: string) => (
    <span key={language}>{getLanguageName(language)}</span>
  ));
}
```

#### Доступные значения:

**Интересы:** `sports`, `music`, `movies`, `books`, `travel`, `cooking`, `art`, `technology`, `nature`, `photography`, `dancing`, `yoga`, `gaming`, `fashion`, `cars`, `animals`

**Языки:** `ru`, `en`, `es`, `fr`, `de`, `it`, `zh`, `ja`, `ko`, `ar`, `pt`, `tr`, `pl`, `cs`, `hu`, `fi`, `sv`, `no`, `da`, `nl`

#### Типы TypeScript:

```typescript
import { Interest, Language } from "../constants";

// Типизированные переменные
const userInterest: Interest = "sports";
const userLanguage: Language = "ru";
```
