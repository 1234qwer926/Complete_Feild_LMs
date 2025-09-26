import React, { useState, useEffect } from 'react';
import { Container, Table, Title, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ResultManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseResults = async () => {
      setLoading(true);
      try {
        // --- START OF UPDATE ---
        const response = await axios.get(`http://localhost:8081/api/results`, {
          withCredentials: true,
        });
        // --- END OF UPDATE ---
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

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Result Management</Title>
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
