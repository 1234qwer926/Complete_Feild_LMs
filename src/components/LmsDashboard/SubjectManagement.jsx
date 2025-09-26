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
import { IconArrowLeft, IconSchool } from '@tabler/icons-react'; // Import necessary icons
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8081/api';

const SubjectManagement = () => {
    const [subjectsByGroup, setSubjectsByGroup] = useState({});
    const [courses, setCourses] = useState([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentSubjectId, setCurrentSubjectId] = useState(null);
    const navigate = useNavigate();
    // Form state
    const [subjectName, setSubjectName] = useState('');
    const [groupName, setGroupName] = useState('bl');
    const [selectedCourses, setSelectedCourses] = useState([]);

    const handleBack = () => {
    navigate(-1); // This is the idiomatic way to go back in react-router
  };

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/subjects`,{
        withCredentials: true,
      });
            setSubjectsByGroup(response.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/courses`,{
        withCredentials: true,
      });
            setCourses(response.data.map(course => ({
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const subjectData = {
            subjectName,
            groupName,
            courseIds: selectedCourses.map(id => parseInt(id)),
        };

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/subjects/${currentSubjectId}`, subjectData,{
        withCredentials: true,
      });
            } else {
                await axios.post(`${API_URL}/subjects`, subjectData,{
        withCredentials: true,
      });
            }
            fetchSubjects(); // Refresh the list
            setModalOpened(false); // Close modal
            // Reset form
            setSubjectName('');
            setGroupName('bl');
            setSelectedCourses([]);
            setIsEditMode(false);
            setCurrentSubjectId(null);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} subject:`, error);
        }
    };

    const handleEdit = (subject) => {
        setIsEditMode(true);
        setCurrentSubjectId(subject.id);
        setSubjectName(subject.subjectName);
        setGroupName(subject.groupName);
        setSelectedCourses(subject.courses.map(course => course.id.toString()));
        setModalOpened(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await axios.delete(`${API_URL}/subjects/${id}`,{
        withCredentials: true,
      });
                fetchSubjects(); // Refresh the list
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };

    const groupLabels = {
        bl: 'Group BL',
        bh: 'Group BH',
        bm: 'Group BM'
    };

    return (
        <Container size="lg">
            <Group position="apart" mb="xl">
                <Title order={2}>Subject Management</Title>
                <Button
                            variant="light"
                            color="blue"
                            size="sm"
                            leftIcon={<IconArrowLeft size={16} />}
                            onClick={handleBack}
                          >
                            Back
                </Button>
                <Button onClick={() => {
                    setIsEditMode(false);
                    setSubjectName('');
                    setGroupName('bl');
                    setSelectedCourses([]);
                    setModalOpened(true);
                }}>Map Subject</Button>
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
                                            <ActionIcon color="blue" onClick={() => handleEdit(subject)}>
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                            <ActionIcon color="red" onClick={() => handleDelete(subject.id)}>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                    <Text size="sm" color="dimmed" mt={4}>Courses:</Text>
                                    <Group mt={5}>
                                        {subject.courses.map(course => (
                                            <Badge key={course.id} variant="light">
                                                {course.courseName}
                                            </Badge>
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
                onClose={() => {
                    setModalOpened(false);
                    setIsEditMode(false);
                    setSubjectName('');
                    setGroupName('bl');
                    setSelectedCourses([]);
                    setCurrentSubjectId(null);
                }}
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
                            { value: 'bl', label: 'BL Group' },
                            { value: 'bh', label: 'BH Group' },
                            { value: 'bm', label: 'BM Group' },
                        ]}
                        value={groupName}
                        onChange={setGroupName}
                        mb="md"
                    />
                    <MultiSelect
                        label="Select Courses"
                        placeholder="Pick all courses you like"
                        data={courses}
                        value={selectedCourses}
                        onChange={setSelectedCourses}
                        searchable
                        nothingFound="Nothing found"
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