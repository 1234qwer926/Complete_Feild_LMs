// FeaturesCards.jsx (Adapted for PULSE Pharma LMS features, with dark mode adjustments via Mantine theme)
import { IconCookie, IconGauge, IconUser } from "@tabler/icons-react";
import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import classes from "./FeaturesCards.module.css";

const mockdata = [
  {
    title: "Seamless Course Management",
    description:
      "Admins can create groups, assign users, build learning and assignment forms, map them to courses, and assign to groups effortlessly.",
    icon: IconGauge,
  },
  {
    title: "User-Centric Learning Experience",
    description:
      "Users access assigned courses via navbar, view interactive JotForms, mindmaps, embedded PDFs, and submit assignments with ease.",
    icon: IconUser,
  },
  {
    title: "Advanced Analytics",
    description:
      "Track completion rates, submission counts, scores, and timestamps for learning and assignments per course and group.",
    icon: IconCookie,
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme(); // Use to detect dark mode
  const isDark = colorScheme === "dark";

  const features = mockdata.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
      bg={isDark ? "dark.6" : "white"}
    >
      <feature.icon
        size={50}
        stroke={1.5}
        color={isDark ? theme.colors.blue[3] : theme.colors.blue[6]}
      />
      <Text
        fz="lg"
        fw={500}
        className={classes.cardTitle}
        mt="md"
        c={isDark ? "white" : "black"}
      >
        {feature.title}
      </Text>
      <Text fz="sm" c={isDark ? "gray.4" : "dimmed"} mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">
      {/* <Group justify="center">
        <Badge variant="filled" size="lg" color={isDark ? 'blue.4' : 'blue'}>
          Best LMS for Pharma
        </Badge>
      </Group> */}

      <Title
        order={2}
        className={classes.title}
        ta="center"
        mt="sm"
        c={isDark ? "white" : "black"}
      >
        Key Features of PULSE LMS
      </Title>

      <Text
        c={isDark ? "gray.4" : "dimmed"}
        className={classes.description}
        ta="center"
        mt="md"
      >
        Discover powerful features for admin management, user engagement, and
        insightful analytics in your pharmaceutical training platform.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
