import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const audioMessages = [
  {
    id: 1,
    sender: 'John',
    audioUri: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
    duration: 12,
    isPlaying: false,
  },
  {
    id: 2,
    sender: 'Jane',
    audioUri: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
    duration: 17,
    isPlaying: false,
  },
];

const WhatsAppAudioChatPage = () => {
  const [sound, setSound] = useState(null);
  const [playingMessageId, setPlayingMessageId] = useState(null);

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
      () => setPlayingMessageId(id)
    );
    setSound(newSound);
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
    setPlayingMessageId(null);
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    setPlayingMessageId(null);
  };

  const renderAudioMessage = (message) => {
    return (
      <View style={styles.audioMessageContainer} key={message.id}>
        <TouchableOpacity
          style={styles.audioButton}
          onPress={() => {
            if (playingMessageId === message.id) {
              pauseSound();
            } else {
              playSound(message.audioUri, message.id);
            }
          }}
        >
          <Ionicons
            name={playingMessageId === message.id ? 'pause' : 'play'}
            size={24}
            color={playingMessageId === message.id ? 'white' : 'black'}
          />
        </TouchableOpacity>
        <View style={styles.audioDurationContainer}>
          <Text style={styles.audioSenderName}>{message.sender}</Text>
          <Text style={styles.audioDurationText}>{`${message.duration}s`}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <Image
            style={styles.userAvatar}
            source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
          />
          <Text style={styles.userName}>John</Text>
        </View>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.chatContainer}>
        {audioMessages.map((message) => renderAudioMessage(message))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ededed',
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
    audioMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    audioButton: {
      backgroundColor: '#128C7E',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    audioDurationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    audioSenderName: {
      fontWeight: 'bold',
      marginRight: 5,
    },
    audioDurationText: {},
  });

export default WhatsAppAudioChatPage;
