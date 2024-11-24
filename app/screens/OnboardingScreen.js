// app/screens/OnboardingScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { checkUsernameExists, addUser } from '../firestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './LoadingScreen';

const OnboardingScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if username is already saved in AsyncStorage
  useEffect(() => {
    const loadUsername = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername) {
        navigation.replace('Main'); // Navigate to Main screen if username exists
      }
    };

    loadUsername();
  }, []);

  const handleContinue = async () => {
    if (username) {
      setLoading(true);
      const exists = await checkUsernameExists(username);
      if (exists) {
        // Ask if the existing username belongs to the user
        Alert.alert(
          'Username Exists',
          'This username already exists. Do you want to continue with the existing username?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                await AsyncStorage.setItem('username', username);
                navigation.replace('Main'); // Navigate to Main screen
              },
            },
            {
              text: 'No',
              onPress: () => {
                setUsername(''); // Clear the username field
              },
            },
          ]
        );
      } else {
        await addUser(username);
        await AsyncStorage.setItem('username', username);
        navigation.replace('Main'); // Navigate to Main screen after successful addition
      }
      setLoading(false);
    } else {
      Alert.alert('Error', 'Please enter a username.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <TextInput
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
};

export default OnboardingScreen;