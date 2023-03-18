import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import RecordingAudioGraph from '../components/RecordingAudioGraph'

const Home = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState()
    const [lastRecording, setLastRecording] = useState(null)
    const [isPaused, setIsPaused] = useState(false);

    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingInterval, setRecordingInterval] = useState(null);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();

            if (permission.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });


                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );

                setRecording(recording);
                setIsRecording(true);
                setRecordingDuration(0);
                setRecordingInterval(setInterval(() => {
                    setRecordingDuration(prevDuration => prevDuration + 1000);
                }, 1000));
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Problem',
                    text2: 'Permission denied'
                });
            }
        } catch (error) {
            console.error('Failed to start recording', error)
        }

    };

    const stopRecording = async () => {
        setIsRecording(false);
        setRecording(undefined);
        clearInterval(recordingInterval);
        await recording.stopAndUnloadAsync();

        const { sound, status } = await recording.createNewLoadedSoundAsync();
        let updatedRecordings = {
            sound: sound,
            duration: getDurationFormatted(status.durationMillis),
            file: recording.getURI()
        }

        setLastRecording(updatedRecordings);
    };

    const pauseRecording = async () => {
        setIsPaused(true)
        Toast.show({ type: 'success', text1: 'Recording', text2: 'paused' });
        recording.pauseAsync()
        clearInterval(recordingInterval);
    };

    const resumeRecording = async () => {
        setIsPaused(false);
        Toast.show({ type: 'success', text1: 'Recording', text2: 'resume' });
        recording.startAsync()
        setRecordingInterval(setInterval(() => {
            setRecordingDuration(prevDuration => prevDuration + 1000);
        }, 1000));
    }

    const deleteRecording = async () => {
        await stopRecording()

        // Delete recording logic here
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'message'
        });
    };

    const sendRecording = async () => {
        await stopRecording()

        // Send recording logic here
    };

    const getDurationFormatted = (millis) => {
        const minutes = millis / 1000 / 60
        const minutesDisplay = Math.floor(minutes)
        const seconds = Math.round((minutes - minutesDisplay) * 60)
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
        return `${minutesDisplay}:${secondsDisplay}`
    }

    return (
        <View style={styles.container}>
            <Text>Help</Text>
            {lastRecording && (
                <View style={styles.row}>
                    <Text style={styles.fill}>Recording - {lastRecording.duration}</Text>
                    <Button style={styles.button} onPress={() => lastRecording.sound.replayAsync()} title="Play"></Button>
                    <Button style={styles.button} onPress={() => Sharing.shareAsync(lastRecording.file)} title="Share"></Button>
                </View>
            )}
            <View style={styles.recordingButton}>
                {isRecording ? (
                    <>
                        <TouchableOpacity onPress={deleteRecording} style={[styles.deleteIcon]}>
                            <Ionicons name="trash-outline" size={26} color="#999" />
                        </TouchableOpacity>

                        <View style={styles.durationContainer}>
                            <Text style={styles.durationText}>{getDurationFormatted(recordingDuration)}</Text>
                        </View>

                        <RecordingAudioGraph isPlaying={!isPaused} />

                        <TouchableOpacity onPress={isPaused ? resumeRecording : pauseRecording} style={[styles.recordingIcon1, isRecording && styles.recordingActive]}>
                            {isPaused ? (
                                <Ionicons name="mic-sharp" size={26} color="#fff" />
                            ) : (
                                <Ionicons name="pause-outline" size={26} color="#fff" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={sendRecording} style={[styles.sendIcon]}>
                            <Ionicons name="send-outline" size={26} color="#fff" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={isRecording ? pauseRecording : startRecording} style={[styles.recordingIcon, isRecording && styles.recordingActive]}>
                        <Ionicons name="mic-sharp" size={26} color="#fff" />
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
        padding: 10,
        elevation: 2,
    },
    recordingIcon: {
        backgroundColor: '#999',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingIcon1: {
        backgroundColor: '#999',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    recordingActive: {
        backgroundColor: '#f00',
    },
    deleteIcon: {
        backgroundColor: '#fff',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    sendIcon: {
        backgroundColor: '#3cb371',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    durationContainer: {
        marginHorizontal: 5,
    },
    durationText: {
        color: '#000',
        fontWeight: 'bold',
    },
});

export default Home;