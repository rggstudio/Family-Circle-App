import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  console.log("Root index.js initializing app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App); 