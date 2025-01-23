import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Tip tanımlamaları
export type RootStackParamList = {
  Auth: undefined;
  VetMain: undefined;
  PetOwnerMain: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type VetTabParamList = {
  Appointments: undefined;
  Patients: undefined;
  Profile: undefined;
};

export type PetOwnerTabParamList = {
  Pets: undefined;
  Appointments: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const VetTab = createBottomTabNavigator<VetTabParamList>();
const PetOwnerTab = createBottomTabNavigator<PetOwnerTabParamList>();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Veteriner Tab Navigator
const VetTabNavigator = () => {
  return (
    <VetTab.Navigator>
      <VetTab.Screen name="Appointments" component={() => null} />
      <VetTab.Screen name="Patients" component={() => null} />
      <VetTab.Screen name="Profile" component={() => null} />
    </VetTab.Navigator>
  );
};

// Pet Sahibi Tab Navigator
const PetOwnerTabNavigator = () => {
  return (
    <PetOwnerTab.Navigator>
      <PetOwnerTab.Screen name="Pets" component={() => null} />
      <PetOwnerTab.Screen name="Appointments" component={() => null} />
      <PetOwnerTab.Screen name="Profile" component={() => null} />
    </PetOwnerTab.Navigator>
  );
};

// Ana Navigator
export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // veya bir loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.userType === 'vet' ? (
          <Stack.Screen name="VetMain" component={VetTabNavigator} />
        ) : (
          <Stack.Screen name="PetOwnerMain" component={PetOwnerTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 