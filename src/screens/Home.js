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
    const [recordedURI, setRecordedURI] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    const [recordingDuration, setRecordingDuration] = useState(0);

    const [isReadyToSend, setIsReadyToSend] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false);
    const [playableDurationMillis, setPlayableDurationMillis] = useState(0);
    const [positionMillis, setPositionMillis] = useState(0);

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

                AudioRecorder.current.setOnRecordingStatusUpdate(onRecordingStatusUpdate)

                // Start recording
                await AudioRecorder.current.startAsync();

                setIsRecording(true);
                setIsReadyToSend(false)
                setIsPlaying(false)
                setIsPaused(false);
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
            await AudioRecorder.current.stopAndUnloadAsync();

            const result = AudioRecorder.current.getURI();
            if (result)
                setRecordedURI(result);

            const status = await AudioRecorder.current.getStatusAsync();
            setPlayableDurationMillis(status.durationMillis)

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
    };

    const resumeRecording = async () => {
        setIsPaused(false);
        Toast.show({ type: 'success', text1: 'Recording', text2: 'resume' });
        AudioRecorder.current.startAsync()
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
            AudioPlayer.current = new Audio.Sound()
            AudioPlayer.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
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

    const onPlaybackStatusUpdate = (status) => {
        setPositionMillis(status.positionMillis)

        if (status.positionMillis == status.playableDurationMillis) {
            setIsPlaying(false)
        }
    }

    const onRecordingStatusUpdate = (status) => {
        setRecordingDuration(status.durationMillis)
    }


    const getDurationFormatted = (millis) => {
        if (!millis) return '00:00'
        const minutes = millis / 1000 / 60
        let minutesDisplay = Math.floor(minutes)
        const seconds = Math.round((minutes - minutesDisplay) * 60)
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
        minutesDisplay = minutesDisplay < 10 ? '0' + minutesDisplay : minutesDisplay
        return `${minutesDisplay}:${secondsDisplay}`
    }

    return (
        <View style={styles.container}>
            <Text>Help</Text>

            <View style={styles.recordingView}>
                {isRecording ? (
                    <>
                        <TouchableOpacity onPress={deleteRecording} style={[styles.deleteButton]}>
                            <Ionicons name="trash" size={26} color="#999" />
                        </TouchableOpacity>

                        {isReadyToSend ? (
                            <>
                                <TouchableOpacity onPress={isPlaying ? StopPlaying : PlayRecordedAudio} style={[styles.sendButton, isPlaying ? styles.stopPlayingButton : styles.playButton]}>
                                    {isPlaying ? (
                                        <Ionicons name="stop" size={26} color="#fff" />
                                    ) : (
                                        <Ionicons name="play" size={26} color="#fff" />
                                    )}
                                </TouchableOpacity>


                                <View style={styles.durationContainer}>
                                    <Text style={styles.durationText}>{getDurationFormatted(isPlaying ? positionMillis : playableDurationMillis)}</Text>
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
                            <TouchableOpacity onPress={isPaused ? resumeRecording : pauseRecording} style={[styles.recordingButton1, isRecording && styles.recordingActive]}>
                                {isPaused ? (
                                    <Ionicons name="mic-sharp" size={26} color="#fff" />
                                ) : (
                                    <Ionicons name="pause" size={26} color="#fff" />
                                )}
                            </TouchableOpacity>
                        }

                        <TouchableOpacity onPress={sendRecording} style={[styles.sendButton]}>
                            <Ionicons name="send" size={26} color="#fff" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={isRecording ? pauseRecording : startRecording} style={[styles.recordingButton]}>
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
    recordingView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
        elevation: 2,
    },
    recordingButton: {
        backgroundColor: '#f00',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingButton1: {
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
    deleteButton: {
        backgroundColor: '#fff',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    sendButton: {
        backgroundColor: '#3cb371',
        borderRadius: 50,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    playButton: {
        backgroundColor: '#3cb371'
    },
    stopPlayingButton: {
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