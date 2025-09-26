import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Table,
  Text,
  ActionIcon,
  NumberInput,
  Group,
} from "@mantine/core";
import { IconPencil, IconDeviceFloppy } from "@tabler/icons-react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

export function AssignmentReview() {
  const { courseId, userId } = useParams();
  const location = useLocation();
  const { username } = location.state || { username: "User" };
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      setLoading(true);
      try {
        // --- UPDATED GET REQUEST ---
        const response = await axios.get(
          `http://localhost:8081/api/results/submissions/${courseId}/${userId}`,
          {
            withCredentials: true,
          }
        );
        const dataWithEditingState = response.data.map((item) => ({
          ...item,
          editing: false,
          tempScore: item.finalScore,
        }));
        setAnswers(dataWithEditingState);
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    };
    if (courseId && userId) {
      fetchAssignmentDetails();
    }
  }, [courseId, userId]);

  const handleEditToggle = (id) => {
    setAnswers(
      answers.map((item) =>
        item.id === id
          ? { ...item, editing: !item.editing, tempScore: item.finalScore }
          : item
      )
    );
  };

  const handleScoreChange = (id, value) => {
    setAnswers(
      answers.map((item) =>
        item.id === id ? { ...item, tempScore: value } : item
      )
    );
  };

  const handleSaveScore = async (id) => {
    const itemToSave = answers.find((item) => item.id === id);
    if (!itemToSave) return;

    try {
      // --- UPDATED PUT REQUEST ---
      await axios.put(
        `http://localhost:8081/api/results/answer/${id}`,
        { finalScore: itemToSave.tempScore },
        {
          withCredentials: true,
        }
      );
      setAnswers(
        answers.map((item) =>
          item.id === id
            ? { ...item, finalScore: itemToSave.tempScore, editing: false }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const totalFinalScore = answers.reduce(
    (acc, curr) => acc + curr.finalScore,
    0
  );
  const averageFinalScore =
    answers.length > 0 ? totalFinalScore / answers.length : 0;

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={3}>Assignment Review for: {username}</Title>
      </Group>
      {loading ? (
        <Text>Loading assignment details...</Text>
      ) : (
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Question</Table.Th>
              <Table.Th>User Answer (Transcript)</Table.Th>
              <Table.Th>Video</Table.Th>
              <Table.Th>AI Score</Table.Th>
              <Table.Th>Final Score</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {answers.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.question}</Table.Td>
                <Table.Td>{item.userAnswer}</Table.Td>
                <Table.Td>
                  <a
                    href={item.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Video
                  </a>
                </Table.Td>
                <Table.Td>{item.gptScore}</Table.Td>
                <Table.Td>
                  {item.editing ? (
                    <NumberInput
                      value={item.tempScore}
                      onChange={(value) => handleScoreChange(item.id, value)}
                      min={0}
                      max={100}
                      size="xs"
                      style={{ width: 80 }}
                    />
                  ) : (
                    item.finalScore.toFixed(2)
                  )}
                </Table.Td>
                <Table.Td>
                  {item.editing ? (
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      onClick={() => handleSaveScore(item.id)}
                    >
                      <IconDeviceFloppy size={18} />
                    </ActionIcon>
                  ) : (
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditToggle(item.id)}
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td
                colSpan={4}
                style={{ textAlign: "right", fontWeight: "bold" }}
              >
                Average Final Score
              </Table.Td>
              <Table.Td style={{ fontWeight: "bold" }}>
                {averageFinalScore.toFixed(2)}%
              </Table.Td>
              <Table.Td />
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      )}
    </Container>
  );
}
