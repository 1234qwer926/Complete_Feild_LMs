import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Loader, SimpleGrid, Table, Group, ActionIcon } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import axios from 'axios'; // Import axios directly
import { CourseDetail } from './CourseDetail';
import { CourseCard } from './CourseCard';

export function Subject() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // This should be fetched from user context later
  const group = 'bl';

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- START OF CHANGE ---
        // Add the configuration object directly to the Axios call
        const response = await axios.get('http://localhost:8081/api/subjects', {
          withCredentials: true, // This tells Axios to send the HttpOnly cookie
        });
        // --- END OF CHANGE ---

        const filteredSubjects = response.data[group] || [];
        setSubjects(filteredSubjects);
      } catch (err) {
        setError('Failed to fetch subjects. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [group]); // Add group to dependency array

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setCourses(subject.courses || []);
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
              <CourseCard key={course.id} course={course} onSelectCourse={handleSelectCourse} />
            ))}
          </SimpleGrid>
        ) : (
          <Text ta="center" c="dimmed">No courses available for {selectedSubject.subjectName}.</Text>
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
              <Table.Th>Courses</Table.Th>
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
