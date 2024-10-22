// app/screens/MyListsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, Alert } from 'react-native';
import { fetchUserLists } from '../firestoreService';
import LoadingScreen from './LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';

const MyListsScreen = ({ navigation, route }) => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

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

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <FlatList
                data={lists}
                keyExtractor={item => item.id} // Ensure item.id is available
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('ListDetails', { listId: item.id })}>
                        <Text style={{ padding: 16, borderBottomWidth: 1 }}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
            <Button title="Add New List" onPress={handleAddList} />
        </View>
    );
};

export default MyListsScreen;
