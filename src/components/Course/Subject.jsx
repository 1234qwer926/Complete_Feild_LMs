import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Loader, SimpleGrid, Table, Group, ActionIcon } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import axios from 'axios';
import { CourseDetail } from './CourseDetail';
import { CourseCard } from './CourseCard';
import { useAuth } from '../../AuthContext';

export function Subject() {
    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [completions, setCompletions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const { user } = useAuth();
    const group = user?.groupName ?? '';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [subjectsResponse, completionsResponse] = await Promise.all([
                    axios.get('http://localhost:8081/api/subjects', { withCredentials: true }),
                    axios.get('http://localhost:8081/api/completions/user', { withCredentials: true })
                ]);
                
                const allSubjects = subjectsResponse.data[group] || [];
                setSubjects(allSubjects);
                setCompletions(completionsResponse.data);
                console.log(completionsResponse.data)

            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, group]);

    const isPrerequisiteCompleted = (courseName) => {
        const completionRecord = completions.find(c => c.courseName === courseName);
        return completionRecord && completionRecord.learningCompletion && completionRecord.assignmentCompletion;
    };

    const hasSufficientDays = (requiredDays) => {
        if (requiredDays == null) return true;
        if (!user?.dateOfJoining) return false;

        const joiningDate = new Date(user.dateOfJoining);
        const today = new Date();
        const timeDiff = today.getTime() - joiningDate.getTime();
        const daysSinceJoining = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        return daysSinceJoining >= requiredDays;
    };

    const filterAndSetCourses = (subject) => {
        const visibleCourses = (subject.courses || []).filter(course => {
            const hasDays = hasSufficientDays(course.daysOfJoining);
            
            if (course.preRequisiteCourseName) {
                const hasPrereq = isPrerequisiteCompleted(course.preRequisiteCourseName);
                return hasDays && hasPrereq;
            } else {
                return hasDays;
            }
        });
        setCourses(visibleCourses);
    };

    const handleSelectSubject = (subject) => {
        setSelectedSubject(subject);
        filterAndSetCourses(subject);
    };

    const handleBackToSubjects = () => {
        setSelectedSubject(null);
        setCourses([]);
        setSelectedCourse(null);
    };

    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
    };

    const handleBackToCourses = () => {
        setSelectedCourse(null);
    };

    if (selectedCourse) {
        return <CourseDetail course={selectedCourse} onBack={handleBackToCourses} />;
    }

    if (selectedSubject) {
        return (
            <Container size="xl" py="xl">
                <Group justify="space-between" mb="md">
                    <Title order={2}>{selectedSubject.subjectName} Courses</Title>
                    <ActionIcon onClick={handleBackToSubjects} variant="outline" color="blue">
                        <IconArrowRight style={{ transform: 'rotate(180deg)' }} />
                    </ActionIcon>
                </Group>
                {courses.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={{...course, groupName: group}} onSelectCourse={handleSelectCourse} />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text ta="center" c="dimmed">No courses are currently available for you in {selectedSubject.subjectName}.</Text>
                )}
            </Container>
        );
    }
    

    return (
        <Container size="xl" py="xl">
            <Title order={2} ta="center" mb="md">Subject Catalog ({group.toUpperCase()} Group)</Title>
            {loading ? (
                <Group justify="center"><Loader /><Text>Loading subjects...</Text></Group>
            ) : error ? (
                <Text ta="center" c="red">{error}</Text>
            ) : subjects.length > 0 ? (
                <Table highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Subject Name</Table.Th>
                            <Table.Th>Total Courses</Table.Th>
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {subjects.map((subject) => (
                            <Table.Tr key={subject.id}>
                                <Table.Td>{subject.subjectName}</Table.Td>
                                <Table.Td>{subject.courses.length}</Table.Td>
                                <Table.Td>
                                    <ActionIcon onClick={() => handleSelectSubject(subject)} variant="filled" color="blue">
                                        <IconArrowRight />
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            ) : (
                <Text ta="center" c="dimmed">No subjects available for the {group.toUpperCase()} group.</Text>
            )}
        </Container>
    );
}
