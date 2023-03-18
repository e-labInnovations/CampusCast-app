import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import RecordingAudioGraph from '../components/RecordingAudioGraph'

const Home = () => {
    // Refs for the audio
    const AudioRecorder = useRef(new Audio.Recording());
    const AudioPlayer = useRef(new Audio.Sound());

    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState()
    const [lastRecording, setLastRecording] = useState({})
    const [recordedURI, setRecordedURI] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingInterval, setRecordingInterval] = useState(null);

    const [isReadyToSend, setIsReadyToSend] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();

            if (permission.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });


                await AudioRecorder.current.prepareToRecordAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );

                // Start recording
                await AudioRecorder.current.startAsync();

                setIsRecording(true);
                setIsReadyToSend(false)
                setIsPlaying(false)
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
        try {
            clearInterval(recordingInterval);
            await AudioRecorder.current.stopAndUnloadAsync();

            const result = AudioRecorder.current.getURI();
            if (result)
                setRecordedURI(result);

            // Reset the Audio Recorder
            AudioRecorder.current = new Audio.Recording();
        } catch (error) {
            console.log(error);
        }
    };

    const pauseRecording = async () => {
        setIsPaused(true)
        Toast.show({ type: 'success', text1: 'Recording', text2: 'paused' });
        AudioRecorder.current.pauseAsync()
        clearInterval(recordingInterval);
    };

    const resumeRecording = async () => {
        setIsPaused(false);
        Toast.show({ type: 'success', text1: 'Recording', text2: 'resume' });
        AudioRecorder.current.startAsync()
        setRecordingInterval(setInterval(() => {
            setRecordingDuration(prevDuration => prevDuration + 1000);
        }, 1000));
    }

    const deleteRecording = async () => {
        if (isReadyToSend) {
            setIsRecording(false);
        } else {
            await stopRecording()
            setIsRecording(false);
        }
    };

    const sendRecording = async () => {
        if (!isReadyToSend) {
            await stopRecording()
            setIsReadyToSend(true)
        } else {
            Sharing.shareAsync(recordedURI)
            setIsRecording(false);
        }
    };

    const PlayRecordedAudio = async () => {
        try {
            console.log('\nplayFile', recordedURI);
            AudioPlayer.current = new Audio.Sound()
            await AudioPlayer.current.loadAsync({ uri: recordedURI }, {}, true);

            // Get Player Status
            const playerStatus = await AudioPlayer.current.getStatusAsync();

            // Play if song is loaded successfully
            if (playerStatus.isLoaded) {
                if (playerStatus.isPlaying === false) {
                    AudioPlayer.current.playAsync();
                    setIsPlaying(true);
                }
            }
        } catch (error) {
            console.error('PlayError: ', error);
        }
    }

    const StopPlaying = async () => {
        try {
            //Get Player Status
            const playerStatus = await AudioPlayer.current.getStatusAsync();

            // If song is playing then stop it
            if (playerStatus.isLoaded === true)
                await AudioPlayer.current.unloadAsync();

            setIsPlaying(false);
        } catch (error) { }
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

            <View style={styles.recordingButton}>
                {isRecording ? (
                    <>
                        <TouchableOpacity onPress={deleteRecording} style={[styles.deleteIcon]}>
                            <Ionicons name="trash" size={26} color="#999" />
                        </TouchableOpacity>

                        {isReadyToSend ? (
                            <>
                                <TouchableOpacity onPress={isPlaying ? StopPlaying : PlayRecordedAudio} style={[styles.sendIcon, isPlaying ? styles.stopPlayingBtn : styles.playBtn]}>
                                    {isPlaying ? (
                                        <Ionicons name="stop" size={26} color="#fff" />
                                    ) : (
                                        <Ionicons name="play" size={26} color="#fff" />
                                    )}
                                </TouchableOpacity>


                                <View style={styles.durationContainer}>
                                    <Text style={styles.durationText}>{lastRecording.duration}</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.durationContainer}>
                                    <Text style={styles.durationText}>{getDurationFormatted(recordingDuration)}</Text>
                                </View>

                                <RecordingAudioGraph isPlaying={!isPaused} />
                            </>
                        )}

                        {!isReadyToSend &&
                            <TouchableOpacity onPress={isPaused ? resumeRecording : pauseRecording} style={[styles.recordingIcon1, isRecording && styles.recordingActive]}>
                                {isPaused ? (
                                    <Ionicons name="mic-sharp" size={26} color="#fff" />
                                ) : (
                                    <Ionicons name="pause" size={26} color="#fff" />
                                )}
                            </TouchableOpacity>
                        }

                        <TouchableOpacity onPress={sendRecording} style={[styles.sendIcon]}>
                            <Ionicons name="send" size={26} color="#fff" />
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
    playBtn: {
        backgroundColor: '#3cb371'
    },
    stopPlayingBtn: {
        backgroundColor: '#f00'
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