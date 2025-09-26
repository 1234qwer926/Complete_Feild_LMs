import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  FileInput,
  Group,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications"; // 1. Import notifications
import axios from "axios";
import classes from "../AuthenticationForm/AuthenticationForm.module.css";

export function JotformMapping(props) {
  const [formType, setFormType] = useState("learning");
  const [loadingForms, setLoadingForms] = useState(false);
  const [jotformNames, setJotformNames] = useState([]);
  const [courseNames, setCourseNames] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const fetchJotformNames = async () => {
    setLoadingForms(true);
    try {
      const response = await axios.get(
        "http://localhost:8081/api/jotforms/names",
        { withCredentials: true }
      );
      setJotformNames(response.data);
    } catch (error) {
      console.error("Error fetching jotform names", error);
      // 2. Use notification for error
      notifications.show({
        title: "Fetch Error",
        message: "Could not load Jotform names. Please try again.",
        color: "red",
      });
      setJotformNames([]);
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchExistingCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await axios.get(
        "http://localhost:8081/api/courses/names",
        { withCredentials: true }
      );
      setCourseNames(response.data);
    } catch (error) {
      console.error("Error fetching existing courses", error);
      // 2. Use notification for error
      notifications.show({
        title: "Fetch Error",
        message: "Could not load existing course names. Please try again.",
        color: "red",
      });
      setCourseNames([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchJotformNames();
    fetchExistingCourses();
  }, []);

  const learningForm = useForm({
    initialValues: {
      courseName: "",
      jotformName: "",
      imageFile: null,
      pdfFile: null,
    },
    validate: {
      courseName: (val) =>
        val.trim().length > 0 ? null : "Please enter a course name",
      jotformName: (val) => (val ? null : "Please select a Jotform"),
    },
  });

  const submitLearningForm = async (values) => {
    try {
      const formData = new FormData();
      formData.append("courseName", values.courseName);
      formData.append("jotformName", values.jotformName);
      if (values.imageFile) formData.append("imageFile", values.imageFile);
      if (values.pdfFile) formData.append("pdfFile", values.pdfFile);

      await axios.post(
        "http://localhost:8081/api/courses/learning",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      
      // 3. Use notification for success
      notifications.show({
        title: "Success",
        message: "Learning form mapped successfully!",
        color: "green",
      });
      props.onSuccess(); // Trigger parent refresh
    } catch (error) {
      console.error("Error submitting learning form mapping", error);
      // 2. Use notification for error
      notifications.show({
        title: "Submission Failed",
        message: "Failed to map the learning form. Please check the details and try again.",
        color: "red",
      });
    }
  };

  const assignmentForm = useForm({
    initialValues: { courseName: "", jotformName: "" },
    validate: {
      courseName: (val) => (val ? null : "Please select a course name"),
      jotformName: (val) => (val ? null : "Please select a jotform"),
    },
  });

  const submitAssignmentForm = async (values) => {
    try {
      const payload = {
        courseName: values.courseName,
        jotformName: values.jotformName,
      };

      await axios.post(
        "http://localhost:8081/api/courses/assignment",
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      // 3. Use notification for success
      notifications.show({
        title: "Success",
        message: "Assignment form mapped successfully!",
        color: "green",
      });
      props.onSuccess(); // Trigger parent refresh
    } catch (error) {
      console.error("Error submitting assignment mapping", error);
      // 2. Use notification for error
      notifications.show({
        title: "Submission Failed",
        message: "Failed to map the assignment form. Please ensure the course exists.",
        color: "red",
      });
    }
  };

  return (
    <Paper
      className={classes.formPaper}
      radius="md"
      p="lg"
      withBorder
      {...props}
      style={{ maxWidth: 400, margin: "0 auto" }}
    >
      <Text size="lg" fw={500} ta="center">
        Jotform Mapping
      </Text>

      <Group justify="center" mt="md" mb="lg">
        <SegmentedControl
          value={formType}
          onChange={setFormType}
          data={[
            { label: "Jotform Learning", value: "learning" },
            { label: "Jotform Assignment", value: "assignment" },
          ]}
          color="blue"
          size="md"
        />
      </Group>

      <Divider label="Select mapping details" labelPosition="center" my="lg" />

      {formType === "learning" ? (
        <form onSubmit={learningForm.onSubmit(submitLearningForm)}>
          <Stack>
            <TextInput
              label="Course Name"
              placeholder="Enter new or existing course name"
              required
              {...learningForm.getInputProps("courseName")}
              radius="md"
            />

            <Select
              label="Jotform Name"
              placeholder={
                loadingForms ? "Loading..." : "Select existing jotform"
              }
              required
              searchable
              data={jotformNames}
              {...learningForm.getInputProps("jotformName")}
              radius="md"
              disabled={loadingForms}
            />

            <FileInput
              label="Upload Image (Optional)"
              placeholder="Select image file"
              accept="image/*"
              {...learningForm.getInputProps("imageFile")}
              radius="md"
              clearable
            />

            <FileInput
              label="Upload PDF (Optional)"
              placeholder="Select PDF file"
              accept="application/pdf"
              {...learningForm.getInputProps("pdfFile")}
              radius="md"
              clearable
            />

            <Button type="submit" radius="xl" mt="md">
              Map Learning Jotform
            </Button>
          </Stack>
        </form>
      ) : (
        <form onSubmit={assignmentForm.onSubmit(submitAssignmentForm)}>
          <Stack>
            <Select
              label="Course Name"
              placeholder={
                loadingCourses ? "Loading..." : "Select existing course"
              }
              required
              searchable
              data={courseNames}
              {...assignmentForm.getInputProps("courseName")}
              radius="md"
              disabled={loadingCourses}
            />

            <Select
              label="Jotform Name"
              placeholder="Select jotform"
              required
              searchable
              data={jotformNames}
              {...assignmentForm.getInputProps("jotformName")}
              radius="md"
              disabled={loadingForms}
            />

            <Button type="submit" radius="xl" mt="md">
              Map Assignment Jotform
            </Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
}
