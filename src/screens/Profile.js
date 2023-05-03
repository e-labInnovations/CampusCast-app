import { StyleSheet, View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import auth from '@react-native-firebase/auth';
import CircleImage from '../components/CircleImage';
import Ionicons from '@expo/vector-icons/Ionicons';

const Profile = () => {
// get the currently signed-in user
const currentUser = auth().currentUser;
if(!currentUser) {
    signOut()
}
const { uid, email, displayName, photoURL } = currentUser;

const signOut = async () => {
    try {
        await GoogleSignin.revokeAccess()
        auth().signOut().then(() => console.log('User signed out!'))
    } catch (error) {
        console.error(error);
    }
}
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>PROFILE</Text>
            <CircleImage source={{ uri: photoURL }} size={100} style={{ marginBottom: 10 }} />
            <Text style={styles.displayName}>{displayName.toUpperCase()}</Text>
            <View style={styles.rowItem}>
                <Ionicons name="mail" size={22} color="black" />
                <Text style={styles.email}>{email}</Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center'
    },
    heading: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20
    },
    profilePic: {
        width: 100,
        height: 100
    },
    displayName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    rowItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    email: {
        fontSize: 16,
        marginLeft: 10,
        marginBottom: 'auto'
    }
})
export default Profile