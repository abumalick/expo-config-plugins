import * as React from "react";
import { Text } from "react-native";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return <Text>A simple app that does nothing</Text>;
};
App.displayName = "App";
export default App;
