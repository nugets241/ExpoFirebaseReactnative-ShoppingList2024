// app/firestoreService.js
import { FIRESTORE_DB } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc // Don't forget this if you use it later
} from 'firebase/firestore';

const usersCollection = collection(FIRESTORE_DB, 'users');
const listsCollection = collection(FIRESTORE_DB, 'lists');

// Function to check if username exists
export const checkUsernameExists = async (username) => {
  const q = query(usersCollection, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Returns true if username exists
};

// Function to add a new user
export const addUser = async (username) => {
  await addDoc(usersCollection, { username });
};

// Function to create a new list
export const createList = async (listName, userId) => {
  const listsCollectionRef = collection(FIRESTORE_DB, 'lists');
  await addDoc(listsCollectionRef, {
    name: listName,
    userId: userId, // Save the userId with the list
    items: [], // Initialize with empty items array
  });
};

// Fetch lists for a specific user
export const fetchUserLists = async (userId) => {
  const listsCollectionRef = collection(FIRESTORE_DB, 'lists');
  const q = query(listsCollectionRef, where('userId', '==', userId)); // Query by userId

  const querySnapshot = await getDocs(q);
  const userLists = [];

  querySnapshot.forEach((doc) => {
    userLists.push({ id: doc.id, ...doc.data() }); // Include id and data in the object
  });

  return userLists; // Ensure this is an array
};

// Function to add an item to a list
export const addItemToList = async (listId, item) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  const currentList = await getDoc(listDocRef);
  await setDoc(listDocRef, { items: [...currentList.data().items, item] }, { merge: true });
};

// Function to delete an item from a list
export const deleteItemFromList = async (listId, itemId) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  const currentList = await getDoc(listDocRef);
  const updatedItems = currentList.data().items.filter(item => item.id !== itemId);
  await setDoc(listDocRef, { items: updatedItems }, { merge: true });
};

// Function to update an item in a list
export const updateItemInList = async (listId, itemId, updatedItem) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  const currentList = await getDoc(listDocRef);
  const updatedItems = currentList.data().items.map(item => (item.id === itemId ? updatedItem : item));
  await setDoc(listDocRef, { items: updatedItems }, { merge: true });
};

// Fetch list details for a specific list ID
export const fetchListDetails = async (listId) => {
  const listDoc = doc(FIRESTORE_DB, 'lists', listId); // Fetch the specific document using listId
  const docSnap = await getDoc(listDoc);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      items: data.items || [], // Ensure items is an array (default to empty)
    };
  } else {
    throw new Error('No such list!');
  }
};

// Update the items array of a specific list
export const updateListItems = async (listId, items) => {
  const listDoc = doc(FIRESTORE_DB, 'lists', listId);
  await updateDoc(listDoc, {
    items: items,
  });
};
