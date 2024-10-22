import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert } from 'react-native';
import { fetchListDetails, updateListItems } from '../firestoreService';
import LoadingScreen from './LoadingScreen';

const ListDetailsScreen = ({ route }) => {
  const { listId } = route.params;
  const [listDetails, setListDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemLoading, setItemLoading] = useState(false); // New loading state for item actions

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

    // Check for duplicate item
    const itemExists = listDetails.items.some(item => item.name.toLowerCase() === newItem.toLowerCase());
    if (itemExists) {
      Alert.alert('Error', 'This item already exists in the list.');
      return;
    }

    setItemLoading(true); // Start loading state
    const updatedItems = [...listDetails.items, { id: Date.now().toString(), name: newItem }];

    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
      setNewItem('');
      Alert.alert('Success', 'Item added successfully!'); // Feedback after adding
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Could not add item to the list.');
    } finally {
      setItemLoading(false); // End loading state
    }
  };

  const handleDeleteItem = async (itemId) => {
    setItemLoading(true); // Start loading state
    const updatedItems = listDetails.items.filter(item => item.id !== itemId);
    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
      Alert.alert('Success', 'Item deleted successfully!'); // Feedback after deleting
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Could not delete item.');
    } finally {
      setItemLoading(false); // End loading state
    }
  };

  const handleEditItem = (itemId, itemName) => {
    setNewItem(itemName); // Set the current item name to the input
    setIsEditing(true); // Switch to edit mode
    setEditingItemId(itemId); // Store the ID of the item being edited
  };

  const handleUpdateItem = async () => {
    if (newItem.trim() === '') {
      Alert.alert('Error', 'Please enter an item name.');
      return;
    }

    // Check for duplicate item
    const itemExists = listDetails.items.some(item => item.name.toLowerCase() === newItem.toLowerCase());
    if (itemExists && editingItemId !== null) {
      Alert.alert('Error', 'This item already exists in the list.');
      return;
    }

    setItemLoading(true); // Start loading state
    const updatedItems = listDetails.items.map(item =>
      item.id === editingItemId ? { ...item, name: newItem } : item
    );

    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
      setNewItem('');
      setIsEditing(false); // Exit edit mode
      Alert.alert('Success', 'Item updated successfully!'); // Feedback after updating
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Could not update item.');
    } finally {
      setItemLoading(false); // End loading state
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {itemLoading ? (
        <LoadingScreen /> // Show loading screen if item action is processing
      ) : (
        <>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{listDetails.name}</Text>
          <TextInput
            placeholder="Enter item name"
            value={newItem}
            onChangeText={setNewItem}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          {isEditing ? (
            <Button title="Update Item" onPress={handleUpdateItem} />
          ) : (
            <Button title="Add Item" onPress={handleAddItem} />
          )}
          <FlatList
            data={listDetails.items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 }}>
                {isEditing && editingItemId === item.id ? (
                  <TextInput
                    value={newItem}
                    onChangeText={setNewItem}
                    style={{ borderBottomWidth: 1, flex: 1 }}
                  />
                ) : (
                  <Text>{item.name}</Text>
                )}
                {isEditing && editingItemId === item.id ? (
                  <Button title="Update" onPress={handleUpdateItem} />
                ) : (
                  <Button title="Edit" onPress={() => handleEditItem(item.id, item.name)} />
                )}
                <Button title="Delete" onPress={() => handleDeleteItem(item.id)} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

export default ListDetailsScreen;
