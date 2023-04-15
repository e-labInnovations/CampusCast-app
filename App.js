import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import ChatList from './src/screens/ChatList'
import ChatPage from './src/screens/ChatPage'
import Toast from 'react-native-toast-message';
import Login from './src/screens/Login'

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={ChatList} />
        <Stack.Screen name="Login" options={{ headerShown: false}} component={Login} />
        <Stack.Screen name="ChatPage" component={ChatPage} options={{ headerShown: false}} />
        <Stack.Screen name="Chat" component={ChatList} />
      </Stack.Navigator>
        <Toast />
    </NavigationContainer>
  );
}

export default App;
