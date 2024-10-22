import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert } from 'react-native';
import { fetchListDetails, updateListItems } from '../firestoreService';
import LoadingScreen from './LoadingScreen';

const ListDetailsScreen = ({ route }) => {
  const { listId } = route.params;
  const [listDetails, setListDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const getListDetails = async () => {
      try {
        const details = await fetchListDetails(listId);
        setListDetails(details);
      } catch (error) {
        console.error('Error fetching list details:', error);
        Alert.alert('Error', 'Could not fetch list details.');
      } finally {
        setLoading(false);
      }
    };

    getListDetails();
  }, [listId]);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleAddItem = async () => {
    if (newItem.trim() === '') {
      Alert.alert('Error', 'Please enter an item name.');
      return;
    }

    const updatedItems = [...listDetails.items, { id: Date.now().toString(), name: newItem }];

    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Could not add item to the list.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{listDetails.name}</Text>
      <TextInput
        placeholder="Enter item name"
        value={newItem}
        onChangeText={setNewItem}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <Button title="Add Item" onPress={handleAddItem} />
      <FlatList
        data={listDetails.items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text style={{ padding: 16, borderBottomWidth: 1 }}>{item.name}</Text>
        )}
      />
    </View>
  );
};

export default ListDetailsScreen;
