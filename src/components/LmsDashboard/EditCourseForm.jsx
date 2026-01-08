import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Group,
  Box,
  Select,
  NumberInput,
  FileInput,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import axios from "axios";

export function EditCourseForm({ course, onSuccess, onCancel }) {
  const [courseName, setCourseName] = useState("");
  const [learningJotform, setLearningJotform] = useState("");
  const [assignmentJotform, setAssignmentJotform] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [daysOfJoining, setDaysOfJoining] = useState(null);
  const [preRequisite, setPreRequisite] = useState("");

  const [jotforms, setJotforms] = useState([]);
  const [courseNames, setCourseNames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setCourseName(course.courseName || "");
      setLearningJotform(course.learningJotformName || "");
      setAssignmentJotform(course.assignmentJotformName || "");
      setDaysOfJoining(course.daysOfJoining);
      setPreRequisite(course.preRequisiteCourseName || "");
    }
  }, [course]);

  const fetchJotforms = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/jotforms", {
        withCredentials: true,
      });
      setJotforms(response.data.map((form) => form.jotformName));
    } catch (error) {
      console.error("Error fetching Jotforms:", error);
    }
  };

  const fetchCourseNames = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/courses/names", {
        withCredentials: true,
      });
      // Filter out the current course name from prerequisites
      setCourseNames(response.data.filter(name => name !== course.courseName));
    } catch (error) {
      console.error("Error fetching course names:", error);
    }
  };

  useEffect(() => {
    fetchJotforms();
    fetchCourseNames();
  }, [course]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("courseName", courseName);
    formData.append("learningJotformName", learningJotform);
    formData.append("assignmentJotformName", assignmentJotform);
    if (imageFile) {
        formData.append("imageFile", imageFile);
    }
    if (pdfFile) {
        formData.append("pdfFile", pdfFile);
    }
    if (daysOfJoining !== null) {
        formData.append("daysOfJoining", daysOfJoining);
    }
    formData.append("preRequisiteCourseName", preRequisite);


    try {
      await axios.put(
        `http://localhost:8081/api/courses/${course.id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onSuccess();
    } catch (error) {
      console.error("Error updating course:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextInput
        label="Course Name"
        placeholder="Enter course name"
        value={courseName}
        onChange={(event) => setCourseName(event.currentTarget.value)}
        required
        mb="sm"
      />
      <Select
        label="Learning Jotform"
        placeholder="Select a Jotform"
        data={jotforms}
        value={learningJotform}
        onChange={setLearningJotform}
        mb="sm"
        clearable
      />
      <Select
        label="Assignment Jotform"
        placeholder="Select a Jotform"
        data={jotforms}
        value={assignmentJotform}
        onChange={setAssignmentJotform}
        mb="sm"
        clearable
      />
      <FileInput
        label="Mind Map (Image)"
        placeholder="Upload new image"
        leftSection={<IconUpload size={14} />}
        onChange={setImageFile}
        mb="sm"
        accept="image/*"
      />
       <FileInput
        label="Course Material (PDF)"
        placeholder="Upload new PDF"
        leftSection={<IconUpload size={14} />}
        onChange={setPdfFile}
        mb="sm"
        accept=".pdf"
      />
      <NumberInput
        label="Days of Joining"
        placeholder="Enter number of days"
        value={daysOfJoining}
        onChange={setDaysOfJoining}
        mb="sm"
        min={0}
      />
      <Select
        label="Prerequisite Course"
        placeholder="Select a prerequisite"
        data={courseNames}
        value={preRequisite}
        onChange={setPreRequisite}
        mb="sm"
        clearable
      />
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Update Course
        </Button>
      </Group>
    </Box>
  );
}
