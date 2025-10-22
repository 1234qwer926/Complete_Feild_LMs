import React from "react";
import { Card, Text, Group, Badge } from "@mantine/core";
import { IconBook, IconClipboardList, IconClock, IconRelationManyToMany } from "@tabler/icons-react";
import classes from "./Course.module.css";

export function CourseCard({ course, onSelectCourse }) {
  const getImageUrl = () => {
    // If there's base64 image data from the backend, use it
    if (course.imageFile) {
      return `data:image/jpeg;base64,${course.imageFile}`;
    }
    // Fallback to a default image if no specific one is provided
    return "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  };

  return (
    <Card
      p="lg"
      shadow="lg"
      className={classes.card}
      radius="md"
      onClick={() => onSelectCourse(course)}
    >
      <div
        className={classes.image}
        style={{ backgroundImage: `url(${getImageUrl()})` }}
      />
      <div className={classes.overlay} />
      <div className={classes.content}>
        <div>
          <Text size="lg" className={classes.title} fw={500}>
            {course.courseName}
          </Text>
          <Group justify="space-between" gap="xs" mt="xs">
            <Text size="sm" className={classes.author}>
              Group: {course.groupName}
            </Text>
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
          
          {/* Displaying new fields */}
          <Group mt="md">
            {course.daysOfJoining != null && (
               <Badge
                 color="teal"
                 variant="light"
                 leftSection={<IconClock size={14} />}
               >
                 Joins in {course.daysOfJoining} days
               </Badge>
            )}
            {course.preRequisiteCourseName && (
               <Badge
                 color="grape"
                 variant="light"
                 leftSection={<IconRelationManyToMany size={14} />}
               >
                 Requires: {course.preRequisiteCourseName}
               </Badge>
            )}
          </Group>
        </div>
      </div>
    </Card>
  );
}
