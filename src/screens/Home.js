import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

const Home = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prevDuration => prevDuration + 1);
            }, 1000);
        } else {
            clearInterval(interval);
            setDuration(0);
        }

        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = () => {
        setIsRecording(true);
        setDuration(0);

        // Start recording logic here
    };

    const stopRecording = () => {
        setIsRecording(false);

        // Stop recording logic here
    };

    const pauseRecording = () => {
        setIsRecording(false);

        // Pause recording logic here
    };

    const deleteRecording = () => {
        setIsRecording(false);
        setDuration(0);

        // Delete recording logic here
    };

    const sendRecording = () => {
        setIsRecording(false);
        setDuration(0);

        // Send recording logic here
    };

    return (
        <View style={styles.container}>
            <View style={styles.recordingButton}>
                {isRecording ? (
                    <>
                        <TouchableOpacity onPress={deleteRecording} style={[styles.deleteIcon]}>
                            <Ionicons name="trash-outline" size={32} color="#999" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={isRecording ? pauseRecording : startRecording} style={[styles.recordingIcon, isRecording && styles.recordingActive]}>
                            {isRecording ? (
                                <Ionicons name="pause-outline" size={32} color="#fff" />
                            ) : (
                                <Ionicons name="mic-sharp" size={32} color="#fff" />
                            )}
                        </TouchableOpacity>
                        
                        <View style={styles.durationContainer}>
                            <Text style={styles.durationText}>{duration} s</Text>
                        </View>

                        <TouchableOpacity onPress={startRecording} style={[styles.sendIcon]}>
                            <Ionicons name="send-outline" size={32} color="#fff" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={isRecording ? pauseRecording : startRecording} style={[styles.recordingIcon, isRecording && styles.recordingActive]}>
                        <Ionicons name="mic-sharp" size={32} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 32,
    },
    recordingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 16,
        elevation: 2,
    },
    recordingIcon: {
        backgroundColor: '#999',
        borderRadius: 50,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingActive: {
        backgroundColor: '#f00',
    },
    deleteIcon: {
        backgroundColor: '#fff',
        borderRadius: 50,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    sendIcon: {
        backgroundColor: '#3cb371',
        borderRadius: 50,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    durationContainer: {
        marginLeft: 16,
    },
    durationText: {
        color: '#000',
        fontWeight: 'bold',
    },
});

export default Home;
