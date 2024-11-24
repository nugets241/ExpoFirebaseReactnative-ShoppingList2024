// app/screens/ListsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, Alert, TextInput } from 'react-native';
import { fetchUserLists, fetchSharedLists, convertToSharedList, joinSharedList } from '../firestoreService';
import LoadingScreen from './LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';

const ListsScreen = ({ navigation, route }) => {
  const [lists, setLists] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  useEffect(() => {
    const loadUserAndLists = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername) {
        try {
          const usersCollectionRef = collection(FIRESTORE_DB, 'users');
          const userQuery = query(usersCollectionRef, where('username', '==', savedUsername));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            setUserId(userDoc.id);

            const userLists = await fetchUserLists(userDoc.id);
            setLists(userLists);

            const sharedLists = await fetchSharedLists(userDoc.id);
            setSharedLists(sharedLists);
          } else {
            Alert.alert('Error', 'User not found. Please log in again.');
            navigation.navigate('Onboarding');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          Alert.alert('Error', 'Could not fetch user data. Please try again.');
        }
      } else {
        Alert.alert('Error', 'No username found. Please log in again.');
        navigation.navigate('Onboarding');
      }
      setLoading(false);
    };

    loadUserAndLists();
  }, [navigation, route.params?.refresh]);

  const handleAddList = () => {
    navigation.navigate('AddList');
  };

  const handleConvertToShared = async (listId) => {
    try {
      await convertToSharedList(listId, userId);
      Alert.alert('Success', 'List converted to shared successfully!');
      // Refresh the lists
      const userLists = await fetchUserLists(userId);
      setLists(userLists);
      const sharedLists = await fetchSharedLists(userId);
      setSharedLists(sharedLists);
    } catch (error) {
      console.error('Error converting list to shared:', error);
      Alert.alert('Error', 'Could not convert list to shared. Please try again.');
    }
  };

  const handleJoinSharedList = async () => {
    if (invitationCode.trim()) {
      try {
        await joinSharedList(invitationCode, userId);
        Alert.alert('Success', 'Joined shared list successfully!');
        // Refresh the lists
        const sharedLists = await fetchSharedLists(userId);
        setSharedLists(sharedLists);
        setInvitationCode('');
      } catch (error) {
        console.error('Error joining shared list:', error);
        Alert.alert('Error', 'Could not join shared list. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter an invitation code.');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>My Lists</Text>
      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ListDetails', { listId: item.id })}>
            <Text style={{ padding: 16, borderBottomWidth: 1 }}>{item.name}</Text>
            <Button title="Convert to Shared" onPress={() => handleConvertToShared(item.id)} />
          </TouchableOpacity>
        )}
      />
      <Button title="Add New List" onPress={handleAddList} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20 }}>Shared Lists</Text>
      <FlatList
        data={sharedLists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ListDetails', { listId: item.id })}>
            <Text style={{ padding: 16, borderBottomWidth: 1 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TextInput
        placeholder="Enter invitation code"
        value={invitationCode}
        onChangeText={setInvitationCode}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <Button title="Join Shared List" onPress={handleJoinSharedList} />
    </View>
  );
};

export default ListsScreen;