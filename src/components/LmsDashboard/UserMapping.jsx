import React, { useState } from 'react';
import {
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios'; // Import axios

export function UserMapping({ onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      group: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      group: (val) => (val ? null : 'Please select a group'),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      // --- START OF UPDATE ---
      // Switched to axios and added withCredentials
      const response = await axios.post(
        'http://localhost:8081/api/user-mappings',
        { email: values.email, groupName: values.group },
        { withCredentials: true }
      );
      // --- END OF UPDATE ---

      console.log('Successfully mapped user:', response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (err) {
      // Updated error handling for axios
      const errorMessage = err.response?.data || err.message || 'Failed to map user.';
      setError(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" shadow="none">
      <Text size="lg" fw={500} ta="center" mb="lg">
        Enter User Details
      </Text>

      {error && <Text c="red" ta="center" pb="md">{error}</Text>}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            required
            label="User Email"
            placeholder="user@example.com"
            {...form.getInputProps('email')}
            radius="md"
          />
          <Select
            required
            label="Select Group"
            placeholder="Choose a group"
            data={['BL', 'BE', 'BM']}
            {...form.getInputProps('group')}
            radius="md"
          />
        </Stack>
        <Group justify="flex-end" mt="xl">
          {onClose && <Button variant="default" onClick={onClose}>Cancel</Button>}
          <Button type="submit" radius="xl" loading={loading}>
            Map User to Group
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
