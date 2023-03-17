import React from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';

const chatsData = [
  { id: 1, name: 'John Doe', message: 'Hello!', time: '12:00 PM', image: require('../../assets/images/man.png') },
  { id: 2, name: 'Jane Smith', message: 'How are you?', time: '11:30 AM', image: require('../../assets/images/man.png') },
  { id: 3, name: 'Bob Johnson', message: 'See you later', time: '10:45 AM', image: require('../../assets/images/man.png') },
  { id: 4, name: 'Alice Brown', message: '👍', time: '9:15 AM', image: require('../../assets/images/man.png') },
  { id: 5, name: 'Tom Wilson', message: 'Call me later', time: '8:30 AM', image: require('../../assets/images/man.png') },
];

const ChatList = () => {
  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    marginBottom: 10,
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
});

export default ChatList;
