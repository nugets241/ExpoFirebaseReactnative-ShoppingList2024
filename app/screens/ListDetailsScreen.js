import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert } from 'react-native';
import { fetchListDetails } from '../firestoreService';
import LoadingScreen from './LoadingScreen';
import ListItem from './ListItem';
import useListOperations from './useListOperations'; // Import the custom hook

const ListDetailsScreen = ({ route }) => {
  const { listId } = route.params;
  const [listDetails, setListDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the custom hook for list operations
  const {
    itemLoading,
    newItem,
    setNewItem,
    isEditing,
    handleDeleteItem,
    handleEditItem,
    handleUpdateItem,
    toggleCheckbox,
  } = useListOperations(listId, listDetails, setListDetails);

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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {itemLoading ? (
        <LoadingScreen />
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
            <Button title="Add Item" onPress={() => Alert.alert('Add functionality not implemented')} />
          )}
          <FlatList
            data={listDetails.items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ListItem
                item={item}
                toggleCheckbox={toggleCheckbox}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
              />
            )}
          />
        </>
      )}
    </View>
  );
};

export default ListDetailsScreen;
