import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

export default function PlayedInClassroomsModal({ isVisible, classroomIds, onClose }) {
    const [classrooms, setClassrooms] = useState([])

    useEffect(() => {
        const classroomsRef = firestore().collection('devices');
        const classroomsSubscriber = classroomsRef.onSnapshot(snapshot => {
            const _classrooms = []
            snapshot.docs.forEach(doc => {
                let _classroom = doc.data()
                _classroom.id = doc.id
                _classroom.type = 'classroom'
                _classroom.name = `${_classroom.classroomName} (${_classroom.classroomCode})`
                _classrooms.push(_classroom)
            })

            setClassrooms(_classrooms)
        });
    }, [])
    return (
        <Modal animationType="slide" transparent={true} visible={isVisible}>
            <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Played Classrooms</Text>
                    <Pressable onPress={onClose}>
                        <MaterialIcons name="close" color="#fff" size={22} />
                    </Pressable>
                </View>
                {classrooms.map((classroom, index) => (
                    <View style={styles.itemContainer} key={index}>
                        <Image source={{ uri: classroom.image }} style={styles.image} />
                        <View style={styles.detailsContainer}>
                            <Text style={styles.classroomName}>{classroom.classroomName}</Text>
                            <Text style={styles.classroomCode}>Code: {classroom.classroomCode}</Text>
                            <Text style={styles.time}>Time: {classroom.time}</Text>
                        </View>
                    </View>
                ))}
                <Text>
                    {JSON.stringify(classrooms)}
                    {console.log(classrooms)}
                </Text>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        height: '25%',
        width: '100%',
        backgroundColor: '#25292e',
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
        position: 'absolute',
        bottom: 0,
    },
    titleContainer: {
        height: '16%',
        backgroundColor: '#464C55',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        color: '#fff',
        fontSize: 16,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 50,
        paddingVertical: 20,
    },

    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    image: {
        width: 80,
        height: 80,
        marginRight: 16,
        borderRadius: 40,
    },
    detailsContainer: {
        flex: 1,
    },
    classroomName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    classroomCode: {
        fontSize: 16,
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
    },
});  