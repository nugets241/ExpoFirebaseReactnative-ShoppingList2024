// app/navigations/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyListsScreen from '../screens/MyListsScreen';
import FamilyListsScreen from '../screens/FamilyListsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AddListScreen from '../screens/AddListScreen';
import ListDetailsScreen from '../screens/ListDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="My Lists" component={MyListsScreen} />
    <Tab.Screen name="Family Lists" component={FamilyListsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="AddList" component={AddListScreen} />
      <Stack.Screen name="ListDetails" component={ListDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
