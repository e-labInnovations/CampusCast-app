import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, FlatList, Dimensions, ScrollView } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import theme from '../theme';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

let themeMode = theme.themeMode

const AddExamScheduleModal = ({ visible, onClose }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [startAt, setStartAt] = useState(new Date());
    const [endAt, setEndAt] = useState(new Date());
    const [classrooms, setClassrooms] = useState([])
    const [selectedClassrooms, setSelectedClassrooms] = useState([])

    useEffect(() => {
        firestore().collection('devices')
            .get()
            .then(querySnapshot => {
                const _classrooms = []
                querySnapshot.forEach(doc => {
                    let _classroom = doc.data()
                    _classroom.id = doc.id
                    _classrooms.push(_classroom)
                })

                console.log("🚀 ~ file: AddExamScheduleModal.js:40 ~ classroomsSubscriber ~ _classroom:", _classrooms)
                setClassrooms(_classrooms)
            })
            .catch(error => {
                console.log('Error getting classrooms: ', error);
            });
    }, [])


    const handleCancel = () => {
        onClose();
    };

    const isClassroomSelected = (id) => {
        return selectedClassrooms.find(classroom => classroom.id == id) ? true : false
    }

    const handleClassroomSelection = (id) => {
        if (isClassroomSelected(id)) {
            const _classrooms = selectedClassrooms.filter(classroom => classroom.id !== id);
            setSelectedClassrooms(_classrooms);
        } else {
            const selectedClassroom = classrooms.find(classroom => classroom.id === id);
            if (selectedClassroom) {
                setSelectedClassrooms(prevState => [...prevState, selectedClassroom]);
            }
        }
    };

    const handleSchedule = () => {
        if (title == "") {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Empty title'
            });
            // onClose();
        } else {
            const _startAt = new Date(startAt);
            _startAt.setHours(startAt.getHours());
            _startAt.setMinutes(startAt.getMinutes());
            _startAt.setSeconds(0);

            const _endAt = new Date(endAt);
            _endAt.setHours(endAt.getHours());
            _endAt.setMinutes(endAt.getMinutes());
            _endAt.setSeconds(0);

            let _selectedClassrooms = selectedClassrooms.map(classroom => classroom.id)

            firestore()
                .collection('exam_schedules')
                .add({
                    title: title,
                    classroomIds: _selectedClassrooms,
                    startAt: _startAt,
                    endAt: _endAt,
                    publishedBy: auth().currentUser.uid

                })
                .then(() => {
                    console.log('New exam scheduled');
                    onClose();
                });

        }
    };

    const renderClassrooms = () => {
        const gridItems = [];
        const { length } = classrooms;

        for (let i = 0; i < length; i += 4) {
            const rowItems = classrooms.slice(i, i + 4);

            const renderedRow = (
                <View style={styles.gridRow} key={i}>
                    {rowItems.map((classroom) => (
                        <TouchableOpacity
                            style={isClassroomSelected(classroom.id) ? styles.classroomItemSelected : styles.classroomItem}
                            onPress={() => handleClassroomSelection(classroom.id)}
                            key={classroom.id}
                        >
                            <Text style={styles.classroomName}>{classroom.classroomCode}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );

            gridItems.push(renderedRow);
        }

        return gridItems;
    };


    return (
        <Modal visible={visible} animationType="slide" propagateSwipe={true}>
            <ScrollView>
                <View style={styles.container}>
                    <Toast />
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
                            minimumDate={new Date()}
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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Classrooms:</Text>
                        <View style={styles.gridContainer}>
                            {renderClassrooms()}
                        </View>
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
            </ScrollView>
        </Modal>
    );
};

export default AddExamScheduleModal;

const { width } = Dimensions.get('window');
const itemWidth = width / 4;

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
        width: '100%',
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
    gridContainer: {
        alignItems: 'center',
    },
    classroomItem: {
        // width: itemWidth - 20, // Subtract margin and padding
        margin: 3,
        paddingHorizontal: 5,
        backgroundColor: theme[themeMode]['danger'],
        borderRadius: 5,
    },
    classroomItemSelected: {
        // width: itemWidth - 20, // Subtract margin and padding
        margin: 3,
        paddingHorizontal: 5,
        backgroundColor: theme[themeMode]['secondary'],
        borderRadius: 5,
    },
    classroomName: {
        color: '#fff',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});
