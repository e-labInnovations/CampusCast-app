import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { where, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

const ChatPage = ({ navigation, route }) => {
  const { chatItem } = route.params;
  const [sound, setSound] = useState(null);
  const [playingAnnouncementId, setPlayingAnnouncementId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (chatItem.type == 'group') {
      const groupId = chatItem.id;
      const announcementsRef = collection(FIREBASE_DB, 'announcements');
      const _query = query(
        announcementsRef, where('recipients.groupsIds', 'array-contains', groupId),
        orderBy('announcementTime', 'asc')
      );

      const announcementsSubscriber = onSnapshot(_query, {
        next: (snapshot) => {
          const _announcements = []
          snapshot.docs.forEach(doc => {
            let _announcement = doc.data()
            _announcement.id = doc.id
            _announcements.push(_announcement)
          })

          setAnnouncements(_announcements)
        },
        error: (error) => {
          console.error('Error fetching announcements:', error)
        }
      })

    } else if (chatItem.type == 'classroom') {
      const classroomId = chatItem.id;
      const groupIds = chatItem.groupsIds
      const announcementsRef = collection(FIREBASE_DB, 'announcements');
      const _query = query(
        announcementsRef,
        where('recipients.classroomIds', 'array-contains', classroomId),
        // where('recipients.groupsIds', 'in', groupIds),
        // where('recipients.groupsIds', 'array-contains-any', groupIds),
        orderBy('announcementTime', 'asc')
      );

      const announcementsSubscriber = onSnapshot(_query, {
        next: (snapshot) => {
          const _announcements = []
          snapshot.docs.forEach(doc => {
            let _announcement = doc.data()
            _announcement.id = doc.id
            _announcements.push(_announcement)
          })

          setAnnouncements(_announcements)
        },
        error: (error) => {
          console.error('Error fetching announcements:', error)
        }
      })
    }

  }, [])


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
      () => setPlayingAnnouncementId(id)
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

  const renderAnnouncements = ({ item }) => (
    <View style={styles.announcementContainer}>
      <View>
        <Text style={styles.announcementSenderName}>{item.publishedBy}</Text>
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
              maximumValue={10}
              value={0}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
            />

            {/* <Text style={styles.audioSenderName}>{`${item.note}s`}</Text> */}
          </View>
          <View style={styles.announcementPicView}>
            <Image
              style={{ width: 50, height: 50 }}
              source={{ uri: 'https://ui-avatars.com/api/?name=T4A&background=random&color=fff&length=3&rounded=true' }}
            />
          </View>
        </View>

        <View style={styles.announcementDurAndTime}>
          <Text style={{ flex: 1, textAlign: 'left', color: '#ccc' }}>{item.duration}</Text>
          <Text style={{ flex: 1, textAlign: 'right', color: '#ccc' }}>{`${formatFirestoreTimestamp(item.announcementTime)}`}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <Image
            style={styles.userAvatar}
            source={{ uri: chatItem.image }}
          />
          <Text style={styles.userName}>{chatItem.name}</Text>
        </View>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.chatContainer}>
        <FlatList
          data={announcements}
          keyExtractor={item => item.id.toString()}
          renderItem={renderAnnouncements}
          initialScrollIndex={announcements.length - 1}
        />
        {/* {announcements.map((announcement) => renderAnnouncements(announcement))} */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ededed',
    marginTop: StatusBar.currentHeight
  },
  header: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 10,
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
    color: 'white',
  },
  optionsButton: {},
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  announcementContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    backgroundColor: '#128C7E',
    width: '75%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    // borderRadius: 20
  },
  announcementSenderName: {
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
});

export default ChatPage;
