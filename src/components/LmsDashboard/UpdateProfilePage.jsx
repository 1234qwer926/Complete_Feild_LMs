import React from 'react';
import { Container, Paper, Title, TextInput, Button, Stack, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

export function UpdateProfilePage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            dateOfJoining: user?.dateOfJoining || '',
        },
        validate: {
            firstName: (value) => (value.trim().length > 0 ? null : 'First name is required'),
            lastName: (value) => (value.trim().length > 0 ? null : 'Last name is required'),
            dateOfJoining: (value) => (value ? null : 'Date of joining is required'),
        },
    });

    const handleUpdate = async (values) => {
        try {
            const response = await axios.put('http://localhost:8081/api/auth/profile', values, {
                withCredentials: true,
            });
            
            login(response.data);
            navigate('/subject');
        } catch (error) {
            console.error("Profile update failed:", error);
        }
    };

    return (
        <Container size="xs" p="md">
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Title order={2} ta="center">Complete Your Profile</Title>
                <Text c="dimmed" ta="center" mb="xl">Please fill in your details to continue.</Text>
                
                <form onSubmit={form.onSubmit(handleUpdate)}>
                    <Stack>
                        <Group grow>
                            <TextInput required label="First Name" placeholder="Your first name" {...form.getInputProps('firstName')} />
                            <TextInput required label="Last Name" placeholder="Your last name" {...form.getInputProps('lastName')} />
                        </Group>
                        <TextInput label="Phone Number" placeholder="Your phone number" {...form.getInputProps('phoneNumber')} />
                        <TextInput required type="date" label="Date of Joining" placeholder="Select date" {...form.getInputProps('dateOfJoining')} />
                        <Button type="submit" mt="md" fullWidth>
                            Save and Continue
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
