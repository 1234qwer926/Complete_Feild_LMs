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
import { useAuth } from '../../AuthContext'; // Adjust path if necessary

export function AuthenticationForm(props) {
    const [type, toggle] = useToggle(['login', 'register']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Get the login function from the global AuthContext
    const { login } = useAuth();

    const form = useForm({
        initialValues: {
            username: '',
            email: '',
            password: '',
            terms: true,
        },
        validate: {
            username: (val) => (val.length > 0 ? null : 'Username is required'),
            email: (val) => (type === 'register' && /^\S+@\S+$/.test(val) ? null : (type === 'register' ? 'Invalid email' : null)),
            password: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
        },
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        setError(null);

        const endpoint = `http://localhost:8081/api/auth/${type}`;
        const payload = type === 'register'
            ? { username: values.username, email: values.email, password: values.password }
            : { username: values.username, password: values.password };

        try {
            await axios.post(endpoint, payload, {
                withCredentials: true,
            });
            
            // If the request was for login, update the global state
            if (type === 'login' || type === 'register') {
                login();
            }

            // Navigate to the dashboard after success
            navigate('/lmsdashboard'); // Changed to a more likely target
        } catch (err) {
            console.error(`${type} failed:`, err);
            if (err.response && err.response.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError(`An unexpected error occurred during ${type}. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper radius="md" p="lg" withBorder {...props} style={{ maxWidth: '400px', margin: 'auto', marginTop: '50px' }}>
            <Text size="lg" fw={500}>
                Welcome, {type} to continue
            </Text>

            <Group grow mb="md" mt="md">
                <GoogleButton radius="xl">Google</GoogleButton>
                <TwitterButton radius="xl">Twitter</TwitterButton>
            </Group>

            <Divider label="Or continue with" labelPosition="center" my="lg" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    {error && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <TextInput
                        required
                        label="Username"
                        placeholder="Your username"
                        value={form.values.username}
                        onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
                        error={form.errors.username}
                        radius="md"
                    />

                    {type === 'register' && (
                        <TextInput
                            required
                            label="Email"
                            placeholder="hello@example.com"
                            value={form.values.email}
                            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                            error={form.errors.email}
                            radius="md"
                        />
                    )}

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                        error={form.errors.password}
                        radius="md"
                    />

                    {type === 'register' && (
                        <Checkbox
                            required
                            label="I accept the terms and conditions"
                            checked={form.values.terms}
                            onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                        />
                    )}
                </Stack>

                <Group justify="space-between" mt="xl">
                    <Anchor component="button" type="button" c="dimmed" onClick={() => { toggle(); setError(null); }} size="xs">
                        {type === 'register'
                            ? 'Already have an account? Login'
                            : "Don't have an account? Register"}
                    </Anchor>
                    <Button type="submit" radius="xl" loading={loading}>
                        {upperFirst(type)}
                    </Button>
                </Group>
            </form>
        </Paper>
    );
}
