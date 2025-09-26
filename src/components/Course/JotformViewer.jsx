import React, { useState, useEffect } from "react";
import { Loader, Text, Box, Divider, Image, Group, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";

// Helper component to render a single dynamic element
function RenderElement({ element }) {
  const { content, tagName, align, width, height, required, style = {}, placeholder } = element;

  const baseStyle = {
    textAlign: align || "left",
    width: width || "auto",
    height: height || "auto",
    ...style,
  };

  switch (tagName) {
    case "heading":
      return (
        <Text fw={700} size={element.size || "xl"} mb="md" style={baseStyle}>
          {content}
          {required && <span style={{ color: "red" }}> *</span>}
        </Text>
      );
    case "paragraph":
      return (
        <Text size={element.size || "md"} mb="md" style={{ ...baseStyle, lineHeight: 1.6 }}>
          {content}
        </Text>
      );
    case "image":
      return (
        <Box mb="md" style={baseStyle}>
          <Image
            src={typeof content === "string" ? content : content.fileUrl}
            alt={element.elementName || placeholder || "Image"}
            width={width || undefined}
            height={height || undefined}
            fit="contain"
          />
          {typeof content === "object" && (
            <Text size="xs" mt={4} c="dimmed">{content.fileName}</Text>
          )}
        </Box>
      );
    case "video":
      return (
        <Box mb="md" style={baseStyle}>
          <video width={width || "100%"} height={height || "auto"} controls>
            <source src={content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    case "audio":
      return (
        <Box mb="md" style={baseStyle}>
          <audio controls>
            <source src={content} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </Box>
      );
    case "horizontalline":
    case "breakline":
      return <Divider my="md" style={baseStyle} />;
    case "orderedlist":
      return (
        <ol style={baseStyle}>
          {content.split(",").map((item, idx) => (<li key={idx}>{item.trim()}</li>))}
        </ol>
      );
    case "unorderedlist":
      return (
        <ul style={baseStyle}>
          {content.split(",").map((item, idx) => (<li key={idx}>{item.trim()}</li>))}
        </ul>
      );
    case "randominteger":
      return (
        <Box mb="md" style={baseStyle}>
          <Text fw={500} size="md" mb={4}>Random Integer</Text>
          <Text size="xl" fw={700} style={{ fontFamily: 'monospace', color: '#007CFF', padding: '8px 12px', background: '#f0f7ff', borderRadius: '4px', display: 'inline-block' }}>
            {content || '0'}
          </Text>
        </Box>
      );
    case "videorecording":
      return (
        <Box mb="md" style={baseStyle}>
          <Box style={{ textAlign: 'center', padding: '20px', border: '2px dashed #ff6b35', borderRadius: '8px', backgroundColor: '#fff5f0' }}>
            <Text fw={600} size="md" color="#ff6b35" mb={4}>Video Recording Element</Text>
            <Text size="sm" color="dimmed">This element will enable video recording functionality in assignments</Text>
          </Box>
        </Box>
      );
    case "audiorecording":
      return (
        <Box mb="md" style={baseStyle}>
          <Box style={{ textAlign: 'center', padding: '20px', border: '2px dashed #007CFF', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
            <Text fw={600} size="md" color="#007CFF" mb={4}>Audio Recording Element</Text>
            <Text size="sm" color="dimmed">This element will enable audio recording functionality in assignments</Text>
          </Box>
        </Box>
      );
    case "timer":
      return (
        <Box mb="md" style={baseStyle}>
          <Box style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
            <Text fw={600} size="md" mb={8}>Page Timer</Text>
            <Text size="lg" fw={700} style={{ fontFamily: 'monospace' }}>00:00</Text>
            <Text size="xs" color="dimmed" mt={4}>Time tracking will be active during assignments</Text>
          </Box>
        </Box>
      );
    default:
      return (<Text style={baseStyle}>{content}</Text>);
  }
}

// The main JotformViewer component
export function JotformViewer({ jotformName, onBack, hideBackButton = false, onSubmit }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!jotformName) {
      setLoading(false);
      notifications.show({
        title: "Error",
        message: "No Jotform name was provided.",
        color: "red",
      });
      return;
    }

    const fetchJotform = async () => {
      setLoading(true);
      setPageIndex(0);
      try {
        const response = await axios.get(`http://localhost:8081/api/jotforms`, {
          withCredentials: true,
        });

        const foundForm = response.data.find(form => form.jotformName === jotformName);

        if (foundForm) {
          setFormData(foundForm);
        } else {
          notifications.show({
            title: "Not Found",
            message: `Jotform with name "${jotformName}" could not be found.`,
            color: "orange",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Network Error",
          message: "Failed to load the form. Please check your connection and try again.",
          color: "red",
        });
        console.error("Fetch Jotform Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJotform();
  }, [jotformName]);

  const handlePrevious = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNext = () => {
    if (formData && pageIndex < formData.totalPages - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    } else {
      notifications.show({
        title: "Success!",
        message: "The form has been submitted successfully.",
        color: "green",
      });
      console.log('Form submitted:', formData);
    }
  };

  const renderNavigationButtons = () => {
    if (!formData || formData.totalPages <= 1) {
      return null;
    }

    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === formData.totalPages - 1;

    return (
      <Group justify="center" mt="xl">
        {!isFirstPage && (
          <Button variant="outline" onClick={handlePrevious} size="md">
            Back
          </Button>
        )}
        {isLastPage ? (
          <Button onClick={handleSubmit} size="md" color="green">
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext} size="md">
            Next
          </Button>
        )}
      </Group>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box ta="center" mt="xl">
          <Loader />
          <Text mt="md">Loading Form...</Text>
        </Box>
      );
    }

    if (formData && formData.pages && formData.pages[pageIndex]) {
      const page = formData.pages[pageIndex];
      return (
        <Box style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "40px",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          minHeight: "60vh"
        }}>
          <Text fw={800} size="xl" ta="center" mb="md">
            {formData.jotformName}
          </Text>

          {formData.totalPages > 1 && (
            <Text ta="center" size="sm" color="dimmed" mb="xl">
              Page {pageIndex + 1} of {formData.totalPages}
            </Text>
          )}

          <Box mb="xl">
            {page.elements
              .sort((a, b) => a.sequence - b.sequence)
              .map((element) => (
                <RenderElement key={element.id} element={element} />
              ))
            }
          </Box>
          {renderNavigationButtons()}
        </Box>
      );
    }

    return (
      <Box ta="center" mt="xl">
        <Text color="dimmed">No content available. A notification may have indicated an error.</Text>
      </Box>
    );
  };

  return (
    <Box p={hideBackButton ? "md" : "xl"}>
      {!hideBackButton && (
        <button
          onClick={onBack}
          style={{
            background: "#333",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            marginBottom: "20px",
            cursor: "pointer",
            border: "none",
            fontSize: "14px"
          }}
        >
          ⬅ Back to Courses
        </button>
      )}

      {renderContent()}
    </Box>
  );
}
