// useListOperations.js
import { useState } from 'react';
import { Alert } from 'react-native';
import { updateListItems } from '../firestoreService';

const useListOperations = (listId, listDetails, setListDetails) => {
  const [itemLoading, setItemLoading] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const handleDeleteItem = async (itemId) => {
    setItemLoading(true);
    const updatedItems = listDetails.items.filter(item => item.id !== itemId);
    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
      Alert.alert('Success', 'Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Could not delete item.');
    } finally {
      setItemLoading(false);
    }
  };

  const handleEditItem = (itemId, itemName) => {
    setNewItem(itemName);
    setIsEditing(true);
    setEditingItemId(itemId);
  };

  const handleUpdateItem = async () => {
    if (newItem.trim() === '') {
      Alert.alert('Error', 'Please enter an item name.');
      return;
    }

    const itemExists = listDetails.items.some(item => item.name.toLowerCase() === newItem.toLowerCase());
    if (itemExists && editingItemId !== null) {
      Alert.alert('Error', 'This item already exists in the list.');
      return;
    }

    setItemLoading(true);
    const updatedItems = listDetails.items.map(item =>
      item.id === editingItemId ? { ...item, name: newItem } : item
    );

    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
      setNewItem('');
      setIsEditing(false);
      Alert.alert('Success', 'Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Could not update item.');
    } finally {
      setItemLoading(false);
    }
  };

  const toggleCheckbox = async (itemId) => {
    setItemLoading(true);
    const updatedItems = listDetails.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    try {
      await updateListItems(listId, updatedItems);
      setListDetails(prev => ({ ...prev, items: updatedItems }));
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Could not update item.');
    } finally {
      setItemLoading(false);
    }
  };

  return {
    itemLoading,
    newItem,
    setNewItem,
    isEditing,
    handleDeleteItem,
    handleEditItem,
    handleUpdateItem,
    toggleCheckbox,
  };
};

export default useListOperations;
