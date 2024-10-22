// app/screens/MyListsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, Alert, Modal } from 'react-native';
import { fetchUserLists } from '../firestoreService';
import LoadingScreen from './LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icon library


const MyListsScreen = ({ navigation, route }) => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    const [selectedListId, setSelectedListId] = useState(null); // Track which list was clicked
    const [modalVisible, setModalVisible] = useState(false); // State to manage modal visibility


    useEffect(() => {
        const loadUserAndLists = async () => {
            const savedUsername = await AsyncStorage.getItem('username');
            if (savedUsername) {
                try {
                    // Get userId from users collection
                    const usersCollectionRef = collection(FIRESTORE_DB, 'users');
                    const userQuery = query(usersCollectionRef, where('username', '==', savedUsername));
                    const userSnapshot = await getDocs(userQuery);

                    if (!userSnapshot.empty) {
                        const userDoc = userSnapshot.docs[0];
                        setUserId(userDoc.id); // Store userId

                        // Fetch lists for the user using userId
                        const userLists = await fetchUserLists(userDoc.id);
                        setLists(userLists); // Update lists state
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
                navigation.navigate('Onboarding'); // Redirect to onboarding if no username
            }
            setLoading(false);
        };

        loadUserAndLists();
    }, [navigation, route.params?.refresh]); // Add route.params?.refresh to dependencies

    const handleAddList = () => {
        navigation.navigate('AddList');
    };
    const handleOpenModal = (listId) => {
        setSelectedListId(listId);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleDeleteList = () => {
        // Add your delete list logic here using selectedListId
        setModalVisible(false);
        Alert.alert('Deleted', 'List has been deleted.');
    };

    const handleShareList = () => {
        // Add your share list logic here
        setModalVisible(false);
        Alert.alert('Share', 'List sharing functionality to be implemented.');
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('ListDetails', { listId: item.id })}>
                            <Text>{item.name}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenModal(item.id)}>
                            <Icon name="more-horiz" size={24} />
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Button title="Add New List" onPress={handleAddList} />

            {/* Modal for Share and Delete options */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                        <Button title="Share" onPress={handleShareList} />
                        <Button title="Delete" onPress={handleDeleteList} color="red" />
                        <Button title="Cancel" onPress={handleCloseModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default MyListsScreen;