import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import LottieView from 'lottie-react-native';

const RecordingAudioGraph = ({ isPlaying }) => {
    const animation = useRef(null);
    useEffect(() => {
        if (animation.current) {
            isPlaying ? animation.current.play() : animation.current.pause();
        }
    }, [isPlaying]);

    return (
        <View style={styles.container}>
            <LottieView
                source={require('../../assets/8490-audio-wave-micro-interaction.json')}
                autoPlay
                ref={animation}
                resizeMode="contain"
                style={{
                    width: 100,
                    height: 100,
                    backgroundColor: 'transparent',
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40,
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default RecordingAudioGraph;
