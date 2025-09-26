import { useState } from 'react';
import {
    Anchor, Button, Checkbox, Divider, Group, Paper, PasswordInput, Stack, Text, TextInput, Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle, upperFirst } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import { GoogleButton } from './GoogleButton';
import { TwitterButton } from './TwitterButton';
import { useAuth } from '../../AuthContext'; // Make sure this path is correct

export function AuthenticationForm(props) {
    const [type, toggle] = useToggle(['login', 'register']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const form = useForm({
        initialValues: { username: '', email: '', password: '', terms: true },
        validate: {
            username: (val) => (val.length > 0 ? null : 'Username is required'),
            email: (val) => (type === 'register' && /^\S+@\S+$/.test(val) ? null : (type === 'register' ? 'Invalid email' : null)),
            password: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
        },
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        setError(null);

        // --- FIX: Hardcode the full backend URL here ---
        // For local development:
        const endpoint = `http://localhost:8081/api/auth/${type}`;
        // For production, you would change this to:
        // const endpoint = `https://your-real-backend-api.com/api/auth/${type}`;
        
        const payload = type === 'register'
            ? { username: values.username, email: values.email, password: values.password }
            : { username: values.username, password: values.password };

        try {
            await axios.post(endpoint, payload, {
                withCredentials: true,
            });
            
            // This updates the global state to toggle the UI
            login();

            navigate('/lmsdashboard');
        } catch (err) {
            console.error(`${type} failed:`, err);
            const errorMessage = err.response?.data?.message || err.response?.data || `An unexpected error occurred.`;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper radius="md" p="lg" withBorder {...props} style={{ maxWidth: '400px', margin: 'auto', marginTop: '50px' }}>
            <Text size="lg" fw={500}>Welcome, {type} to continue</Text>
            {/* ... Rest of your form JSX ... */}
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    {error && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    <TextInput
                        required label="Username" placeholder="Your username"
                        {...form.getInputProps('username')} radius="md"
                    />
                    {type === 'register' && (
                        <TextInput
                            required label="Email" placeholder="hello@example.com"
                            {...form.getInputProps('email')} radius="md"
                        />
                    )}
                    <PasswordInput
                        required label="Password" placeholder="Your password"
                        {...form.getInputProps('password')} radius="md"
                    />
                    {type === 'register' && (
                        <Checkbox
                            required label="I accept the terms and conditions"
                            {...form.getInputProps('terms', { type: 'checkbox' })}
                        />
                    )}
                </Stack>
                <Group justify="space-between" mt="xl">
                    <Anchor component="button" type="button" c="dimmed" onClick={() => { toggle(); setError(null); }} size="xs">
                        {type === 'register' ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </Anchor>
                    <Button type="submit" radius="xl" loading={loading}>
                        {upperFirst(type)}
                    </Button>
                </Group>
            </form>
        </Paper>
    );
}
