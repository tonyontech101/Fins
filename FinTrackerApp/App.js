import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  console.log('FinTracker App render');
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <AppNavigator />
    </View>
  );
}
