import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Title,
    Button,
    Modal,
    TextInput,
    Select,
    MultiSelect,
    Paper,
    Group,
    Text,
    Badge,
    ActionIcon,
    SimpleGrid,
    Box
} from '@mantine/core';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8081/api';

const SubjectManagement = () => {
    const [subjectsByGroup, setSubjectsByGroup] = useState({});
    const [allCourses, setAllCourses] = useState([]); // --- MODIFIED: Renamed from 'courses' for clarity
    const [modalOpened, setModalOpened] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentSubjectId, setCurrentSubjectId] = useState(null);
    const navigate = useNavigate();

    // Form state
    const [subjectName, setSubjectName] = useState('');
    const [groupName, setGroupName] = useState('BL');
    const [selectedCourses, setSelectedCourses] = useState([]);

    // --- NEW: State to hold only the courses available for selection ---
    const [availableCourses, setAvailableCourses] = useState([]);

    const handleBack = () => {
        navigate(-1);
    };

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/subjects`, { withCredentials: true });
            const data = response.data;
            const normalizedData = Object.keys(data).reduce((acc, key) => {
                acc[key.toUpperCase()] = data[key];
                return acc;
            }, {});
            setSubjectsByGroup(normalizedData);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/courses`, { withCredentials: true });
            setAllCourses(response.data.map(course => ({
                value: course.id.toString(),
                label: course.courseName,
            })));
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchCourses();
    }, []);

    // --- NEW: Effect to calculate which courses are available for selection ---
    useEffect(() => {
        // 1. Get IDs of all courses that are already mapped to any subject.
        const mappedCourseIds = new Set();
        Object.values(subjectsByGroup).flat().forEach(subject => {
            // If we are NOT editing this specific subject, add its courses to the mapped list.
            if (subject.id !== currentSubjectId) {
                subject.courses.forEach(course => mappedCourseIds.add(course.id.toString()));
            }
        });

        // 2. Filter the full list of courses.
        const filtered = allCourses.filter(course => !mappedCourseIds.has(course.value));
        setAvailableCourses(filtered);

    }, [allCourses, subjectsByGroup, currentSubjectId]); // Recalculate when data changes or when edit mode starts

    const handleSubmit = async (e) => {
        e.preventDefault();
        const subjectData = {
            subjectName,
            groupName,
            courseIds: selectedCourses.map(id => parseInt(id)),
        };

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/subjects/${currentSubjectId}`, subjectData, { withCredentials: true });
            } else {
                await axios.post(`${API_URL}/subjects`, subjectData, { withCredentials: true });
            }
            fetchSubjects();
            setModalOpened(false);
            setSubjectName('');
            setGroupName('BL');
            setSelectedCourses([]);
            setIsEditMode(false);
            setCurrentSubjectId(null);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} subject:`, error);
        }
    };

    const handleEdit = (subject) => {
        setIsEditMode(true);
        setCurrentSubjectId(subject.id); // This triggers the useEffect to recalculate available courses
        setSubjectName(subject.subjectName);
        setGroupName(subject.groupName.toUpperCase());
        setSelectedCourses(subject.courses.map(course => course.id.toString()));
        setModalOpened(true);
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await axios.delete(`${API_URL}/subjects/${id}`, { withCredentials: true });
                fetchSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };
    
    const handleCloseModal = () => {
        setModalOpened(false);
        setIsEditMode(false);
        setCurrentSubjectId(null); // Reset current subject ID
        setSubjectName('');
        setGroupName('BL');
        setSelectedCourses([]);
    };

    const groupLabels = {
        BL: 'Group BL',
        BH: 'Group BH',
        BM: 'Group BM',
        BE: 'Group BE'
    };

    return (
        <Container size="lg">
            <Group position="apart" mb="xl">
                <Title order={2}>Subject Management</Title>
                <Button variant="light" color="blue" size="sm" leftIcon={<IconArrowLeft size={16} />} onClick={handleBack}>
                    Back
                </Button>
                <Button onClick={() => setModalOpened(true)}>Map Subject</Button>
            </Group>

            {Object.keys(groupLabels).map(groupKey => (
                subjectsByGroup[groupKey] && subjectsByGroup[groupKey].length > 0 && (
                    <Box key={groupKey} mb="xl">
                        <Title order={3} mb="md">{groupLabels[groupKey]}</Title>
                        <SimpleGrid cols={3} spacing="lg">
                            {subjectsByGroup[groupKey].map(subject => (
                                <Paper key={subject.id} shadow="sm" p="md" withBorder>
                                    <Group position="apart">
                                        <Text weight={500}>{subject.subjectName}</Text>
                                        <Group>
                                            <ActionIcon color="blue" onClick={() => handleEdit(subject)}><IconEdit size={16} /></ActionIcon>
                                            <ActionIcon color="red" onClick={() => handleDelete(subject.id)}><IconTrash size={16} /></ActionIcon>
                                        </Group>
                                    </Group>
                                    <Text size="sm" color="dimmed" mt={4}>Courses:</Text>
                                    <Group mt={5}>
                                        {subject.courses.map(course => (
                                            <Badge key={course.id} variant="light">{course.courseName}</Badge>
                                        ))}
                                    </Group>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </Box>
                )
            ))}

            <Modal
                opened={modalOpened}
                onClose={handleCloseModal} // Use the new close handler
                title={isEditMode ? "Edit Subject" : "Create a New Subject"}
            >
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Subject Name"
                        placeholder="Enter subject name"
                        required
                        value={subjectName}
                        onChange={(event) => setSubjectName(event.currentTarget.value)}
                        mb="md"
                    />
                    <Select
                        label="Group"
                        required
                        data={[
                            { value: 'BL', label: 'Group BL' },
                            // { value: 'BH', label: 'Group BH' },
                            { value: 'BM', label: 'Group BM' },
                            { value: 'BE', label: 'Group BE' },
                        ]}
                        value={groupName}
                        onChange={setGroupName}
                        mb="md"
                    />
                    <MultiSelect
                        label="Select Courses"
                        placeholder="Pick available courses"
                        // --- MODIFIED: Use the filtered list of available courses ---
                        data={availableCourses}
                        value={selectedCourses}
                        onChange={setSelectedCourses}
                        searchable
                        nothingFound="No available courses"
                        mb="xl"
                    />
                    <Button type="submit" fullWidth>
                        {isEditMode ? "Update Subject" : "Create Subject"}
                    </Button>
                </form>
            </Modal>
        </Container>
    );
};

export default SubjectManagement;

