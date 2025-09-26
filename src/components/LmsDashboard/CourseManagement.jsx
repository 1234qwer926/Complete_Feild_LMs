import React, { useState, useEffect } from "react";
import {
  Container,
  Group,
  Table,
  Text,
  Title,
  Button,
  Modal,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconPencil, IconTrash, IconArrowLeft } from "@tabler/icons-react"; // Import the back arrow icon
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { JotformMapping } from "./JotformMapping";

export function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  // Initialize the navigate function
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081/api/courses`, {
        withCredentials: true,
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEdit = (course) => {
    console.log("Editing course:", course);
    // Future logic for editing a course will go here
  };
  
  // Function to navigate back
  const handleBack = () => {
    navigate(-1);
  };

  const openDeleteModal = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpened(true);
  };

  const closeDeleteModal = () => {
    setCourseToDelete(null);
    setDeleteModalOpened(false);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await axios.delete(
        `http://localhost:8081/api/courses/${courseToDelete.id}`,
        {
          withCredentials: true,
        }
      );
      setCourses(courses.filter((course) => course.id !== courseToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error(
        `Error deleting course ${courseToDelete.courseName}:`,
        error
      );
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Course Management</Title>
        <Group>
          {/* Back button added here */}
          <Button
            variant="light"
            color="blue"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button onClick={() => setMapModalOpened(true)}>Map Jotforms</Button>
        </Group>
      </Group>

      {loading ? (
        <Text ta="center" c="dimmed">
          Loading courses...
        </Text>
      ) : courses.length > 0 ? (
        <Table highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Course Name</Table.Th>
              <Table.Th>Jotform Learning</Table.Th>
              <Table.Th>Jotform Assignment</Table.Th>
              <Table.Th>Mind Map</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {courses.map((course) => (
              <Table.Tr key={course.id}>
                <Table.Td>{course.courseName}</Table.Td>
                <Table.Td>{course.learningJotformName || "N/A"}</Table.Td>
                <Table.Td>{course.assignmentJotformName || "N/A"}</Table.Td>
                <Table.Td>{course.imageFileName || "N/A"}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="center">
                    <Tooltip label="Edit Course">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(course)}
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Course">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => openDeleteModal(course)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text ta="center" c="dimmed">
          No courses available.
        </Text>
      )}

      <Modal
        opened={mapModalOpened}
        onClose={() => setMapModalOpened(false)}
        title="Map Jotform to Course"
        size="xl"
      >
        <JotformMapping
          onSuccess={() => {
            setMapModalOpened(false);
            fetchCourses();
          }}
        />
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={`Delete ${courseToDelete?.courseName || "Course"}`}
        centered
      >
        <Text>
          Are you sure you want to delete this course? This action cannot be
          undone.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete Course
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
