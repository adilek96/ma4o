import BottomNavigation from "./components/BottomNavigation";

import Header from "./components/Header";

function App() {
  return (
    <div className="flex flex-col  justify-center items-center">
      <Header />
      <main className="flex-1">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Hello</h1>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}

export default App;
