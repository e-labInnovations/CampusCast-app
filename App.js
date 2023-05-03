import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Home from './src/screens/Home';
import ChatPage from './src/screens/ChatPage'
import Toast from 'react-native-toast-message';
import Login from './src/screens/Login'
import { MenuProvider } from 'react-native-popup-menu';
import Profile from './src/screens/Profile';
import theme from './src/theme';

let themeMode = theme.themeMode
const Stack = createNativeStackNavigator();

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  GoogleSignin.configure({
    webClientId: '227472355966-svbhm4j4g80h8h8ru3sfrvt2ti0s5vjm.apps.googleusercontent.com',
  });

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <MenuProvider>
      <NavigationContainer>
        {!user ?
          <Stack.Navigator>
            <Stack.Screen name="Login" options={{ headerShown: false }} component={Login} />
          </Stack.Navigator>
          :
          <Stack.Navigator screenOptions={{
              headerTintColor: theme[themeMode]['text-primary'],
              statusBarColor: theme[themeMode]['background-primary'],
              headerStyle: { backgroundColor: theme[themeMode]['background-secondary'] }
            }}
          >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="ChatPage" component={ChatPage} />
            <Stack.Screen name="Profile" component={Profile} options={{
              headerShown: false,
              presentation: 'containedModal',
            }} />
          </Stack.Navigator>

        }
        <Toast />
      </NavigationContainer>
    </MenuProvider>
  );
}

export default App;
