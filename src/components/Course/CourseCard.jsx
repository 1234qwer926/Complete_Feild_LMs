import React from "react";
import { Card, Text, Group } from "@mantine/core";
import { IconBook, IconClipboardList } from "@tabler/icons-react";
import classes from "./Course.module.css";

export function CourseCard({ course, onSelectCourse }) {
  const getDefaultImage = () => {
    // Default course images based on group
    const defaultImages = {
      BL: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      BE: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      BM: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    };

    return defaultImages[course.groupName] || defaultImages.BL;
  };

  const getImageUrl = () => {
    if (course.imageFileName && course.imageFile) {
      // If there's base64 image data
      return `data:image/jpeg;base64,${course.imageFile}`;
    } else if (course.imageFileName) {
      // If there's a filename but no base64 data, use a placeholder or default
      return getDefaultImage();
    } else {
      // Use default image based on group
      return getDefaultImage();
    }
  };

  return (
    <Card
      p="lg"
      shadow="lg"
      className={classes.card}
      radius="md"
      onClick={() => onSelectCourse(course)}
    >
      {/* Background Image */}
      <div
        className={classes.image}
        style={{
          backgroundImage: `url(${getImageUrl()})`,
        }}
      />

      {/* Overlay for better text readability */}
      <div className={classes.overlay} />

      {/* Card Content */}
      <div className={classes.content}>
        <div>
          {/* Course Name */}
          <Text size="lg" className={classes.title} fw={500}>
            {course.courseName}
          </Text>

          {/* Course Info and Available Options */}
          <Group justify="space-between" gap="xs">
            <Text size="sm" className={classes.author}>
              Group: {course.groupName}
            </Text>

            {/* Available Options Indicators */}
            <Group gap="lg">
              {course.learningJotformName && (
                <Group gap={4}>
                  <IconBook size={16} color="white" />
                  <Text size="sm" className={classes.bodyText}>
                    Learning
                  </Text>
                </Group>
              )}

              {course.assignmentJotformName && (
                <Group gap={4}>
                  <IconClipboardList size={16} color="white" />
                  <Text size="sm" className={classes.bodyText}>
                    Assignment
                  </Text>
                </Group>
              )}
            </Group>
          </Group>
        </div>
      </div>
    </Card>
  );
}
