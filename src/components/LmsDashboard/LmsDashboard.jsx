// src/components/LmsDashboard.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Container,
  SimpleGrid,
  Text,
  Title,
  Group,
  Badge,
  Button,
  Loader,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import {
  IconUsers,
  IconForms,
  IconBook,
  IconChartBar,
  IconSchool,
  IconUpload,
  IconEye,
} from "@tabler/icons-react";
import axios from "axios";

export function LmsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    jotforms: 0,
    courses: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, jotformsRes, coursesRes, subjectsRes] =
        await Promise.all([
          axios.get("/api/user-mappings").catch(() => ({ data: [] })),
          axios.get("/api/jotforms").catch(() => ({ data: [] })),
          axios.get("/api/courses").catch(() => ({ data: [] })),
          axios.get("/api/subjects").catch(() => ({ data: [] })),
        ]);
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "User Management",
      desc: "Manage users by creating, updating, or deleting profiles and assigning them to specific learning groups.",
      icon: IconUsers,
      color: "blue",
      route: "/usermanagment",
      manageLabel: "Manage Users",
    },
    {
      title: "Jotform Management",
      desc: "Administer learning materials and assignments by creating, editing, or removing Jotforms.",
      icon: IconForms,
      color: "green",
      route: "/jotformmanagment",
      manageLabel: "Manage Jotforms",
    },
    {
      title: "Subject Management",
      desc: "Group multiple courses together into subjects and organize them by learning groups (BL, BE, BM).",
      icon: IconSchool,
      color: "purple",
      route: "/subjectmanagement",
      manageLabel: "Manage Subjects",
    },
    {
      title: "Course Management",
      desc: "Organize your curriculum by mapping Jotforms and other materials to specific courses for user groups.",
      icon: IconBook,
      color: "orange",
      route: "/coursemanagment",
      manageLabel: "Manage Courses",
    },
    {
      title: "Results Management",
      desc: "Track and analyze user performance, view assessment results, and generate progress reports.",
      icon: IconChartBar,
      color: "teal",
      route: "/resultmanagement",
      manageLabel: "View Results",
    },
  ];

  return (
    <Box style={{ padding: "32px 0" }}>
      <Container size="lg">
        <Group position="center" mb="xl">
          <Title order={1} style={{ color: "var(--mantine-color-white)" }}>
            PULSE LMS Dashboard
          </Title>
          {loading && <Loader size="sm" />}
        </Group>

        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing="xl"
          mb="xl"
        >
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.route}
              style={{ textDecoration: "none", height: "100%" }}
            >
              <Card
                shadow="md"
                radius="md"
                p="lg"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <Group position="apart" mb="md">
                  <card.icon
                    size={32}
                    color={`var(--mantine-color-${card.color}-6)`}
                  />
                  <Group spacing="xs">
                    {card.count !== null && (
                      <Badge color={card.color} variant="light">
                        {card.count}{" "}
                        {card.count === 1
                          ? card.manageLabel.split(" ")[0]
                          : card.manageLabel.split(" ")[0] + "s"}
                      </Badge>
                    )}
                    <Tooltip label="Quick View">
                      <ActionIcon
                        variant="subtle"
                        color={card.color}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(card.route);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                <Text
                  size="lg"
                  weight={600}
                  style={{ color: "var(--mantine-color-white)" }}
                  mb="sm"
                >
                  {card.title}
                </Text>
                <Text size="sm" color="dimmed" style={{ flex: 1 }}>
                  {card.desc}
                </Text>

                <Button
                  variant="light"
                  color={card.color}
                  fullWidth
                  style={{ marginTop: "auto" }}
                >
                  {card.manageLabel}
                </Button>
              </Card>
            </Link>
          ))}
        </SimpleGrid>

        {/* Quick Actions */}
        <Card
          shadow="sm"
          radius="md"
          p="md"
          style={{ backgroundColor: "#1A1B1E", border: "1px solid #2C2E33" }}
        >
          <Group position="center">
            <Text weight={500} color="white">
              Quick Actions:
            </Text>
            <Button
              variant="light"
              color="cyan"
              size="sm"
              leftIcon={<IconUpload size={16} />}
              onClick={() => navigate("/fileupload")}
            >
              File Upload
            </Button>
            <Button
              variant="light"
              color="grape"
              size="sm"
              leftIcon={<IconSchool size={16} />}
              onClick={() => navigate("/subjectmanagement")}
            >
              Create Subject
            </Button>
            <Button
              variant="light"
              color="indigo"
              size="sm"
              leftIcon={<IconBook size={16} />}
              onClick={() => navigate("/coursemanagment")}
            >
              Map Course
            </Button>
          </Group>
        </Card>
      </Container>
    </Box>
  );
}
