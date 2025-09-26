import React, { useState } from "react";
import { Box, Button, Text, Title } from "@mantine/core";
import {
  IconBook,
  IconClipboardList,
  IconArrowLeft,
} from "@tabler/icons-react";
import { JotformViewer } from "./JotformViewer";
import { Assignment } from "./Assignment";
import classes from "./CourseDetail.module.css";

export function CourseDetail({ course, onBack }) {
  const [activeTab, setActiveTab] = useState(
    course.learningJotformName ? "learning" : "assignment"
  );

  return (
    <Box
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Fixed Left Sidebar - Full Height */}
      <Box
        style={{
          flex: "0 0 300px", // Fixed 300px width
          background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
          color: "white",
          padding: "24px",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Back Button */}
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
          mb="xl"
          size="sm"
          className={classes.backButton}
        >
          Back to Courses
        </Button>

        {/* Course Info */}
        <Box mb="xl">
          <Title order={3} className={classes.courseTitle}>
            {course.courseName}
          </Title>
          <Text size="sm" className={classes.courseGroup}>
            Group: {course.groupName}
          </Text>
        </Box>

        {/* Navigation Toggles */}
        <Box className={classes.navigationContainer}>
          {course.learningJotformName && (
            <Button
              variant={activeTab === "learning" ? "filled" : "subtle"}
              color="blue"
              fullWidth
              leftSection={<IconBook size={16} />}
              onClick={() => setActiveTab("learning")}
              mb="md"
              className={classes.navButton}
            >
              Learning Material
            </Button>
          )}

          {course.assignmentJotformName && (
            <Button
              variant={activeTab === "assignment" ? "filled" : "subtle"}
              color="orange"
              fullWidth
              leftSection={<IconClipboardList size={16} />}
              onClick={() => setActiveTab("assignment")}
              mb="md"
              className={classes.navButton}
            >
              Assignment
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content Area - Full Height with Scroll */}
      <Box
        style={{
          flex: 1, // Take remaining space
          overflowY: "auto",
          backgroundColor: "#f8f9fa",
          padding: 0,
          margin: 0,
          boxSizing: "border-box",
        }}
      >
        <Box style={{ padding: "24px", minHeight: "100%" }}>
          {activeTab === "learning" && course.learningJotformName && (
            <JotformViewer
              jotformName={course.learningJotformName}
              onBack={onBack}
              hideBackButton={true}
            />
          )}

          {activeTab === "assignment" && course.assignmentJotformName && (
            <Assignment
              jotformName={course.assignmentJotformName}
              courseName={course.courseName}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
