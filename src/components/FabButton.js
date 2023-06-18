import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import theme from '../theme'

let themeMode = theme.themeMode

const FabButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.fabContainer} onPress={onPress}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    fabContainer: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      backgroundColor: theme[themeMode]['primary'],
      borderRadius: 28,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
    },
  })

export default FabButton