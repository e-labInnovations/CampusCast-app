import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CircleImage = ({ source, size = 100, style }) => {
    return (
        <View style={[/*styles.outerContainer,*/ {
            width: size+10,
            height: size+10,
            borderRadius: (size/2)+5,
        }]}>
            <View style={[styles.innerContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
                <Image source={source} style={styles.image} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        overflow: 'hidden', // to clip the image to the circle
        borderWidth: 2, // optional border width
        borderColor: '#fff', // optional border color
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
});

export default CircleImage;
