import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CircleImage from '../components/CircleImage';
import RecordingsView from '../components/RecordingView'
import PlayedInClassroomsModal from '../components/PlayedInClassroomsModal';
import theme from '../theme';

let themeMode = theme.themeMode

const ChatPage = ({ navigation, route }) => {
  const { chatItem } = route.params;
  const [sound, setSound] = useState(null);
  const [playingAnnouncementId, setPlayingAnnouncementId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null)
  const [playableDurationMillis, setPlayableDurationMillis] = useState(0);
  const [positionMillis, setPositionMillis] = useState(0);
  const [showPlayedInClassroomsModal, setShowPlayedInClassroomsModal] = useState(false);
  const [playedInClassroomsModalIds, setPlayedInClassroomsModalIds] = useState(null);


  useEffect(() => {
    const currentUser = auth().currentUser;
    setCurrentUser(currentUser)

    firestore()
      .collection('users')
      .get()
      .then(querySnapshot => {
        const _users = [];
        querySnapshot.forEach(doc => {
          _users.push({ ...doc.data(), uid: doc.id });
        });

        if (chatItem.type == 'group') {
          const groupId = chatItem.id;
          const announcementsRef = firestore().collection('announcements');
          announcementsRef.where('recipients.groupsIds', 'array-contains', groupId)
            .orderBy('announcementTime', 'asc')
            .onSnapshot(snapshot => {
              const _announcements = []
              snapshot.docs.forEach(doc => {
                let _announcement = doc.data()
                _announcement.id = doc.id
                _announcement.publishedBy = _users.find(user => user.uid == _announcement.publishedBy)
                _announcements.push(_announcement)
              })

              setAnnouncements(_announcements)
            })

        } else if (chatItem.type == 'classroom') {
          const classroomId = chatItem.id;
          const groupIds = chatItem.groupsIds;
          const announcementsRef = firestore().collection('announcements');

          const classroomQuery = announcementsRef
            .where('recipients.classroomIds', 'array-contains', classroomId)
            .orderBy('announcementTime', 'asc')
            .get();

          const groupsQuery = announcementsRef
            .where('recipients.groupsIds', 'array-contains-any', groupIds)
            .orderBy('announcementTime', 'asc')
            .get();

          Promise.all([classroomQuery, groupsQuery])
            .then(results => {
              const mergedAnnouncements = [];

              results[0].docs.forEach(doc => {
                let announcement = doc.data();
                announcement.id = doc.id;
                announcement.publishedBy = _users.find(user => user.uid === announcement.publishedBy);
                announcement.announcement_type = 'classroom';
                mergedAnnouncements.push(announcement);
              });
          
              results[1].docs.forEach(doc => {
                let announcement = doc.data();
                announcement.id = doc.id;
                announcement.publishedBy = _users.find(user => user.uid === announcement.publishedBy);
                announcement.announcement_type = 'group';
                mergedAnnouncements.push(announcement);
              });

              const uniqueAnnouncements = Array.from(new Set(mergedAnnouncements.map(a => a.id)))
                .map(id => mergedAnnouncements.find(a => a.id === id));

              uniqueAnnouncements.sort((a, b) => a.announcementTime - b.announcementTime);
              setAnnouncements(uniqueAnnouncements);
            })
            .catch(error => {
              console.error('Error fetching announcements:', error);
            });
        }
      })
      .catch(error => {
        console.log('Error getting users: ', error);
      });

  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerBackVisible: true,
      headerLeft: () => {
        return <View style={styles.userInfoContainer}>
          <Image
            style={styles.userAvatar}
            source={{ uri: chatItem.image }}
          />
          <Text style={styles.userName}>{chatItem.name}</Text>
        </View>
      },
    })
  }, [chatItem])

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const playSound = async (uri, id) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        setPlayingAnnouncementId(id)
        setPlayableDurationMillis(status.durationMillis)
        setPositionMillis(status.positionMillis)
        if (status.positionMillis == status.playableDurationMillis) {
          setPlayingAnnouncementId(null);
        }
      }
    );
    setSound(newSound);
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
    setPlayingAnnouncementId(null);
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    setPlayingAnnouncementId(null);
  };

  const formatFirestoreTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${amPm}`;
  }

  const handleSendAudio = (audioURI, audioDuration) => {
    console.log("🚀 ~ file: ChatPage.js:139 ~ handleSendAudio ~ audioDuration:", audioDuration)
    console.log("🚀 ~ file: ChatPage.js:139 ~ handleSendAudio ~ audioURI:", audioURI)
  }

  const renderAnnouncements = ({ item }) => (
    <TouchableOpacity style={[styles.announcementContainer, currentUser.uid == item.publishedBy.uid ? styles.announcementContainerYou : styles.announcementContainerOthers]}
      onPress={() => {
        setPlayedInClassroomsModalIds(item.playedInClassrooms ? item.playedInClassrooms : [])
        setShowPlayedInClassroomsModal(true)
      }}>
      <View style={styles.announcementSenderView}>
        <Text style={styles.announcementSenderName}>{(currentUser.uid == item.publishedBy.uid ? 'You' : item.publishedBy.displayName)}</Text>
        <Text style={styles.announcementIsGroup}>{item.announcement_type == 'group'? '(Group)':''}</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.announcementIconView}>
            <TouchableOpacity style={styles.audioButton}
              onPress={() => {
                if (playingAnnouncementId === item.id) {
                  pauseSound();
                } else {
                  playSound(item.audioUrl, item.id);
                }
              }}
            >
              <Ionicons
                name={playingAnnouncementId === item.id ? 'pause' : 'play'}
                size={24}
                color={'white'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.announcementDetailsView}>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={(playingAnnouncementId === item.id) ? playableDurationMillis : 10}
              value={(playingAnnouncementId === item.id) ? positionMillis : 0}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
              thumbTintColor="#fff"
            />
          </View>
          <View style={styles.announcementPicView}>
            <CircleImage source={{ uri: item.publishedBy.photoURL }} size={50} />
          </View>
        </View>

        <View style={styles.announcementDurAndTime}>
          <Text style={{ flex: 1, textAlign: 'left', color: '#ccc' }}>{item.duration}</Text>
          <Text style={{ flex: 1, textAlign: 'right', color: '#ccc' }}>{`${formatFirestoreTimestamp(item.announcementTime)}`}</Text>
        </View>

        <View style={styles.announcementNoteView}>
          <Text style={styles.announcementNote}>{`${item.note}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.chatContainer}>
        <FlatList
          inverted
          data={[...announcements].reverse()}
          // data={announcements}
          keyExtractor={item => item.id.toString()}
          renderItem={renderAnnouncements}
          // contentContainerStyle={{borderWidth: 2}}
          ListHeaderComponent={<View style={{ marginBottom: 75 }}></View>}
        />

        <View style={styles.recordingViewContainer}>
          <RecordingsView handleSend={handleSendAudio} />
        </View>
        <PlayedInClassroomsModal isVisible={showPlayedInClassroomsModal} classroomIds={playedInClassroomsModalIds} onClose={() => setShowPlayedInClassroomsModal(false)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme[themeMode]['background-quaternary'],
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    color: theme[themeMode]['text-primary'],
  },
  optionsButton: {},
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    // paddingBottom: 100
  },
  announcementContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    backgroundColor: '#128C7E',
    width: '75%',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  announcementContainerYou: {
    borderTopLeftRadius: 20,
    alignSelf: 'flex-end'
  },
  announcementContainerOthers: {
    borderTopRightRadius: 20,
  },
  announcementSenderView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementSenderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
    color: 'white'
  },
  announcementIsGroup: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
    color: 'white'
  },
  announcementIconView: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  audioButton: {
    // backgroundColor: '#128C7E',
    backgroundColor: '#075E54',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementDetailsView: {
    flex: 1,
    justifyContent: 'center',
  },
  announcementDurAndTime: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  announcementPicView: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    marginRight: 10
  },
  announcementNoteView: {
    width: '99%',
    paddingHorizontal: 10,
    marginBottom: 2,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  announcementNote: {
    color: '#000'
  },

  recordingViewContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1, // add border width
    // borderColor: 'black' // add border color
  },
});

export default ChatPage;
