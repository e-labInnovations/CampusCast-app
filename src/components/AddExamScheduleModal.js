import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import DatePicker from 'react-native-date-picker';
import theme from '../theme';
let themeMode = theme.themeMode

const AddExamScheduleModal = ({ visible, onClose }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [startAt, setStartAt] = useState(new Date());
    const [endAt, setEndAt] = useState(new Date());

    const handleCancel = () => {
        onClose();
    };

    const handleSchedule = () => {
        console.log('Exam Schedule Saved');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <Text style={styles.title}>Add New Exam Schedule</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Title:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter title"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date:</Text>
                    <DatePicker
                        date={date}
                        onDateChange={setDate}
                        mode="date"
                        textColor="#000"
                        style={styles.datePicker}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Start Time:</Text>
                    <DatePicker
                        date={startAt}
                        onDateChange={setStartAt}
                        mode="time"
                        textColor="#000"
                        minuteInterval={5}
                        style={styles.datePicker}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>End Time:</Text>
                    <DatePicker
                        date={endAt}
                        onDateChange={setEndAt}
                        mode="time"
                        textColor="#000"
                        minuteInterval={5}
                        style={styles.datePicker}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.scheduleButton]} onPress={handleSchedule}>
                        <Text style={styles.buttonText}>Schedule</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default AddExamScheduleModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
        
    },
    label: {
        width: 120,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
    },
    datePicker: {
        height: 100,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme[themeMode]['primary'],
        marginRight: 10,
    },
    scheduleButton: {
        backgroundColor: theme[themeMode]['secondary'],
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
