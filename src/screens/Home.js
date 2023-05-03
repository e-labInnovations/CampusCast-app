import { StyleSheet, View, Text, Image } from 'react-native'
import React, { useLayoutEffect } from 'react'
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from 'react-native-popup-menu'
import Ionicons from '@expo/vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ChatList from './ChatList';
import ExamSchedule from './ExamSchedule';

const Tab = createMaterialTopTabNavigator();

const Home = ({ navigation }) => {
    useLayoutEffect(() => {
        navigation.setOptions({
            title: null,
            headerShadowVisible: false,
            headerLeft: () => {
                return <Image source={require('../../assets/name.png')} style={styles.logoImage} />
            },
            headerRight: () => {
                return <Menu>
                    <MenuTrigger>
                        <Ionicons name="ellipsis-vertical" size={24} color="black" />
                    </MenuTrigger>
                    <MenuOptions customStyles={{
                        optionsContainer: {
                            borderRadius: 10,
                            overflow: 'hidden',
                        },
                        optionWrapper: {
                            padding: 10
                        }
                    }}>
                        <MenuOption onSelect={() => navigation.navigate('Profile')} text='Profile' />
                        <MenuOption onSelect={() => alert('Settings')} text='Settings' customStyles={{ fontSize: 20 }} />
                        <MenuOption onSelect={() => alert('New group')} text='New Group' />
                        <MenuOption onSelect={signOut} text='Logout' />
                    </MenuOptions>
                </Menu>
            }
        })
    }, [])

    const signOut = async () => {
        try {
            await GoogleSignin.revokeAccess()
            auth().signOut().then(() => console.log('User signed out!'))
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Tab.Navigator screenOptions={{
            tabBarStyle: {
                height: 30,
                padding: 0,
                margin: 0
            },
            tabBarItemStyle: {
                flex: 1,
                flexDirection: 'row',
                marginTop: 'auto',
                marginBottom: 'auto'

            },
            tabBarLabelStyle: {
                marginTop: 'auto',
                marginBottom: 'auto'
            }
        }}>
            <Tab.Screen
                name="Chat"
                component={ChatList}
                options={{
                    tabBarLabel: 'Home',
                    // tabBarIcon: ({color, size}) => <Ionicons name="ellipsis-vertical" size={size} color={color} />
                }} />
            <Tab.Screen
                name="ExamSchedule"
                component={ExamSchedule}
                options={{
                    tabBarLabel: 'Exam Schedules'
                }} />
        </Tab.Navigator >
    )
}

const styles = StyleSheet.create({
    logoImage: {
        height: 30,
        width: 150,
        resizeMode: 'contain',
    },
})

export default Home