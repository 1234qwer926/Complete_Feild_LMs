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

    // 1. Get the login function from the global AuthContext
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

        // 2. FIX: Use a relative path for the endpoint to work with the Netlify proxy
        const endpoint = `/api/auth/${type}`;
        
        const payload = type === 'register'
            ? { username: values.username, email: values.email, password: values.password }
            : { username: values.username, password: values.password };

        try {
            await axios.post(endpoint, payload, {
                withCredentials: true,
            });
            
            // 3. CRITICAL FIX: After a successful API call, update the global state.
            // This will cause the HeaderMegaMenu to re-render.
            login();

            // Navigate to the dashboard after success
            navigate('/lmsdashboard');

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

            {/* <Group grow mb="md" mt="md">
                <GoogleButton radius="xl">Google</GoogleButton>
                <TwitterButton radius="xl">Twitter</TwitterButton>
            </Group> */}

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
                        {...form.getInputProps('username')}
                        radius="md"
                    />

                    {type === 'register' && (
                        <TextInput
                            required
                            label="Email"
                            placeholder="hello@example.com"
                            {...form.getInputProps('email')}
                            radius="md"
                        />
                    )}

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        {...form.getInputProps('password')}
                        radius="md"
                    />

                    {type === 'register' && (
                        <Checkbox
                            required
                            label="I accept the terms and conditions"
                            {...form.getInputProps('terms', { type: 'checkbox' })}
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
