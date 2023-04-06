import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'; //import Google icon from vector icons library

const Login = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.loginContainer}>
                <TouchableOpacity style={styles.loginButton}>
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
