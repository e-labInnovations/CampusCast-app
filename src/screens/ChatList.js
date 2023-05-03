import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Card from '../components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import RecordingsView from '../components/RecordingView'
import AnnouncementDetailsModal from '../components/AnnouncementDetailsModal';
import Checkbox from 'expo-checkbox';
import Toast from 'react-native-toast-message';
import * as Sharing from 'expo-sharing';
import DatePicker from 'react-native-date-picker'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const ChatList = ({ navigation }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [redayToSelect, setRedayToSelect] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDateModal, setDateShowModal] = useState(false);
    const [msgNote, setMsgNote] = useState("");
    const [msgTime, setMsgTime] = useState(new Date());
    const [audioURI, setAudioURI] = useState("");
    const [audioDuration, setAudioDuration] = useState("00:00")
    const [classrooms, setClassrooms] = useState([])
    const [groups, setGoups] = useState([])
    const [chatItems, setChatItems] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const currentUser = auth().currentUser;
        if(!currentUser) {
            signOut()
        }
        setCurrentUser(currentUser)
        
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

        const groupsRef = firestore().collection('groups');
        const groupsSubscriber = groupsRef.onSnapshot(snapshot => {
            const _groups = []
            snapshot.docs.forEach(doc => {
                let _group = doc.data()
                _group.id = doc.id
                _group.type = 'group'
                _group.image = `https://ui-avatars.com/api/?name=${_group.name}&background=random&color=fff&length=3&rounded=true`
                _groups.push(_group)
            })

            setGoups(_groups)
        })
    }, [])

    useEffect(() => {
        setChatItems(groups.concat(classrooms))
    }, [groups, classrooms])

    const signOut = async () => {
        try {
            await GoogleSignin.revokeAccess()
            auth().signOut().then(() => console.log('User signed out!'))
        } catch (error) {
            console.error(error);
        }
    }

    const handleSelectItem = (item) => {
        const alreadySelected = selectedItems.includes(item);
        if (alreadySelected) {
            setSelectedItems(selectedItems.filter((_item) => _item.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleSendAudio = (audioURI, audioDuration) => {
        setRedayToSelect(true)
        setAudioURI(audioURI);
        setAudioDuration(audioDuration)
    }

    const handleCancelSelection = () => {
        setRedayToSelect(false)
        setSelectedItems([]);
        setAudioURI('')
    }

    const handleSendButton = async () => {
        if (selectedItems.length == 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No items selected'
            });
        } else if (!msgNote) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Announcement note is missing'
            });
        } else {
            try {
                function generateRandomId() {
                    const randomString = Math.random().toString(36).substr(2, 5);
                    const timestamp = Date.now().toString().substr(-5);
                    return randomString + timestamp;
                }
                setMsgTime(new Date())
                uploadFile(audioURI, generateRandomId());
            } catch (error) {
                // Error handling
            }


        }

    }

    const uploadFile = async (fileUri, fileName) => {
        try {
            // const response = await fetch(fileUri);
            // const blob = await response.blob();
            const announcementRef = storage().ref(`announcements/${fileName}`)
            const announcementTask = announcementRef.putFile(fileUri)
            setIsUploading(true)

            announcementTask.on('state_changed', taskSnapshot => {
                console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
            });

            announcementTask.then(async () => {
                console.log('Udio uploaded to the bucket!');
                const downloadUrl = await announcementRef.getDownloadURL();

                const recipientsClassrooms = selectedItems.filter(item => item.type == 'classroom').map(item => item.id)
                const recipientsGroups = selectedItems.filter(item => item.type == 'group').map(item => item.id)

                firestore()
                    .collection('announcements')
                    .add({
                        audioUrl: downloadUrl,
                        addedAt: new Date(),
                        announcementTime: msgTime,
                        isSend: false,
                        note: msgNote,
                        duration: audioDuration,
                        playedInClassrooms: [],
                        publishedBy: currentUser.uid,
                        recipients: {
                            classroomIds: recipientsClassrooms,
                            groupsIds: recipientsGroups
                        }

                    })
                    .then(() => {
                        console.log('Announcement added!');
                        setIsUploading(false)
                        setRedayToSelect(false)
                        setAudioURI('')
                        setSelectedItems([]);
                        setMsgNote('')
                    });
            });

        } catch (error) {
            console.error('Error uploading file:', error);
            setIsUploading(false)
            setRedayToSelect(false)
            setAudioURI('')
            setSelectedItems([]);
            setMsgNote('')
            return null;
        }
    };

    const dateTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setMsgTime(currentDate);
    };

    const showDatepicker = () => {
        console.log('Long press Test');
        setDateShowModal(true)
    };

    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => { if (redayToSelect) handleSelectItem(item); else navigation.navigate('ChatPage', { chatItem: item }) }}>
            <Card style={styles.card}>
                <View style={styles.rowView}>
                    <View style={[styles.iconView]}>
                        <Image source={{ uri: item.image }} style={styles.chatImage} />
                    </View>
                    <View style={{ width: '70%' }}>
                        <Text style={styles.chatName}>{item.name}</Text>
                        <Text style={styles.chatMessage} numberOfLines={1}>{item.message}</Text>
                    </View>
                    <View style={styles.timeView}>
                        <Text style={styles.chatTime}>{item.time}</Text>
                        {item.lastAnnouncementSend ? <Ionicons name='ios-checkmark-circle' size={24} color='gray' /> : <Ionicons name='time' size={24} color='gray' />}
                    </View>
                    {redayToSelect && (
                        <Checkbox
                            value={selectedItems.includes(item)}
                            onValueChange={() => handleSelectItem(item)}
                            color={selectedItems.includes(item) ? '#4630EB' : undefined}
                        />
                    )}
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

                <FlatList
                    data={chatItems}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderChatItem}
                    contentContainerStyle={{flexGrow: 1}}
                />

                {redayToSelect ? (
                    <View style={styles.recordingViewContainer}>
                        <View style={styles.sendView}>
                            <TouchableOpacity onPress={handleCancelSelection} style={[styles.cancelButton]}>
                                <Ionicons name="close" size={26} color="#fff" />
                            </TouchableOpacity>

                            <TextInput
                                value={msgNote}
                                onChangeText={(msgNote) => setMsgNote(msgNote)}
                                placeholder={'Note: '}
                                multiline={false}
                                style={styles.msgNoteInput}
                            />

                            <TouchableOpacity onPress={handleSendButton} onLongPress={showDatepicker} style={[styles.sendButton]}>
                                {isUploading ?
                                    <Ionicons name="cloud-upload" size={26} color="#fff" />
                                    : <Ionicons name="send" size={26} color="#fff" />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.recordingViewContainer}>
                        <RecordingsView handleSend={handleSendAudio} />
                    </View>
                )}
                <AnnouncementDetailsModal showModal={showModal} />
                <DatePicker
                    modal
                    open={showDateModal}
                    date={msgTime}
                    theme="light"
                    onConfirm={(date) => {
                        setDateShowModal(false)
                        setMsgTime(date)
                    }}
                    onCancel={() => {
                        setDateShowModal(false)
                    }}
                />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatItem: {
        backgroundColor: '#ffffff',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    card: {
        width: '100%',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    rowView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconView: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        marginRight: 16,
    },
    chatImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    chatName: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    chatMessage: {
        color: 'gray',
        fontSize: 16,
    },
    timeView: {
        marginLeft: 'auto',
        alignItems: 'flex-end',
    },
    chatTime: {
        color: 'gray',
        fontSize: 14,
        marginRight: 8,
    },

    recordingViewContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 1, // add border width
        // borderColor: 'black' // add border color
    },


    sendView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
        elevation: 2,
    },
    cancelButton: {
        backgroundColor: '#f00',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    sendButton: {
        backgroundColor: '#00f',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },

    msgNoteInput: {
        height: 46,
        padding: 5,
        // maxHeight: 75,
        maxWidth: '50%',
        width: '50%',
        borderRadius: 50,
        backgroundColor: '#eee',
        fontWeight: 'bold'
    }
});

export default ChatList;
