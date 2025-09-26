// AnalyticLeaderDashboard.jsx
import React from 'react';
import {
  Container,
  Group,
  Paper,
  Table,
  Text,
  Title,
  ScrollArea,
} from '@mantine/core';

// Dummy leaderboard data for 30 users (replace with real data/API)
const leaderboard = [
  { rank: 1, username: 'sanskar1419', score: 115 },
  { rank: 2, username: 'bhav380-2', score: 105 },
  { rank: 3, username: 'ShabanaShaik1987', score: 100 },
  { rank: 4, username: 'shubham7522', score: 80 },
  { rank: 5, username: 'rishavd3v', score: 80 },
  { rank: 6, username: 'inv-amalusudhakaran', score: 70 },
  { rank: 7, username: 'Dev-Code24', score: 65 },
  { rank: 8, username: 'shubham-sanvariya', score: 60 },
  // Skipped 9th for "..." row
  // 30th user (current)
  { rank: 30, username: 'Navya', score: 10 },
];

// Only top 8, skip row, and 30th user are displayed
const displayRows = [
  ...leaderboard.slice(0, 8), // top 8 actual users
  'SKIP',                     // ... row in all columns
  leaderboard[leaderboard.length - 1], // last user (rank 30)
];

export function AnalyticLeaderDashboard({ userRank = 30, username = 'Navya', score = 10 }) {
  // You could dynamically get user details if provided as prop or from data source
  return (
    <Container size="md" py="xl">
      <Group justify="center" mb="md" align="center">
        <Title order={2} style={{ color: '#e0e8f4', letterSpacing: 1, fontWeight: 700 }}>
          Analytic Leader Dashboard
        </Title>
      </Group>

      <Paper
        withBorder
        radius="md"
        p={0}
        mt="md"
        style={{
          overflow: 'hidden',
          background: '#161c23',
          boxShadow: '0 2px 16px 0 rgba(36, 133, 255, 0.07)',
        }}
      >
        <ScrollArea type="auto" style={{ maxHeight: 480 }}>
          <Table highlightOnHover withTableBorder >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Rank</Table.Th>
                <Table.Th>Username</Table.Th>
                <Table.Th>Score</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {displayRows.map((item, idx) =>
                item === 'SKIP' ? (
                  <Table.Tr key="skip" style={{ background: '#212232' }}>
                    <Table.Td align="center" style={{ color: '#444d5b', fontWeight: 600, textAlign: 'center' }}>.</Table.Td>
                    <Table.Td align="center" style={{ color: '#444d5b', fontWeight: 600, textAlign: 'center' }}>.</Table.Td>
                    <Table.Td align="center" style={{ color: '#444d5b', fontWeight: 600, textAlign: 'center' }}>.</Table.Td>
                  </Table.Tr>
                ) : (
                  <Table.Tr
                    key={item.rank}
                    style={{
                      background:
                        item.rank === userRank
                          ? 'linear-gradient(90deg, #13436c 0%, #2669a6 100%)'
                          : '#222733',
                      fontWeight: item.rank === userRank ? 700 : 400,
                      color: item.rank === userRank ? '#fff' : '#d4ddf3',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Table.Td style={{ border: 'none' }}>{item.rank}</Table.Td>
                    <Table.Td style={{ border: 'none' }}>{item.username}</Table.Td>
                    <Table.Td style={{ border: 'none' }}>{item.score}</Table.Td>
                  </Table.Tr>
                )
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Container>
  );
}
