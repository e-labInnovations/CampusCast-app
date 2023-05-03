import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, StatusBar, } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import CircleImage from '../components/CircleImage';

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

        try {
            // Sign-in the user with the credential
            const user = await auth().signInWithCredential(googleCredential);
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
                    return user
                });
        } catch (error) {
            console.log('Something went wrong', error);
            return null
        }
    }

    if (initializing) return null;

    return (
        <ImageBackground source={require('../../assets/bg1.jpg')}
            style={styles.backgroundImage}>
            <StatusBar backgroundColor="#120b1e" barStyle="light-content" />
            <SafeAreaView style={styles.container}>
                <Image source={require('../../assets/icon.png')} style={{ width: 150, height: 150, marginVertical: 100 }} />
                    <TouchableOpacity style={styles.loginButton} onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!')).catch(error => console.log(error))}>
                        <LottieView
                            source={require('../../assets/google-logo.json')}
                            resizeMode="cover"
                            autoPlay
                            style={{
                                width: 60,
                                height: 60,
                                backgroundColor: 'transparent',
                            }}
                        />
                        <Text style={styles.loginText}>Continue with Google</Text>
                    </TouchableOpacity>
            </SafeAreaView>
        </ImageBackground>
    )
}

export default Login

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#120b1e',
        paddingVertical: 0,
        paddingRight: 20,
        borderRadius: 25,
    },
    loginText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
    },
});
