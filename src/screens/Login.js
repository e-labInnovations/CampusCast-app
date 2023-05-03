import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Login = () => {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();

    GoogleSignin.configure({
        webClientId: '227472355966-svbhm4j4g80h8h8ru3sfrvt2ti0s5vjm.apps.googleusercontent.com',
    });

    // Handle user state changes
    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    const onGoogleButtonPress = async () => {
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        
        // Sign-in the user with the credential
        const user_signin = auth().signInWithCredential(googleCredential);
        user_signin.then(user => {
            const userData = {
                displayName: user.user.displayName,
                email: user.user.email,
                photoURL: user.user.photoURL,
                uid: user.user.uid
            }
            firestore()
            .collection('users')
            .doc(userData.uid)
            .set(userData)
            .then(() => {
                console.log('userData added!');
            });
        }).catch(error => {
            alert('Something went wrong')
            // console.log("🚀 ~ file: App.js:49 ~ onGoogleButtonPress ~ error:", error)
        })
    }

    if (initializing) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.loginContainer}>
                <Image source={require('../../assets/icon.png')} style={{ width: 200, height: 200, marginBottom: 50 }} />
                <TouchableOpacity style={styles.loginButton} onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}>
                    <AntDesign name="google" size={24} color="white" />
                    <Text style={styles.loginText}>Login with Google</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4285F4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    loginText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
    },
});
