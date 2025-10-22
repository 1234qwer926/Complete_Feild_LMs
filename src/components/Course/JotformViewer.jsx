import React, { useState, useEffect } from "react";
import { 
  Loader, 
  Text, 
  Box, 
  Divider, 
  Image, 
  Group, 
  Button,
  Progress,
  Badge,
  Center,
  ActionIcon,
  Tooltip,
  Flex,
  Container,
  Title,
} from "@mantine/core";
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconCircleDot,
  IconDots,
  IconPlayerPlay,
  IconCheck,
  IconX,
  IconBook,
  IconProgress,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import axios from "axios";

// Helper component to render a single dynamic element based on its tagName
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
                        src={typeof content === "string" ? content : (content?.fileUrl || content)}
                        alt={element.elementName || placeholder || "Image"}
                        width={width || undefined}
                        height={height || undefined}
                        fit="contain"
                        withPlaceholder
                        placeholder={
                            <Center>
                                <IconBook size={48} color="gray" />
                                <Text size="sm" c="dimmed" mt="sm">Loading image...</Text>
                            </Center>
                        }
                    />
                    {typeof content === "object" && content?.fileName && (
                        <Text size="xs" mt={4} c="dimmed">{content.fileName}</Text>
                    )}
                </Box>
            );
        case "video":
            return (
                <Box mb="md" style={baseStyle}>
                    <video 
                        width={width || "100%"} 
                        height={height || "auto"} 
                        controls 
                        style={{ borderRadius: 8 }}
                        poster={element.poster || undefined}
                    >
                        <source src={content} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {element.elementName && (
                        <Text size="xs" mt={4} c="dimmed">{element.elementName}</Text>
                    )}
                </Box>
            );
        case "audio":
            return (
                <Box mb="md" style={baseStyle}>
                    <audio controls style={{ width: "100%", borderRadius: 6 }}>
                        <source src={content} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    {element.elementName && (
                        <Text size="xs" mt={4} c="dimmed">{element.elementName}</Text>
                    )}
                </Box>
            );
        case "horizontalline":
        case "breakline":
            return <Divider my="md" style={baseStyle} />;
        case "orderedlist":
            return (
                <ol style={{ ...baseStyle, paddingLeft: 24, marginBottom: 16 }}>
                    {(content || "Item 1, Item 2").split(",").map((item, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                            {item.trim() || `Item ${idx + 1}`}
                        </li>
                    ))}
                </ol>
            );
        case "unorderedlist":
            return (
                <ul style={{ ...baseStyle, paddingLeft: 24, marginBottom: 16 }}>
                    {(content || "Item 1, Item 2").split(",").map((item, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                            {item.trim() || `Item ${idx + 1}`}
                        </li>
                    ))}
                </ul>
            );
        case "randominteger":
            return (
                <Box mb="md" style={baseStyle}>
                    <Text fw={500} size="md" mb={4}>Random Integer</Text>
                    <Flex align="center" gap="md" p="md" style={{ 
                        background: '#f0f7ff', 
                        borderRadius: '8px', 
                        border: '1px solid #d1e8ff',
                        maxWidth: 200
                    }}>
                        <Text size="xl" fw={700} style={{ fontFamily: 'monospace', color: '#007CFF' }}>
                            {content || '0'}
                        </Text>
                        <Badge color="blue" variant="light" size="sm">
                            Generated
                        </Badge>
                    </Flex>
                </Box>
            );
        case "videorecording":
            return (
                <Box mb="md" style={baseStyle}>
                    <Box style={{ 
                        textAlign: 'center', 
                        padding: '24px', 
                        border: '2px dashed #ff6b35', 
                        borderRadius: '12px', 
                        backgroundColor: '#fff5f0',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <IconPlayerPlay size={48} color="#ff6b35" style={{ marginBottom: 12 }} />
                        <Text fw={600} size="md" color="#ff6b35" mb={4}>
                            Video Recording
                        </Text>
                        <Text size="sm" color="dimmed" style={{ maxWidth: 200 }}>
                            Click to record video for this assignment
                        </Text>
                        {required && <Text size="xs" color="red" mt={4}>Required</Text>}
                    </Box>
                </Box>
            );
        case "audiorecording":
            return (
                <Box mb="md" style={baseStyle}>
                    <Box style={{ 
                        textAlign: 'center', 
                        padding: '24px', 
                        border: '2px dashed #007CFF', 
                        borderRadius: '12px', 
                        backgroundColor: '#f0f7ff',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <IconPlayerPlay size={48} color="#007CFF" style={{ marginBottom: 12 }} />
                        <Text fw={600} size="md" color="#007CFF" mb={4}>
                            Audio Recording
                        </Text>
                        <Text size="sm" color="dimmed" style={{ maxWidth: 200 }}>
                            Click to record audio for this assignment
                        </Text>
                        {required && <Text size="xs" color="red" mt={4}>Required</Text>}
                    </Box>
                </Box>
            );
        case "timer":
            return (
                <Box mb="md" style={baseStyle}>
                    <Box style={{ 
                        padding: '16px', 
                        border: '2px solid #007CFF', 
                        borderRadius: '12px', 
                        backgroundColor: '#f0f7ff',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Progress 
                            size="xs" 
                            value={33} 
                            color="blue" 
                            radius="xl"
                            style={{ marginBottom: 8 }}
                            sections={[
                                { value: 33, color: 'blue' },
                                { value: 67, color: 'gray' }
                            ]}
                        />
                        <Text fw={600} size="md" mb={4} c="blue">
                            Time Tracker
                        </Text>
                        <Text size="lg" fw={700} style={{ fontFamily: 'monospace', color: '#007CFF' }}>
                            02:30
                        </Text>
                        <Text size="xs" color="dimmed" mt={4}>
                            Time spent on this page
                        </Text>
                    </Box>
                </Box>
            );
        default:
            return (
                <Box mb="md" style={baseStyle}>
                    <Text>{content || placeholder || "Content not available"}</Text>
                    {element.elementName && (
                        <Text size="xs" mt={2} c="dimmed">{element.elementName}</Text>
                    )}
                </Box>
            );
    }
}

// Progress Bar Navigation Component
function ProgressNavigation({ 
  totalPages, 
  currentPage, 
  onPageChange, 
  onPrevious, 
  onNext, 
  onSubmit,
  isLastPage,
  showProgress = true 
}) {
  const [hoveredPage, setHoveredPage] = useState(null);

  const getProgress = () => {
    return ((currentPage + 1) / totalPages) * 100;
  };

  const renderPageIndicators = () => {
    const indicators = [];
    const maxVisible = 7; // Show up to 7 page indicators
    let start = 0;
    let end = totalPages - 1;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) {
        const isActive = i === currentPage;
        const isHovered = hoveredPage === i;
        indicators.push(
          <Tooltip key={`page-${i}`} label={`Page ${i + 1}`} position="top" withArrow>
            <ActionIcon
              size={28}
              variant={isActive ? "filled" : "subtle"}
              color={isActive ? "blue" : "gray"}
              onClick={() => onPageChange(i)}
              onMouseEnter={() => setHoveredPage(i)}
              onMouseLeave={() => setHoveredPage(null)}
              style={{ 
                cursor: 'pointer',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                border: isActive ? '2px solid #228BE6' : '1px solid transparent'
              }}
            >
              <IconCircleDot 
                size={isActive ? 20 : 16} 
                fill={isActive ? "white" : "none"} 
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>
        );
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage < 3) {
        // Near beginning - show first pages
        start = 0;
        end = maxVisible - 2;
      } else if (currentPage > totalPages - 4) {
        // Near end - show last pages
        start = totalPages - maxVisible + 1;
        end = totalPages - 1;
      } else {
        // Middle - center around current page
        start = currentPage - 2;
        end = currentPage + 2;
      }

      // First page
      indicators.push(
        <Tooltip key="first" label="Page 1" position="top" withArrow>
          <ActionIcon
            size={28}
            variant="subtle"
            color="gray"
            onClick={() => onPageChange(0)}
            onMouseEnter={() => setHoveredPage(0)}
            onMouseLeave={() => setHoveredPage(null)}
            style={{ cursor: 'pointer' }}
          >
            <IconCircleDot size={16} />
          </ActionIcon>
        </Tooltip>
      );

      // Left ellipsis if needed
      if (start > 1) {
        indicators.push(
          <Tooltip key="left-ellipsis" label="..." position="top" withArrow>
            <ActionIcon size={28} disabled style={{ opacity: 0.4 }}>
              <IconDots size={16} />
            </ActionIcon>
          </Tooltip>
        );
      }

      // Visible pages
      for (let i = start; i <= end; i++) {
        const isActive = i === currentPage;
        const isHovered = hoveredPage === i;
        indicators.push(
          <Tooltip key={`page-${i}`} label={`Page ${i + 1}`} position="top" withArrow>
            <ActionIcon
              size={28}
              variant={isActive ? "filled" : "subtle"}
              color={isActive ? "blue" : "gray"}
              onClick={() => onPageChange(i)}
              onMouseEnter={() => setHoveredPage(i)}
              onMouseLeave={() => setHoveredPage(null)}
              style={{ 
                cursor: 'pointer',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                border: isActive ? '2px solid #228BE6' : '1px solid transparent'
              }}
            >
              <IconCircleDot 
                size={isActive ? 20 : 16} 
                fill={isActive ? "white" : "none"} 
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>
        );
      }

      // Right ellipsis if needed
      if (end < totalPages - 2) {
        indicators.push(
          <Tooltip key="right-ellipsis" label="..." position="top" withArrow>
            <ActionIcon size={28} disabled style={{ opacity: 0.4 }}>
              <IconDots size={16} />
            </ActionIcon>
          </Tooltip>
        );
      }

      // Last page
      if (end < totalPages - 1) {
        indicators.push(
          <Tooltip key="last" label={`Page ${totalPages}`} position="top" withArrow>
            <ActionIcon
              size={28}
              variant="subtle"
              color="gray"
              onClick={() => onPageChange(totalPages - 1)}
              onMouseEnter={() => setHoveredPage(totalPages - 1)}
              onMouseLeave={() => setHoveredPage(null)}
              style={{ cursor: 'pointer' }}
            >
              <IconCircleDot size={16} />
            </ActionIcon>
          </Tooltip>
        );
      }
    }

    return indicators;
  };

  const renderNavigation = () => {
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === totalPages - 1;

    return (
      <Flex 
        direction="column" 
        align="center" 
        gap="md"
        style={{ width: '100%' }}
      >
        {/* Navigation Buttons */}
        <Group justify="center" gap="lg" wrap="nowrap">
          {!isFirstPage && (
            <Tooltip label="Previous Page" position="top" withArrow>
              <Button 
                variant="outline" 
                size="md" 
                leftSection={<IconChevronLeft size={16} />}
                onClick={onPrevious}
                style={{ flexShrink: 0 }}
              >
                Back
              </Button>
            </Tooltip>
          )}

          <Flex 
            direction="column" 
            align="center" 
            gap={8}
            style={{ flex: 1, minWidth: 200 }}
          >
            {/* Progress Bar */}
            <Progress 
              size="md" 
              value={getProgress()} 
              color="blue"
              radius="xl"
              style={{ 
                width: '100%',
                maxWidth: 300,
                height: 8
              }}
              sections={[
                { value: getProgress(), color: 'blue' },
                { value: 100 - getProgress(), color: 'gray' }
              ]}
            />

            {/* Progress Info */}
            <Group gap="xs" justify="center" wrap="nowrap">
              <Text size="sm" fw={500} c="blue">
                {Math.round(getProgress())}%
              </Text>
              <Text size="xs" c="dimmed">
                • Page {currentPage + 1} of {totalPages}
              </Text>
            </Group>
          </Flex>

          {isLastPage ? (
            <Tooltip label="Submit Learning Material" position="top" withArrow>
              <Button 
                size="md" 
                color="green"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={onSubmit}
                style={{ flexShrink: 0 }}
              >
                Submit
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Next Page" position="top" withArrow>
              <Button 
                size="md" 
                leftSection={<IconChevronRight size={16} />}
                onClick={onNext}
                style={{ flexShrink: 0 }}
              >
                Next
              </Button>
            </Tooltip>
          )}
        </Group>

        {/* Page Indicators (only show if more than 3 pages) */}
        {totalPages > 3 && (
          <Box>
            <Center>
              <Group gap="xs" justify="center">
                {renderPageIndicators()}
              </Group>
            </Center>
            <Text size="xs" c="dimmed" ta="center" mt={4} style={{ fontSize: '11px' }}>
              Click dots to jump to any page
            </Text>
          </Box>
        )}
      </Flex>
    );
  };

  return (
    <Box style={{ width: '100%' }}>
      {showProgress && renderNavigation()}
    </Box>
  );
}

// The main JotformViewer component
export function JotformViewer({ jotformName, onBack, hideBackButton = false, onSubmit }) {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [submissionStatus, setSubmissionStatus] = useState(null);

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
            setSubmissionStatus(null);
            try {
                const response = await axios.get(`http://localhost:8081/api/jotforms`, {
                    withCredentials: true,
                });

                const foundForm = response.data.find(form => form.jotformName === jotformName);
                if (foundForm) {
                    // Ensure pages array exists and is properly structured
                    if (!foundForm.pages || !Array.isArray(foundForm.pages)) {
                        foundForm.pages = [];
                    }
                    
                    // Ensure each page has elements array
                    foundForm.pages = foundForm.pages.map(page => ({
                        ...page,
                        elements: Array.isArray(page.elements) ? page.elements : []
                    }));

                    setFormData(foundForm);
                } else {
                    notifications.show({
                        title: "Not Found",
                        message: `Learning material "${jotformName}" could not be found.`,
                        color: "orange",
                    });
                }
            } catch (err) {
                console.error("Fetch Jotform Error:", err);
                notifications.show({
                    title: "Network Error",
                    message: "Failed to load the learning material. Please check your connection and try again.",
                    color: "red",
                });
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

    const handlePageChange = (newPageIndex) => {
        if (newPageIndex >= 0 && newPageIndex < (formData?.totalPages || 0)) {
            setPageIndex(newPageIndex);
        }
    };

    const handleSubmit = async () => {
        if (!formData) return;

        try {
            setSubmissionStatus('submitting');
            
            // Prepare submission data
            const submissionData = {
                jotformName: formData.jotformName,
                totalPages: formData.totalPages,
                completedPages: pageIndex + 1,
                submissionTime: new Date().toISOString(),
                pages: formData.pages.map((page, index) => ({
                    page: index + 1,
                    elements: page.elements.map(element => ({
                        id: element.id,
                        tagName: element.tagName,
                        elementName: element.elementName,
                        content: element.content,
                        sequence: element.sequence
                    }))
                }))
            };

            // Call custom submit handler if provided
            if (onSubmit) {
                await onSubmit(submissionData);
            } else {
                // Default submission to backend
                const response = await axios.post(
                    `http://localhost:8081/api/jotforms/${formData.id}/submit`,
                    submissionData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );

                notifications.show({
                    title: "Success!",
                    message: `Learning material "${formData.jotformName}" submitted successfully!`,
                    color: "green",
                    icon: <IconCheck size={18} />,
                });

                // Call onBack if submission successful
                if (onBack) {
                    setTimeout(() => onBack(), 1500);
                }
            }

            setSubmissionStatus('success');
        } catch (error) {
            console.error("Submission Error:", error);
            setSubmissionStatus('error');
            notifications.show({
                title: "Submission Failed",
                message: "There was an error submitting your learning material. Please try again.",
                color: "red",
                icon: <IconX size={18} />,
            });
        }
    };

    const renderNavigation = () => {
        if (!formData || formData.totalPages <= 1 || submissionStatus === 'success') {
            return null;
        }

        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === formData.totalPages - 1;
        const isSubmitting = submissionStatus === 'submitting';

        return (
            <ProgressNavigation
                totalPages={formData.totalPages}
                currentPage={pageIndex}
                onPageChange={handlePageChange}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                isLastPage={isLastPage}
                showProgress={true}
            />
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Container size="md" style={{ textAlign: 'center', paddingTop: 60 }}>
                    <Loader size="xl" />
                    <Title order={4} mt="md" c="dimmed">
                        Loading Learning Material
                    </Title>
                    <Text size="sm" c="dimmed" mt="xs">
                        Please wait while we prepare your content...
                    </Text>
                </Container>
            );
        }

        if (submissionStatus === 'success') {
            return (
                <Container size="md" style={{ textAlign: 'center', paddingTop: 60 }}>
                    <IconCheck size={64} color="green" style={{ marginBottom: 16 }} />
                    <Title order={2} c="green" mb="md">
                        Submission Successful!
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Thank you for completing "{formData?.jotformName}"
                    </Text>
                    <Button 
                        variant="outline" 
                        size="md"
                        onClick={onBack || (() => window.history.back())}
                        leftSection={<IconChevronLeft size={16} />}
                    >
                        Return to Dashboard
                    </Button>
                </Container>
            );
        }

        if (formData && formData.pages && formData.pages[pageIndex]) {
            const page = formData.pages[pageIndex];
            const hasElements = page.elements && page.elements.length > 0;

            return (
                <Container size={900} style={{ maxWidth: 900 }}>
                    <Box style={{
                        background: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        minHeight: "70vh"
                    }}>
                        {/* Header */}
                        <Box p="md" pb="xs" style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Title order={2} style={{ margin: 0, color: 'white' }}>
                                        {formData.jotformName}
                                    </Title>
                                    <Text size="sm" opacity={0.9}>
                                        Learning Material • {formData.totalPages} pages
                                    </Text>
                                </Box>
                                {pageIndex > 0 && (
                                    <Badge 
                                        color="blue" 
                                        variant="light" 
                                        size="lg"
                                        leftSection={<IconBook size={14} />}
                                    >
                                        Page {pageIndex + 1}
                                    </Badge>
                                )}
                            </Flex>
                        </Box>

                        {/* Content Area */}
                        <Box p="xl" style={{ minHeight: 400 }}>
                            {hasElements ? (
                                <Box>
                                    {page.elements
                                        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                                        .map((element, index) => (
                                            <Box key={`${element.id}-${index}`} mb="xl">
                                                <RenderElement element={element} />
                                            </Box>
                                        ))
                                    }
                                </Box>
                            ) : (
                                <Center style={{ height: 300, flexDirection: 'column' }}>
                                    <IconBook size={48} color="gray" style={{ opacity: 0.5 }} />
                                    <Title order={4} c="dimmed" mt="md">
                                        No Content
                                    </Title>
                                    <Text size="sm" c="dimmed" ta="center" mt="xs">
                                        This page doesn't contain any learning material yet.
                                    </Text>
                                </Center>
                            )}
                        </Box>

                        {/* Navigation */}
                        <Box px="xl" pb="xl" style={{ background: '#f8f9fa' }}>
                            {renderNavigation()}
                        </Box>
                    </Box>
                </Container>
            );
        }

        return (
            <Container size="md" style={{ textAlign: 'center', paddingTop: 60 }}>
                <IconBook size={48} color="gray" style={{ opacity: 0.5, marginBottom: 16 }} />
                <Title order={3} c="dimmed" mb="md">
                    Learning Material Not Found
                </Title>
                <Text size="md" c="dimmed" mb="xl">
                    The requested learning material could not be loaded.
                </Text>
                <Button 
                    variant="outline" 
                    size="md"
                    onClick={onBack || (() => window.history.back())}
                    leftSection={<IconChevronLeft size={16} />}
                >
                    Go Back
                </Button>
            </Container>
        );
    };

    return (
        <Box style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: hideBackButton ? "md" : "xl",
        }}>
            {!hideBackButton && (
                <Button
                    variant="subtle"
                    size="sm"
                    onClick={onBack}
                    leftSection={<IconChevronLeft size={14} />}
                    style={{
                        marginBottom: "20px",
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: '#374151',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    Back to Courses
                </Button>
            )}

            {renderContent()}
        </Box>
    );
}
