import { StyleSheet, View, Text } from 'react-native'
import React from 'react'
import theme from '../theme'

let themeMode = theme.themeMode

const ExamSchedule = () => {
  return (
    <View style={styles.container}>
      <Text>ExamSchedule</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme[themeMode]['background-quaternary'],
  },
})

export default ExamSchedule