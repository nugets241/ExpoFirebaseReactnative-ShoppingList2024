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
  updateDoc
} from 'firebase/firestore';

const listsCollection = collection(FIRESTORE_DB, 'lists');
const usersCollection = collection(FIRESTORE_DB, 'users');

// Function to create a new user
export const addUser = async (username) => {
  await addDoc(usersCollection, {
    username: username,
  });
};

// Function to update a username
export const updateUsername = async (oldUsername, newUsername) => {
  const userQuery = query(usersCollection, where('username', '==', oldUsername));
  const userSnapshot = await getDocs(userQuery);

  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const userDocRef = doc(FIRESTORE_DB, 'users', userDoc.id);
    await updateDoc(userDocRef, { username: newUsername });
  } else {
    throw new Error('User not found');
  }
};

// Function to generate a random alphanumeric string
const generateInvitationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Function to create a new list
export const createList = async (listName, userId) => {
  await addDoc(listsCollection, {
    name: listName,
    userId: userId,
    items: [],
    sharedWith: [],
    invitationCode: generateInvitationCode(),
  });
};

// Function to fetch user lists
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

// Function to delete a list
export const deleteList = async (listId) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  await deleteDoc(listDocRef);
};

// Function to update a list name
export const updateListName = async (listId, newName) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  await updateDoc(listDocRef, { name: newName });
};

// Function to convert a personal list to a shared list and generate an invitation code
export const convertToSharedList = async (listId, userId) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  const listDoc = await getDoc(listDocRef);

  if (listDoc.exists()) {
    const listData = listDoc.data();
    const sharedWith = listData.sharedWith || [];
    if (!sharedWith.includes(userId)) {
      sharedWith.push(userId);
    }
    const invitationCode = generateInvitationCode();
    await updateDoc(listDocRef, { sharedWith, invitationCode });
    return invitationCode;
  } else {
    throw new Error('List not found');
  }
};

// Function to check if a username exists
export const checkUsernameExists = async (username) => {
  const q = query(usersCollection, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Returns true if username exists
};

// Function to share a list with another user
export const shareListWithUser = async (listId, username) => {
  const userQuery = query(usersCollection, where('username', '==', username));
  const userSnapshot = await getDocs(userQuery);

  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const listData = listDoc.data();
      const sharedWith = listData.sharedWith || [];
      if (!sharedWith.includes(userId)) {
        sharedWith.push(userId);
        await updateDoc(listDocRef, { sharedWith });
      }
    } else {
      throw new Error('List not found');
    }
  } else {
    throw new Error('User not found');
  }
};

// Function to fetch list details
export const fetchListDetails = async (listId) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  const listDoc = await getDoc(listDocRef);

  if (listDoc.exists()) {
    return { id: listDoc.id, ...listDoc.data() };
  } else {
    throw new Error('List not found');
  }
};

// Function to update list items
export const updateListItems = async (listId, items) => {
  const listDocRef = doc(FIRESTORE_DB, 'lists', listId);
  await updateDoc(listDocRef, { items });
};