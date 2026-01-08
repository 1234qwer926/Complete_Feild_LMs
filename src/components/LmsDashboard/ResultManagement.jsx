import React, { useState, useEffect } from 'react';
import { Container, Table, Title, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IconArrowLeft, IconSchool } from '@tabler/icons-react'; // Import necessary icons

export function ResultManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8081/api/results`, {
          withCredentials: true,
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseResults();
  }, []);

  const handleRowClick = (course) => {
    navigate(`/user-results/${course.id}`, { state: { courseName: course.courseName } });
  };

  // Function to navigate back
  const handleBack = () => {
    navigate(-1); // This is the idiomatic way to go back in react-router
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Result Management</Title>
        <Group>
          <Button
            variant="light"
            color="blue"
            size="sm"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="light"
            color="grape"
            size="sm"
            leftIcon={<IconSchool size={16} />}
            onClick={() => navigate("/subjectmanagement")}
          >
            Create Subject
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Text ta="center" c="dimmed">Loading results...</Text>
      ) : courses.length > 0 ? (
        <Table highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Course Name</Table.Th>
              <Table.Th>Average Score</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {courses.map((course) => (
              <Table.Tr key={course.id} onClick={() => handleRowClick(course)} style={{ cursor: 'pointer' }}>
                <Table.Td>{course.courseName}</Table.Td>
                <Table.Td>{course.averageScore.toFixed(2)}%</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text ta="center" c="dimmed">No results available.</Text>
      )}
    </Container>
  );
}
