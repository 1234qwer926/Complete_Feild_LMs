import React, { useState, useEffect } from 'react';
import { Container, Title, Table, Text, Button } from '@mantine/core';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function UserResults() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { courseName } = location.state || { courseName: 'Course' };
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserResults = async () => {
      setLoading(true);
      try {
        // --- START OF UPDATE ---
        const response = await axios.get(`http://localhost:8081/api/results/course/${courseId}`, {
          withCredentials: true,
        });
        // --- END OF UPDATE ---
        setResults(response.data);
      } catch (error) {
        console.error(`Error fetching user results for course ${courseId}:`, error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchUserResults();
    }
  }, [courseId]);

  const handleUserClick = (user) => {
    navigate(`/assignment-review/${courseId}/${user.userId}`, { state: { username: user.username } });
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">{courseName} - User Results</Title>
      {loading ? (
        <Text ta="center" c="dimmed">Loading user results...</Text>
      ) : results.length > 0 ? (
        <Table highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>Average Score</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map((user) => (
              <Table.Tr key={`${courseId}-${user.userId}`}>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.score.toFixed(2)}%</Table.Td>
                <Table.Td>
                  <Button variant="outline" size="xs" onClick={() => handleUserClick(user)}>
                    View Details
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text ta="center" c="dimmed">No user results found for this course.</Text>
      )}
    </Container>
  );
}
