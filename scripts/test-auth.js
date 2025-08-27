// Скрипт для тестирования аутентификации
// Запускать в браузере в консоли разработчика

console.log("=== Тест аутентификации ===");

// Проверяем доступность Telegram WebApp
console.log("Telegram WebApp доступен:", !!window.Telegram?.WebApp);
console.log("Telegram WebApp initData:", window.Telegram?.WebApp?.initData);

// Проверяем переменные окружения
console.log("VITE_APPLICATION:", import.meta.env.VITE_APPLICATION);
console.log("VITE_INIT_DATA_DEV:", import.meta.env.VITE_INIT_DATA_DEV);

// Проверяем cookies
console.log("Cookies:", document.cookie);

// Проверяем localStorage
console.log("localStorage:", Object.keys(localStorage));

// Функция для тестирования API
async function testAPI() {
  const baseUrl =
    import.meta.env.VITE_APPLICATION === "production"
      ? import.meta.env.VITE_BASE_API_URL_PROD
      : import.meta.env.VITE_BASE_API_URL_DEV;

  try {
    const response = await fetch(`${baseUrl}/api/v1/user/me`, {
      credentials: "include",
    });
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

// Запускаем тест API
testAPI();
