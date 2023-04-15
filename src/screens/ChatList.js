import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Card from '../components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import RecordingsView from '../components/RecordingView'
import AnnouncementDetailsModal from '../components/AnnouncementDetailsModal';
import Checkbox from 'expo-checkbox';
import Toast from 'react-native-toast-message';
import * as Sharing from 'expo-sharing';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import { FieldValue, addDoc, collection } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_STORAGE } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const chatsData = [
    { id: 1, name: 'ECE 3rd Years', message: 'Anu Assis: Assignment', time: '12:00 PM', image: require('../../assets/images/man.png') },
    { id: 2, name: '4th Years', message: 'Tester: Test announcement', time: '11:30 AM', image: require('../../assets/images/man.png') },
    { id: 3, name: 'ECE', message: 'You: test', time: '10:45 AM', image: require('../../assets/images/man.png') },
    { id: 4, name: '1st Years', message: 'Biju: Parent\'s meeting', time: '9:15 AM', image: require('../../assets/images/man.png') },
    { id: 5, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 6, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 7, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 8, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 9, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 10, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 11, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 12, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
    { id: 13, name: 'All Batches', message: 'Principal: test', time: '8:30 AM', image: require('../../assets/images/man.png') },
];

const ChatList = ({ navigation }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [redayToSelect, setRedayToSelect] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [msgNote, setMsgNote] = useState("");
    const [msgTime, setMsgTime] = useState(new Date());
    const [audioURI, setAudioURI] = useState("");

    const handleSelectItem = (id) => {
        const alreadySelected = selectedItems.includes(id);
        if (alreadySelected) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSendAudio = (audioURI) => {
        setRedayToSelect(true)
        setAudioURI(audioURI);
    }

    const handleCancelSelection = () => {
        setRedayToSelect(false)
        setSelectedItems([]);
        setAudioURI('')
    }

    const handleSendButton = async () => {
        console.log('\nselected items: ', selectedItems);
        console.log('msg Title: ', msgNote);
        console.log('Audio: ', audioURI);

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
                // await Sharing.shareAsync(audioURI);

                //Firebase
                // const doc = addDoc(collection(FIREBASE_DB, 'todos'), {
                //     audioUrl: audioURI
                // })
                // console.log("🚀 ~ file: ChatList.js:81 ~ handleSendButton ~ doc:", doc)

                uploadFile(
                    audioURI,
                    'myFile.m4a'
                );

                setRedayToSelect(false)
                setAudioURI('')
                setSelectedItems([]);
                setMsgNote('')
            } catch (error) {
                // Error handling
            }


        }

    }

    const uploadFile = async (fileUri, fileName) => {
        try {
            const response = await fetch(fileUri);
            const blob = await response.blob();
            const announcementRef = ref(FIREBASE_STORAGE, `announcements/test.m4a`)
            // uploadBytes(announcementRef, blob).then(() => {
            //     console.log('img uploaded');
            // })
            const announcementTask = await uploadBytes(announcementRef, blob);

            const downloadUrl = await getDownloadURL(announcementRef);
            console.log('File uploaded successfully. Download URL:', downloadUrl);

            const doc = addDoc(collection(FIREBASE_DB, 'test_announcements'), {
                audioUrl: downloadUrl,
                addedAt: new Date(),
                announcementTime: msgTime,
                isSend: false,
                note: msgNote,
                playedInClassrooms: [],
                publishedBy: "user001",
                recipients: {
                    classroomIds: ['2f3s3YNWRc5d4dUT0ZR8'],
                    groupsIds: []
                }

            })
            console.log("🚀 ~ file: ChatList.js:131 ~ doc ~ doc:", doc)
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    };

    const dateTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setMsgTime(currentDate);
    };

    const showMode = (currentMode) => {
        DateTimePickerAndroid.open({
            value: date,
            onChange,
            mode: currentMode,
            is24Hour: true,
        });
    };

    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };

    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => { if (redayToSelect) handleSelectItem(item.id); else navigation.navigate('ChatPage') }}>
            <Card style={styles.card}>
                <View style={styles.rowView}>
                    <View style={[styles.iconView]}>
                        <Image source={item.image} style={styles.chatImage} />
                    </View>
                    <View>
                        <Text style={styles.chatName}>{item.name}</Text>
                        <Text style={styles.chatMessage}>{item.message}</Text>
                    </View>
                    <View style={styles.timeView}>
                        <Text style={styles.chatTime}>{item.time}</Text>
                        <Ionicons name='ios-checkmark-circle' size={24} color='gray' />
                    </View>
                    {redayToSelect && (
                        <Checkbox
                            value={selectedItems.includes(item.id)}
                            onValueChange={() => handleSelectItem(item.id)}
                            color={selectedItems.includes(item.id) ? '#4630EB' : undefined}
                        />
                    )}
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chatsData}
                keyExtractor={item => item.id.toString()}
                renderItem={renderChatItem}
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
                            <Ionicons name="send" size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.recordingViewContainer}>
                    <RecordingsView handleSend={handleSendAudio} />
                </View>
            )}
            <AnnouncementDetailsModal showModal={showModal} />
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
