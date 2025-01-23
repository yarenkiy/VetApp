import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './src/navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#4CAF50',
  },
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
  },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vetapp://'],
  config: {
    initialRouteName: 'Auth',
    screens: {
      Auth: {
        path: 'auth',
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      VetMain: {
        path: 'vet',
        screens: {
          Appointments: 'appointments',
          Patients: 'patients',
          Profile: 'profile',
        },
      },
      PetOwnerMain: {
        path: 'owner',
        screens: {
          Pets: 'pets',
          Appointments: 'appointments',
          Profile: 'profile',
        },
      },
    },
  },
};

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthProvider>
          <NavigationContainer theme={navigationTheme} linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
} 