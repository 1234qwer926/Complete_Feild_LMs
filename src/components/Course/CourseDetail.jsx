import React, { useState } from "react";
import { Box, Button, Text, Title } from "@mantine/core";
import { IconBook, IconClipboardList, IconArrowLeft } from "@tabler/icons-react";
import { JotformViewer } from "./JotformViewer";
import { Assignment } from "./Assignment";
import classes from "./CourseDetail.module.css";

// --- NEW IMPORTS ---
import { useAuth } from "../../AuthContext";
import axios from "axios";
import { notifications } from "@mantine/notifications";

export function CourseDetail({ course, onBack }) {
    const [activeTab, setActiveTab] = useState(
        course.learningJotformName ? "learning" : "assignment"
    );

    // --- NEW: Get user from auth context ---
    const { user } = useAuth();

    // --- NEW: Submission handler for learning material ---
    const handleLearningSubmit = async () => {
        if (!user) {
            notifications.show({
                title: 'Authentication Error',
                message: 'You must be logged in to save your progress.',
                color: 'red'
            });
            return;
        }

        const payload = {
            courseName: course.courseName,
            learningJotformName: course.learningJotformName,
            assignmentJotformName: course.assignmentJotformName,
        };

        try {
            await axios.post('http://localhost:8081/api/completions/learning', payload, {
                withCredentials: true,
            });

            notifications.show({
                title: 'Progress Saved!',
                message: `You have completed the learning for ${course.courseName}.`,
                color: 'green',
            });

            // Go back to the course list after successful submission
            onBack();

        } catch (error) {
            console.error("Failed to mark learning as complete:", error);
            notifications.show({
                title: 'Submission Failed',
                message: 'There was an error saving your progress. Please try again.',
                color: 'red',
            });
        }
    };

    return (
        <Box style={{ display: "flex", height: "100vh", backgroundColor: "#f8f9fa", margin: 0, padding: 0, overflow: "hidden" }}>
            {/* Fixed Left Sidebar */}
            <Box style={{ flex: "0 0 300px", background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)", color: "white", padding: "24px", boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)", overflowY: "auto", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
                <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onBack} mb="xl" size="sm" className={classes.backButton}>
                    Back to Courses
                </Button>
                <Box mb="xl">
                    <Title order={3} className={classes.courseTitle}>{course.courseName}</Title>
                    <Text size="sm" className={classes.courseGroup}>Group: {course.groupName}</Text>
                </Box>
                <Box className={classes.navigationContainer}>
                    {course.learningJotformName && (
                        <Button variant={activeTab === "learning" ? "filled" : "subtle"} color="blue" fullWidth leftSection={<IconBook size={16} />} onClick={() => setActiveTab("learning")} mb="md" className={classes.navButton}>
                            Learning Material
                        </Button>
                    )}
                    {course.assignmentJotformName && (
                        <Button variant={activeTab === "assignment" ? "filled" : "subtle"} color="orange" fullWidth leftSection={<IconClipboardList size={16} />} onClick={() => setActiveTab("assignment")} mb="md" className={classes.navButton}>
                            Assignment
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box style={{ flex: 1, overflowY: "auto", backgroundColor: "#f8f9fa", padding: 0, margin: 0, boxSizing: "border-box" }}>
                <Box style={{ padding: "24px", minHeight: "100%" }}>
                    {activeTab === "learning" && course.learningJotformName && (
                        <JotformViewer
                            jotformName={course.learningJotformName}
                            onBack={onBack}
                            hideBackButton={true}
                            // --- PASS THE NEW SUBMIT HANDLER ---
                            onSubmit={handleLearningSubmit}
                        />
                    )}
                    {activeTab === "assignment" && course.assignmentJotformName && (
                        <Assignment jotformName={course.assignmentJotformName} courseName={course.courseName} />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

