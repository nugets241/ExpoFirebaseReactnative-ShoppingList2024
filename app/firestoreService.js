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

// Function to update the username
export const updateUsername = async (oldUsername, newUsername) => {
  const usersCollectionRef = collection(FIRESTORE_DB, 'users');
  const userQuery = query(usersCollectionRef, where('username', '==', oldUsername));
  const userSnapshot = await getDocs(userQuery);

  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const userDocRef = doc(FIRESTORE_DB, 'users', userDoc.id);
    await updateDoc(userDocRef, { username: newUsername });
  } else {
    throw new Error('User not found');
  }
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

// // Function to fetch shared lists for a specific user
// export const fetchSharedLists = async (userId) => {
//   const listsCollectionRef = collection(FIRESTORE_DB, 'lists');
//   const q = query(listsCollectionRef, where('sharedWith', 'array-contains', userId)); // Query by sharedWith array

//   const querySnapshot = await getDocs(q);
//   const sharedLists = [];

//   querySnapshot.forEach((doc) => {
//     sharedLists.push({ id: doc.id, ...doc.data() }); // Include id and data in the object
//   });

//   return sharedLists; // Ensure this is an array
// };


// Function to fetch shared lists
export const fetchSharedLists = async (userId) => {
  const q = query(listsCollection, where('sharedWith', 'array-contains', userId));
  const querySnapshot = await getDocs(q);
  const sharedLists = [];
  querySnapshot.forEach((doc) => {
    sharedLists.push({ id: doc.id, ...doc.data() });
  });
  return sharedLists;
};

// Function to convert a personal list to a shared list
export const convertToSharedList = async (listId, userId) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  const listDoc = await getDoc(listDocRef);

  if (listDoc.exists()) {
    const listData = listDoc.data();
    const sharedWith = listData.sharedWith || [];
    if (!sharedWith.includes(userId)) {
      sharedWith.push(userId);
    }
    await updateDoc(listDocRef, { sharedWith });
  } else {
    throw new Error('List not found');
  }
};

// Function to join a shared list using an invitation code
export const joinSharedList = async (invitationCode, userId) => {
  const q = query(listsCollection, where('invitationCode', '==', invitationCode));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const listDoc = querySnapshot.docs[0];
    const listDocRef = doc(FIRESTORE_DB, 'lists', listDoc.id);
    const listData = listDoc.data();
    const sharedWith = listData.sharedWith || [];
    if (!sharedWith.includes(userId)) {
      sharedWith.push(userId);
      await updateDoc(listDocRef, { sharedWith });
    }
  } else {
    throw new Error('Invalid invitation code');
  }
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

// Function to send notifications
export const sendNotification = async (title, body, userId) => {
  const userDocRef = doc(FIRESTORE_DB, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (fcmToken) {
      await messaging().sendMessage({
        to: fcmToken,
        notification: {
          title,
          body,
        },
      });
    }
  }
};

// Function to update the list and send notifications
export const updateListAndNotify = async (listId, userId, updates) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  await updateDoc(listDocRef, updates);

  const listDoc = await getDoc(listDocRef);
  const listData = listDoc.data();
  const sharedWith = listData.sharedWith || [];

  for (const sharedUserId of sharedWith) {
    if (sharedUserId !== userId) {
      await sendNotification('List Updated', 'A list you are part of has been updated.', sharedUserId);
    }
  }
};
