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
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import axios from "axios";
import { UserMapping } from "./UserMapping";
import { IconArrowLeft, IconSchool } from '@tabler/icons-react'; // Import necessary icons
import { useNavigate } from "react-router-dom";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const navigate = useNavigate();
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        " http://localhost:8081/api/user-mappings",
        {
          withCredentials: true,
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching user mappings:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBack = () => {
    navigate(-1); // This is the idiomatic way to go back in react-router
  };

  const handleMapSuccess = () => {
    setMapModalOpened(false);
    fetchUsers();
  };

  const confirmDelete = async (userToDelete) => {
    try {
      await axios.delete(
        ` http://localhost:8081/api/user-mappings/${userToDelete.id}`,
        {
          withCredentials: true,
        }
      );
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userToDelete.id)
      );
    } catch (error) {
      console.error(`Error deleting user ${userToDelete.email}:`, error);
    }
  };

  const openDeleteModal = (user) => {
    modals.openConfirmModal({
      title: "Delete User Mapping",
      centered: true,
      children: (
        // Use Text component with props for styling instead of raw HTML tags
        <Text size="sm">
          Are you sure you want to delete the mapping for{" "}
          <Text span fw={700}>
            {user.email}
          </Text>
          ? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Mapping", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => confirmDelete(user),
    });
  };

  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.groupName}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center">
          <Tooltip label="Edit Mapping">
            <ActionIcon variant="subtle" color="blue">
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Mapping">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => openDeleteModal(user)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container p="lg">
      <Modal
        opened={mapModalOpened}
        onClose={() => setMapModalOpened(false)}
        title="Map New User to Group"
        centered
      >
        <UserMapping
          onSuccess={handleMapSuccess}
          onClose={() => setMapModalOpened(false)}
        />
      </Modal>

      <Group justify="space-between" mb="xl">
        <Title order={2}>User Management</Title>
        <Button
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    leftIcon={<IconArrowLeft size={16} />}
                                    onClick={handleBack}
                                  >
                                    Back
                        </Button>
        <Button onClick={() => setMapModalOpened(true)}>Map User</Button>
      </Group>

      {loading ? (
        <Text ta="center" c="dimmed">
          Loading users...
        </Text>
      ) : (
        <Table withTableBorder withColumnBorders highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User Email</Table.Th>
              <Table.Th>Group</Table.Th>
              <Table.Th ta="center">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" ta="center">
                    No users found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
