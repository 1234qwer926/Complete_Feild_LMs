import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Button,
  Group,
  Table,
  Text,
  Modal,
  ActionIcon,
  Loader,
  Center,
  Tooltip,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications"; // Import notifications
import axios from "axios";
import { CreateJotform } from "./CreateJotform";

export function JotformManagement() {
  const [jotforms, setJotforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createJotformModalOpened, setCreateJotformModalOpened] =
    useState(false);

  const fetchJotforms = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/api/jotforms", {
        withCredentials: true,
      });
      setJotforms(response.data);
    } catch (error) {
      console.error("Error fetching Jotforms:", error);
      // Use notification for fetch error
      notifications.show({
        title: "Error Fetching Data",
        message: "Could not retrieve the list of Jotforms. Please try refreshing the page.",
        color: "red",
      });
      setJotforms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJotforms();
  }, []);

  const handleEdit = (id) => {
    console.log(`Edit Jotform with ID: ${id}`);
    // Use notification for unimplemented features
    notifications.show({
      title: "Feature Not Available",
      message: "Edit functionality is yet to be implemented.",
      color: "blue",
    });
  };

  const confirmDelete = async (formToDelete) => {
    try {
      await axios.delete(
        `http://localhost:8081/api/jotforms/${formToDelete.id}`,
        {
          withCredentials: true,
        }
      );

      setJotforms((currentForms) =>
        currentForms.filter((form) => form.id !== formToDelete.id)
      );
      
      // Use notification for successful deletion
      notifications.show({
        title: "Jotform Deleted",
        message: `The form "${formToDelete.jotformName}" has been successfully deleted.`,
        color: "green",
      });
    } catch (error) {
      console.error(`Error deleting jotform ${formToDelete.id}:`, error);
      // Use notification for deletion error
      notifications.show({
        title: "Deletion Failed",
        message: "An error occurred while trying to delete the Jotform.",
        color: "red",
      });
    }
  };

  const openDeleteModal = (form) => {
    modals.openConfirmModal({
      title: "Delete Jotform",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the form{" "}
          <Text span fw={700}>
            "{form.jotformName}"
          </Text>
          ? This action is permanent and cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Jotform", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => confirmDelete(form),
    });
  };

  const rows = jotforms.map((form) => (
    <Table.Tr key={form.id}>
      <Table.Td>{form.jotformName}</Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Tooltip label="Edit Form">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleEdit(form.id)}
            >
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Form">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => openDeleteModal(form)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const handleCloseCreateModal = () => {
    setCreateJotformModalOpened(false);
    fetchJotforms(); // Refresh list after creating a new form
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Jotform Management</Title>
        <Button onClick={() => setCreateJotformModalOpened(true)}>
          Create Jotform
        </Button>
      </Group>

      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <Table highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Jotform Name</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text c="dimmed" ta="center">
                    No Jotforms found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={createJotformModalOpened}
        onClose={() => setCreateJotformModalOpened(false)}
        title="Create New Jotform"
        centered
      >
        <CreateJotform onSuccess={handleCloseCreateModal} />
      </Modal>
    </Container>
  );
}
