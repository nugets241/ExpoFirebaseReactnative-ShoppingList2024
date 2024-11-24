// app/screens/MyListsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, Alert, TextInput, StyleSheet } from 'react-native';
import { fetchUserLists, deleteList, updateListName, convertToSharedList } from '../firestoreService';
import LoadingScreen from './LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { FontAwesome6 } from '@expo/vector-icons';

const MyListsScreen = ({ navigation, route }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [newListName, setNewListName] = useState('');

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

  const handleDeleteList = async (listId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(listId);
              Alert.alert('Success', 'List deleted successfully!');
              // Refresh the lists
              const userLists = await fetchUserLists(userId);
              setLists(userLists);
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'Could not delete list. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditList = (listId, listName) => {
    setEditingListId(listId);
    setNewListName(listName);
  };

  const handleUpdateList = async () => {
    if (newListName.trim()) {
      try {
        await updateListName(editingListId, newListName);
        Alert.alert('Success', 'List name updated successfully!');
        setEditingListId(null);
        setNewListName('');
        // Refresh the lists
        const userLists = await fetchUserLists(userId);
        setLists(userLists);
      } catch (error) {
        console.error('Error updating list name:', error);
        Alert.alert('Error', 'Could not update list name. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter a new list name.');
    }
  };

  const handleConvertToShared = async (listId) => {
    try {
      await convertToSharedList(listId, userId);
      Alert.alert('Success', 'List converted to shared successfully!');
      // Refresh the lists
      const userLists = await fetchUserLists(userId);
      setLists(userLists);
    } catch (error) {
      console.error('Error converting list to shared:', error);
      Alert.alert('Error', 'Could not convert list to shared. Please try again.');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ListDetails', { listId: item.id, listName: item.name })}>
              <Text style={{ padding: 16 }}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleConvertToShared(item.id)}>
              <FontAwesome6 name="share-from-square" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteList(item.id)}>
              <FontAwesome6 name="trash-can" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditList(item.id, item.name)}>
              <FontAwesome6 name="edit" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />
      {editingListId && (
        <View>
          <TextInput
            placeholder="Enter new list name"
            value={newListName}
            onChangeText={setNewListName}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <Button title="Update List" onPress={handleUpdateList} />
        </View>
      )}
      <Button title="Add New List" onPress={handleAddList} />
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
    backgroundColor: 'dodgerblue',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default MyListsScreen;