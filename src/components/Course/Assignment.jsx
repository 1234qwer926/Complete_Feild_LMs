import React from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Box,
  Group,
  Alert,
  Card,
  Stack,
  List,
  Divider,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export function Assignment({ jotformName, courseName }) {
  const navigate = useNavigate();

  const handleStartAssignment = () => {
    navigate(
      `/assignment/${jotformName}?course=${encodeURIComponent(courseName)}`
    );
  };

  return (
    <Container size="md" py="xl">
      <Card shadow="sm" padding="xl" radius="md">
        <Group mb="md">
          <IconInfoCircle size={24} color="blue" />
          <Title order={2}>Exam Instructions - {courseName}</Title>
        </Group>

        <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="xl">
          Please read all instructions carefully before proceeding.
        </Alert>

        <Stack spacing="lg">
          <Box>
            <Title order={4} mb="sm">
              📋 General Instructions
            </Title>
            <List spacing="sm">
              <List.Item>
                Ensure you have a stable internet connection
              </List.Item>
              <List.Item>Find a quiet, well-lit environment</List.Item>
              <List.Item>Keep your student ID ready for verification</List.Item>
              <List.Item>
                Close all other applications and browser tabs
              </List.Item>
              <List.Item>
                Do not use any unauthorized materials during the exam
              </List.Item>
            </List>
          </Box>

          <Divider />

          <Box>
            <Title order={4} mb="sm">
              🔒 Security & Monitoring
            </Title>
            <List spacing="sm">
              <List.Item>
                Your camera and microphone will be monitored throughout the exam
              </List.Item>
              <List.Item>
                Screen recording and monitoring will be active
              </List.Item>
              <List.Item>
                Switching tabs or applications may be flagged as suspicious
              </List.Item>
              <List.Item>
                Any violations may result in automatic exam termination
              </List.Item>
            </List>
          </Box>

          <Divider />

          <Box>
            <Title order={4} mb="sm">
              📸 Identity Verification
            </Title>
            <List spacing="sm">
              <List.Item>
                Take a clear photo of yourself for identity verification
              </List.Item>
              <List.Item>
                Ensure your face is clearly visible and well-lit
              </List.Item>
            </List>
          </Box>

          <Divider />

          <Box>
            <Title order={4} mb="sm">
              ⚠️ Technical Requirements
            </Title>
            <List spacing="sm">
              <List.Item>Camera and microphone access is mandatory</List.Item>
              <List.Item>Exam will run in fullscreen mode</List.Item>
              <List.Item>Recording capabilities must be enabled</List.Item>
              <List.Item>Modern browser with HTML5 support required</List.Item>
            </List>
          </Box>

          <Alert icon={<IconAlertCircle size={16} />} color="orange" mt="md">
            <Text size="sm" weight={500}>
              By clicking "I Understand and Agree", you will proceed to the
              assignment where you'll complete camera setup, identity
              verification, and begin the exam.
            </Text>
          </Alert>
        </Stack>

        <Group justify="center" mt="xl">
          <Button
            size="lg"
            onClick={handleStartAssignment}
            leftSection={<IconCheck size={16} />}
          >
            I Understand and Agree
          </Button>
        </Group>
      </Card>
    </Container>
  );
}
