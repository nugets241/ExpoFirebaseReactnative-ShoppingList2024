// ListItem.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Foundation, FontAwesome6 } from '@expo/vector-icons';

const ListItem = ({ item, toggleCheckbox, handleEditItem, handleDeleteItem }) => {
  return (
    <View style={styles.itemContainer}>
      <Pressable
        style={[styles.checkboxBase, item.checked && styles.checkboxChecked]}
        onPress={() => toggleCheckbox(item.id)}
      >
        {item.checked && <Foundation  name="check" size={20} color="white" />}
      </Pressable>
      <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
        <FontAwesome6 name="trash-can" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleEditItem(item.id)}>
        <FontAwesome6  name="edit" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'dodgerblue',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: 'dodgerblue',
  },
  itemText: {
    fontSize: 16,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});

export default ListItem;
