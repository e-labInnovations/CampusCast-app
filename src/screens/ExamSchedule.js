import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native'
import Card from '../components/Card';
import firestore from '@react-native-firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import FabButton from '../components/FabButton';
import AddExamScheduleModal from '../components/AddExamScheduleModal';
import theme from '../theme'

let themeMode = theme.themeMode

const ExamSchedule = () => {
  const [examSchedules, setExamSchedules] = useState([{
    "classroomIds": [
      "2f3s3YNWRc5d4dUT0ZR8",
      "2f3s3YNWRc5d4dUTR8",
      "2f3s3YNWRc5d4d0ZR8",
      "2f3s3YNWRc5dUT0ZR8",
      "2f3s3YNWRc4dUT0ZR8",
      "2f3s3YNW5d4dUT0ZR8",
      "2f3s3YRc5d4dUT0ZR8",
      "2f3sNWRc5d4dUT0ZR8",
    ],
    "endAt": {
      "nanoseconds": 979000000,
      "seconds": 1687071600,
    },
    "id": "sBzDJ1l3JSbJrsRZsDt7",
    "publishedBy": "user001",
    "startAt": {
      "nanoseconds": 738000000,
      "seconds": 1687062600,
    },
    "title": "Second series exam"
  },])
  const [addModalVisible, setAddModalVisible] = useState(false);

  // useEffect(() => {
  //   const examSchedulesRef = firestore().collection('exam_schedules');
  //   const groupsSubscriber = examSchedulesRef.onSnapshot(snapshot => {
  //     const _examSchedules = []
  //     snapshot.docs.forEach(doc => {
  //       let _examSchedule = doc.data()
  //       _examSchedule.id = doc.id
  //       _examSchedules.push(_examSchedule)
  //     })

  //     setExamSchedules(_examSchedules)
  //   })
  // }, [])

  const formatDate = (timestamp) => {
    const dateObj = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timestamp) => {
    const dateObj = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const hours = dateObj.getHours() % 12 || 12;
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const amPm = dateObj.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${amPm}`;
  };

  const handleOpenModal = () => {
    setAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setAddModalVisible(false);
  };


  const renderExamSchedulesItem = ({ item }) => (
    <TouchableOpacity style={styles.examScheduleItem} onPress={() => { }}>
      <Card style={styles.card}>
        <View style={styles.rowView}>
          <Text style={styles.date}>{formatDate(item.startAt)}</Text>
          <Text>{item.title}</Text>
          <Text>{formatTime(item.startAt)} - {formatTime(item.endAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={examSchedules}
        keyExtractor={item => item.id.toString()}
        renderItem={renderExamSchedulesItem}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <AddExamScheduleModal visible={addModalVisible} onClose={handleCloseModal} />
    
      <FabButton onPress={handleOpenModal} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme[themeMode]['background-light'],
  },
  examScheduleItem: {
    backgroundColor: theme[themeMode]['background-light'],
    marginHorizontal: 10,
    marginVertical: 5,
  },
  date: {
    color: theme[themeMode]['text-primary'],
    fontWeight: 'bold',
    fontSize: 18,
  },
})

export default ExamSchedule