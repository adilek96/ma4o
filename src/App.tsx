import { useState } from "react";
import BottomNavigation, { type Screen } from "./components/BottomNavigation";
import Header from "./components/header";
import Iridescence from "./components/Iridescence";
import DiscoverScreen from "./components/DiscoverScreen";

function App() {
  const [activeTab, setActiveTab] = useState<Screen>("discover");

  const renderScreen = () => {
    switch (activeTab) {
      case "discover":
        return <DiscoverScreen />;

      //   case "matches":
      //     return <MatchesScreen />;
      //   case "messages":
      //     return <MessagesScreen />;
      //   case "profile":
      //     return <ProfileScreen />;
      default:
        return <DiscoverScreen />;
    }
  };
  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          zIndex: -1,
        }}
      >
        <Iridescence
          color={[1, 1, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      <Header />
      {renderScreen()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

export default App;
