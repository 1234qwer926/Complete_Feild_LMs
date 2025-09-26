import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Box,
  Group,
  Alert,
  Badge,
  Card,
  Stack,
  Center,
  Loader,
  Image,
  Divider,
  Progress
} from '@mantine/core';
import {
  IconCamera,
  IconVideo,
  IconCheck,
  IconAlertCircle,
  IconPhoto,
  IconArrowLeft,
  IconInfoCircle,
  IconArrowRight,
  IconEye,
  IconRecordMail,
  IconDownload,
  IconExternalLink,
  IconMicrophone
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


export function JotformAssignment() {
  const { jotformId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseName = searchParams.get('course');
  // Step management
  const [step, setStep] = useState('setup');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // Webcam states
  const [webcamReady, setWebcamReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);


  // Photo states
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);


  // Assignment states
  const [formData, setFormData] = useState(null);
  const [jotformContent, setJotformContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Random number states
  const [randomInteger, setRandomInteger] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);
  const [processedPages, setProcessedPages] = useState([]);


  // Recording states
  const [currentRecording, setCurrentRecording] = useState(null);
  const [recordedAnswers, setRecordedAnswers] = useState([]);


  // Proctoring states
  const [fullscreen, setFullscreen] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [showLiveVideo, setShowLiveVideo] = useState(true);


  // Face recognition states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [lightingIssue, setLightingIssue] = useState(false);


  // Speech Recognition state
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();


  const webcamRef = useRef(null);
  const liveVideoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptRef = useRef(''); // Ref to hold the latest transcript


  // Keep the ref updated with the latest transcript
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);


  // Video constraints
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };
  const liveVideoConstraints = {
    width: 220,
    height: 165,
    facingMode: "user",
    frameRate: 30
  };


  // Initialize component and load face detection models
  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        const MODEL_URL = '/models'; // Place face-api.js models in public/models folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log('Face recognition models loaded');
      } catch (error) {
        console.error('Error loading face models:', error);
      }
    };
    loadFaceModels();


    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  // Face detection logic
  useEffect(() => {
    if (modelsLoaded && step === 'exam') {
      const detectFaces = async () => {
        if (liveVideoRef.current && liveVideoRef.current.video && liveVideoRef.current.video.readyState === 4) {
          const video = liveVideoRef.current.video;
          const canvas = faceCanvasRef.current;
          if (canvas) {
            const detections = await faceapi.detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            );


            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);


            const brightness = await checkBrightness(video);
            setLightingIssue(brightness < 50);


            if (detections.length === 0) {
              setFaceDetected(false);
              setMultipleFaces(false);
            } else if (detections.length > 1) {
              setFaceDetected(true);
              setMultipleFaces(true);
            } else {
              setFaceDetected(true);
              setMultipleFaces(false);
            }


            const resizedDetections = faceapi.resizeResults(detections, {
              width: video.videoWidth,
              height: video.videoHeight
            });


            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            faceapi.draw.drawDetections(canvas, resizedDetections);
          }
        }
      };


      const interval = setInterval(detectFaces, 2000);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, step, lightingIssue]);


  // Check brightness level
  const checkBrightness = async (video) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;


    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;


    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }


    return brightness / (data.length / 4);
  };


  const handleUserMedia = (stream) => {
    setWebcamReady(true);
    streamRef.current = stream;
    setWebcamError(null);
  };


  const handleUserMediaError = (error) => {
    setWebcamError(error.message);
    setWebcamReady(false);
  };


  const takePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedPhoto(imageSrc);
        setPhotoTaken(true);
      }
    }
  };


  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoTaken(false);
  };


  const loadJotformContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8081/api/jotforms`, {
          withCredentials: true, // This tells Axios to send the HttpOnly cookie
        });
      const foundForm = response.data.find(form => form.jotformName === jotformId);


      if (foundForm) {
        setFormData(foundForm);
        let randomInt = null;
        for (const page of foundForm.pages) {
          for (const element of page.elements) {
            if (element.tagName === 'randominteger') {
              randomInt = parseInt(element.content);
              break;
            }
          }
          if (randomInt) break;
        }


        if (randomInt) {
          setRandomInteger(randomInt);
          const generatedRandomNumber = Math.floor(Math.random() * randomInt) + 1;
          setRandomNumber(generatedRandomNumber);


          const processedPagesData = foundForm.pages.map(page => {
            const paragraphs = page.elements
              .filter(elem => elem.tagName === 'paragraph')
              .sort((a, b) => a.sequence - b.sequence);


            const videoRecording = page.elements.find(elem => elem.tagName === 'videorecording');
            const selectedParagraph = paragraphs[generatedRandomNumber - 1];


            return {
              pageNumber: page.page,
              selectedParagraph: selectedParagraph || null,
              hasVideoRecording: !!videoRecording,
              totalParagraphs: paragraphs.length
            };
          });


          setProcessedPages(processedPagesData);
          setCurrentPageIndex(0);
          setJotformContent({
            title: foundForm.title || `Assignment - ${courseName}`,
            pages: processedPagesData,
            randomNumber: generatedRandomNumber,
            ...foundForm
          });
        } else {
          throw new Error('No randominteger element found in the form');
        }
      } else {
        throw new Error(`No jotform found with name: ${jotformId}`);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };


  const handleNextPage = () => {
    if (currentPageIndex < processedPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };


  const toggleLiveVideo = () => setShowLiveVideo(!showLiveVideo);


  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
      setMonitoring(true);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
  };


  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setFullscreen(false);
      notifications.show({
        title: 'Warning: Fullscreen Exited',
        message: 'Exiting fullscreen mode may be flagged.',
        color: 'orange'
      });
    }
  };


  const startRecording = async () => {
    if (streamRef.current && !currentRecording) {
      try {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        const mediaRecorder = new MediaRecorder(streamRef.current, {
          mimeType: 'video/webm; codecs=vp9,opus',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });


        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) chunks.push(event.data);
        };


        mediaRecorder.onstop = () => {
          SpeechRecognition.stopListening();
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);


          const currentPage = processedPages[currentPageIndex];
          const questionData = {
            id: Date.now(),
            blob,
            url,
            pageNumber: currentPageIndex + 1,
            questionText: currentPage.selectedParagraph?.content || 'No question text',
            transcript: transcriptRef.current, // Use ref to get latest transcript
            timestamp: new Date().toISOString(),
            randomQuestionNumber: randomNumber
          };


          setRecordedAnswers(prev => [...prev, questionData]);
          setCurrentRecording(null);
          notifications.show({
            title: 'Recording Saved',
            message: `Answer for page ${currentPageIndex + 1} recorded.`,
            color: 'green'
          });
        };


        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setCurrentRecording({ startTime: Date.now(), pageNumber: currentPageIndex + 1 });
        notifications.show({ title: 'Recording Started', message: 'Speak your answer now...', color: 'blue' });


      } catch (error) {
        notifications.show({ title: 'Recording Failed', message: 'Could not start recording.', color: 'red' });
      }
    }
  };


  const stopRecording = () => {
    if (mediaRecorderRef.current && currentRecording) {
      mediaRecorderRef.current.stop();
    }
  };


  // Helper function to convert base64 data URL to a Blob
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }


  // ### FULLY CORRECTED submitAssignment function ###
const submitAssignment = async () => {
  try {
    const username = "rahul"; // This should come from auth context
    const userid = "user101";  

      // 1. Prepare the JSON payload
      const submissionDto = {
        jotformId: jotformId, // Use the jotformId from params
        username: username,
        userId: userid,
        warnings: [`MultipleFaces Detected: ${multipleFaces}`, `Lighting Issue: ${lightingIssue}`],
        answers: recordedAnswers.map(ans => ({
          questionText: ans.questionText,
          transcript: ans.transcript,
        })),
      };


    const formData = new FormData();
    formData.append('submission', JSON.stringify(submissionDto));

    if (capturedPhoto) {
      const photoBlob = dataURLtoBlob(capturedPhoto);
      formData.append('photo', photoBlob, 'identity-photo.jpg');
    }

    recordedAnswers.forEach((answer, index) => {
      formData.append('videos', answer.blob, `answer-video-${index + 1}.webm`);
    });

    // --- START OF CORRECTION ---
    // Use the full, correct URL that matches your backend controller's mapping.
    const endpoint = 'http://localhost:8081/api/assignment/submit-answer';
    // --- END OF CORRECTION ---

    await axios.post(endpoint, formData, {
      withCredentials: true, // This is correct and necessary
    });

    setStep('completed');

  } catch (error) {
    console.error('❌ SUBMISSION ERROR:', error.response ? error.response.data : error.message);
    notifications.show({
      title: 'Submission Failed',
      message: error.response ? `Server Error: ${error.response.statusText}` : 'An unexpected error occurred.',
      color: 'red'
    });
  }
};

  const goBack = () => {
    if (window.confirm('Exit assignment? Progress will be lost.')) navigate(-1);
  };


  // UI Components for each step
  if (step === 'setup') {
    return (
      <Container size="md" py="xl">
        <Title order={2} ta="center" mb="xl">Assignment Setup - {courseName}</Title>
        <Card shadow="sm" padding="lg" radius="md" mb="xl">
          <Title order={4} mb="md">Camera & Proctoring Setup</Title>
          <Text size="sm" color="dimmed" mb="md">Please allow camera and microphone access.</Text>
          <Stack>
            <Group justify="space-between">
              <Group>
                <IconCamera size={20} />
                <Text>Camera & Microphone</Text>
                {webcamReady && <Badge color="green">Ready</Badge>}
                {webcamError && <Badge color="red">Error</Badge>}
              </Group>
            </Group>
            {webcamError && <Alert color="red" size="sm"><strong>Error:</strong> {webcamError}</Alert>}
            <Center>
              <Webcam
                audio={true} ref={webcamRef} screenshotFormat="image/jpeg"
                width={300} height={200} videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia} onUserMediaError={handleUserMediaError}
                style={{ borderRadius: 8, backgroundColor: '#000', border: webcamReady ? '2px solid #51cf66' : '2px solid #868e96' }}
              />
            </Center>
          </Stack>
        </Card>
        <Group justify="space-between">
          <Button variant="outline" onClick={goBack} leftSection={<IconArrowLeft size={16} />}>Back</Button>
          {webcamReady && <Button onClick={() => setStep('photo')} size="lg">Continue</Button>}
        </Group>
      </Container>
    );
  }


  if (step === 'photo') {
    return (
      <Container size="md" py="xl">
        <Title order={2} ta="center" mb="xl">Identity Photo Capture</Title>
        <Card shadow="sm" padding="lg" radius="md" mb="xl">
          <Title order={4} mb="md">Take Your Photo</Title>
          <Center mb="lg">
            {!photoTaken ? (
              <Box ta="center">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={400} height={300} videoConstraints={videoConstraints} style={{ borderRadius: 8, marginBottom: 16, backgroundColor: '#000' }} />
                <Button leftSection={<IconPhoto size={16} />} onClick={takePhoto} size="lg" disabled={!webcamReady}>Take Photo</Button>
              </Box>
            ) : (
              <Box ta="center">
                <Image src={capturedPhoto} alt="Identity" style={{ width: 400, height: 300, borderRadius: 8, marginBottom: 16 }} />
                <Group justify="center">
                  <Button variant="outline" onClick={retakePhoto}>Retake</Button>
                  <Button onClick={() => setStep('verification')} color="green">Use Photo</Button>
                </Group>
              </Box>
            )}
          </Center>
        </Card>
        <Group justify="space-between">
          <Button variant="outline" onClick={() => setStep('setup')} leftSection={<IconArrowLeft size={16} />}>Back</Button>
        </Group>
      </Container>
    );
  }


  if (step === 'verification') {
    return (
      <Container size="md" py="xl">
        <Title order={2} ta="center" mb="xl">Identity Verification</Title>
        <Stack>
          <Card shadow="sm" padding="lg" radius="md">
            <Group justify="space-between" mb="md">
              <Group><IconPhoto size={20} /><Text>Identity Photo</Text>{photoTaken && <Badge color="green">Captured</Badge>}</Group>
              <Button size="sm" variant="outline" onClick={() => setStep('photo')}>Change</Button>
            </Group>
            {capturedPhoto && <Center><Image src={capturedPhoto} alt="Identity" style={{ width: 200, height: 150, borderRadius: 8 }} /></Center>}
          </Card>
          {photoTaken && (
            <Card shadow="sm" padding="lg" radius="md">
              <Alert color="orange" mb="md">The exam will start in fullscreen with live monitoring. You cannot go back.</Alert>
              <Center>
                <Button onClick={() => { loadJotformContent(); setStep('exam'); setTimeout(enterFullscreen, 1000); }} size="lg" color="green">Start Assignment</Button>
              </Center>
            </Card>
          )}
        </Stack>
        <Group justify="space-between" mt="md">
          <Button variant="outline" onClick={() => setStep('photo')} leftSection={<IconArrowLeft size={16} />}>Back</Button>
        </Group>
      </Container>
    );
  }


  if (step === 'exam') {
    if (!browserSupportsSpeechRecognition) {
      return <Container size="md" py="xl"><Alert color="red">Speech recognition not supported. Please use Chrome.</Alert></Container>;
    }
    if (loading) {
      return <Container size="xl" py="xl"><Center><Stack align="center"><Loader /><Text>Loading...</Text></Stack></Center></Container>;
    }
    if (error) {
      return <Container size="md" py="xl"><Alert color="red">Error: {error}<Button mt="md" onClick={loadJotformContent}>Retry</Button></Alert></Container>;
    }
    if (!processedPages.length) {
      return <Container size="md" py="xl"><Center><Text>No pages to display.</Text></Center></Container>;
    }
    const currentPage = processedPages[currentPageIndex];
    const isLastPage = currentPageIndex === processedPages.length - 1;
    const progressPercentage = ((currentPageIndex + 1) / processedPages.length) * 100;
    return (
      <Box>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#1a1a1a', color: 'white', padding: '8px 16px', zIndex: 1001, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Group>
            <Badge color="red" variant="dot">MONITORING</Badge>
            <Badge color={listening ? 'orange' : 'blue'} variant="dot">{listening ? 'LISTENING' : 'READY'}</Badge>
          </Group>
          <Group>
            <Badge color={faceDetected ? 'green' : 'red'}>{faceDetected ? 'Face OK' : 'No Face'}</Badge>
            <Button size="xs" variant="subtle" onClick={toggleLiveVideo}><IconEye size={14} /> {showLiveVideo ? 'Hide' : 'Show'}</Button>
            {!fullscreen && <Button size="xs" onClick={enterFullscreen}>Go Fullscreen</Button>}
          </Group>
        </Box>
        {showLiveVideo && (
          <Box style={{ position: 'fixed', top: 60, right: 20, width: 220, height: 165, zIndex: 1000, border: `3px solid ${faceDetected ? '#51cf66' : '#ff6b6b'}`, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <Webcam audio={false} ref={liveVideoRef} mirrored muted videoConstraints={liveVideoConstraints} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={faceCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            <Box style={{ position: 'absolute', top: 8, left: 8, background: '#ff4757', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>LIVE</Box>
            {currentRecording && <Box style={{ position: 'absolute', top: 8, right: 8, background: '#ff4757', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '11px' }}>REC {Math.floor((Date.now() - currentRecording.startTime) / 1000)}s</Box>}
          </Box>
        )}
        <Box style={{ position: 'fixed', top: -1000, left: -1000 }}><Webcam audio muted ref={webcamRef} onUserMedia={handleUserMedia} videoConstraints={videoConstraints} /></Box>
        <Container size="xl" py="md" pt={60} style={{ paddingRight: showLiveVideo ? 260 : 20 }}>
          <Title order={3} mb="md" ta="center">Assignment: {jotformContent.title}</Title>
          <Card shadow="sm" p="sm" radius="md" mb="lg">
            <Group justify="space-between" mb="xs"><Text size="sm" weight={500}>Progress</Text><Text size="sm" color="dimmed">Page {currentPageIndex + 1}/{processedPages.length}</Text></Group>
            <Progress value={progressPercentage} color="blue" />
          </Card>
          <Card shadow="lg" p="xl" radius="md" mb="lg">
            <Group justify="space-between" mb="md"><Title order={4}>Page {currentPage.pageNumber}</Title><Badge color="blue" size="lg">Q{randomNumber}/{currentPage.totalParagraphs}</Badge></Group>
            {currentPage.selectedParagraph ? <Text size="lg" mb="md" style={{ lineHeight: 1.8 }}>{currentPage.selectedParagraph.content}</Text> : <Alert color="orange">No question available.</Alert>}
            {currentPage.hasVideoRecording && (
              <Box>
                <Divider my="lg" />
                <Text weight={600} size="md" mb="md">Record your answer:</Text>
                <Box p="xl" style={{ border: '2px dashed #dee2e6', borderRadius: 12, textAlign: 'center', background: '#f8f9fa' }}>
                  <IconVideo size={56} color="#868e96" style={{ marginBottom: 16 }} />
                  {recordedAnswers.some(a => a.pageNumber === currentPageIndex + 1) && <Badge color="green" size="lg"><IconCheck size={14} /> Answer Recorded</Badge>}
                </Box>
                {listening && (
                  <Box mt="lg" p="md" style={{ border: '1px solid #ced4da', borderRadius: 8, background: '#f1f3f5' }}>
                    <Group mb="xs"><IconMicrophone size={16} /><Text size="sm" weight={500}>Live Transcript...</Text></Group>
                    <Text color="dimmed">{transcript || "Start speaking..."}</Text>
                  </Box>
                )}
                <Center mt="xl">
                  {!currentRecording ? <Button onClick={startRecording} color="red" size="xl">Record Answer</Button> : <Button onClick={stopRecording} color="green" size="xl">Stop Recording ({Math.floor((Date.now() - currentRecording.startTime) / 1000)}s)</Button>}
                </Center>
              </Box>
            )}
          </Card>
          <Card shadow="sm" p="lg" radius="md" style={{ background: '#f8f9fa' }}>
            <Group justify="space-between">
              <Text size="sm" color="dimmed">Page {currentPageIndex + 1} of {processedPages.length}</Text>
              {!isLastPage ? <Button onClick={handleNextPage} size="lg" color="blue">Next Page</Button> : <Button onClick={submitAssignment} size="lg" color="green">Submit Assignment</Button>}
            </Group>
          </Card>
        </Container>
      </Box>
    );
  }


  if (step === 'completed') {
    return (
      <Container size="md" py="xl">
        <Center><Stack align="center">
          <IconCheck size={64} color="green" /><Title order={2}>Assignment Completed</Title>
          <Text color="dimmed">Your assignment has been submitted successfully.</Text>
          <Button onClick={() => navigate('/dashboard')} mt="lg" size="lg">Return to Dashboard</Button>
        </Stack></Center>
      </Container>
    );
  }


  return null;
}
