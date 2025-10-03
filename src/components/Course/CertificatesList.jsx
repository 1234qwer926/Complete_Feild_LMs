import React, { useEffect, useState } from "react";
import { Card, Text, Button, Group, Loader, Container, Title, Alert } from "@mantine/core";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const CertificatesList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:8081/api/certificates/${user.username}`,
          { withCredentials: true }
        );

        setCertificates(response.data);
      } catch (err) {
        setError("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container>
      <Title order={2} mb="lg">My Certificates</Title>
      <Group position="center" spacing="lg">
        {certificates.map((cert, idx) => (
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            key={idx}
            style={{ width: 300 }}
          >
            <Text weight={500} size="lg">{cert.courseName}</Text>
            <Text size="sm" color="dimmed" mt="xs">
              Status: {cert.completionStatus}
            </Text>
            {cert.issued ? (
              <Button
                mt="md"
                component="a"
                href={cert.downloadUrl}
                target="_blank"
                fullWidth
              >
                Download Certificate
              </Button>
            ) : (
              <Button mt="md" color="gray" disabled fullWidth>
                Not Completed
              </Button>
            )}
          </Card>
        ))}
      </Group>
    </Container>
  );
};

export default CertificatesList;
