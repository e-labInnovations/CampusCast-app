import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

const AnnouncementDetailsModal = ({ showModal }) => {
  return (
    <View>
      <Modal isVisible={showModal} style={styles.container}>
        <View style={{ flex: 1 }}>
          <Text>I am the modal content!</Text>
        </View>
      </Modal>
    </View>
  )
}

export default AnnouncementDetailsModal

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1
    }
})