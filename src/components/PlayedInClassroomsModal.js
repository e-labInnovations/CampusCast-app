import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Image, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/firestore';
import theme from '../theme';

let themeMode = theme.themeMode

export default function PlayedInClassroomsModal({ isVisible, classroomIds, onClose }) {
    const [classrooms, setClassrooms] = useState([])

    useEffect(() => {
        // console.log("ids", classroomIds);
        if (classroomIds && classroomIds.length) {
            const classroomsRef = firestore().collection('devices');
            const classroomsSubscriber = classroomsRef
                .where(firebase.firestore.FieldPath.documentId(), 'in', classroomIds)
                .onSnapshot(snapshot => {
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
        } else {
            setClassrooms([])
        }
    }, [classroomIds])

    const renderClassroomItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <Text style={styles.classroomName}>{item.classroomName}</Text>
                <Text style={styles.classroomCode}>Code: {item.classroomCode}</Text>
                {/* <Text style={styles.time}>Time: {item.time}</Text> */}
            </View>
        </View>
    )

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classrooms available</Text>
        </View>
    );

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible}>
            <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Played Classrooms</Text>
                    <Pressable onPress={onClose}>
                        <MaterialIcons name="close" color="#fff" size={26} />
                    </Pressable>
                </View>
                <FlatList
                    data={classrooms}
                    renderItem={renderClassroomItem}
                    ListEmptyComponent={renderEmptyList}
                    keyExtractor={item => item.id.toString()}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        height: '50%',
        width: '100%',
        backgroundColor: theme[themeMode]['background-light'],
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

    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    image: {
        width: 60,
        height: 60,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
    },
});  