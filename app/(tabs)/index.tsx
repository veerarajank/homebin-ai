// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ThumbsUp, ThumbsDown, Recycle } from 'lucide-react-native';

// Import the new WebImageProcessor
import { WebImageProcessor } from './WebImageProcessor'; // Adjust path if needed

interface AnalysisResult {
  Id: number;
  bin_or_sack: string;
}

interface AnalysisResponse {
  results: AnalysisResult[];
}

export default function HomeScreen() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  // This state will either hold a URI (native) or a Blob (cropped web image) for analysis
  const [imageForAnalysis, setImageForAnalysis] = useState<string | Blob | null>(null);
  // New state to control when the WebImageProcessor (cropping UI) is shown
  const [showWebCropper, setShowWebCropper] = useState(false);
  // Store the original URI picked from gallery/camera on web, before cropping
  const [originalWebImageUri, setOriginalWebImageUri] = useState<string | null>(null);


  // Request permissions on component mount (only for native)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestPermissions();
    }
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'HomeBin AI needs camera and photo library access to analyze your waste items.',
        [{ text: 'OK' }]
      );
    }
  };

  const commonImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false, // We will handle editing on both platforms (Expo's for native, custom for web)
    quality: 1, // Get full quality to allow for better cropping/resizing later
    aspect: [4, 3] as [number, number], // Explicitly type for TS
  };


  const takePhotoWithCamera = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Denied',
            'Please enable camera access in your device settings to take photos.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        ...commonImagePickerOptions,
        allowsEditing: Platform.OS !== 'web', // Re-enable Expo's built-in editor for native
      });

      if (!result.canceled && result.assets[0]) {
        if (Platform.OS === 'web') {
          setOriginalWebImageUri(result.assets[0].uri);
          setShowWebCropper(true); // Show the web cropper for this image
        } else {
          // Native already handled editing if allowsEditing was true
          setSelectedImageUri(result.assets[0].uri);
          setImageForAnalysis(result.assets[0].uri);
        }
        resetAnalysisState();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const pickImageFromGallery = async () => { // Renamed from pickImageFromGalleryNative for common use
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Permission Denied',
            'Please enable photo library access in your device settings to select images.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        ...commonImagePickerOptions,
        allowsEditing: Platform.OS !== 'web', // Re-enable Expo's built-in editor for native
      });

      if (!result.canceled && result.assets[0]) {
        if (Platform.OS === 'web') {
          setOriginalWebImageUri(result.assets[0].uri);
          setShowWebCropper(true); // Show the web cropper for this image
        } else {
          setSelectedImageUri(result.assets[0].uri);
          setImageForAnalysis(result.assets[0].uri);
        }
        resetAnalysisState();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
      console.error('Gallery error:', error);
    }
  };

  // Callback for WebImageProcessor
  const handleWebImageCropped = (croppedBlob: Blob) => {
    setSelectedImageUri(URL.createObjectURL(croppedBlob)); // For preview
    setImageForAnalysis(croppedBlob); // Set Blob for analysis
    setShowWebCropper(false); // Hide the cropper
    resetAnalysisState();
  };

  // Callback if web cropping is canceled
  const handleWebCropperCancel = () => {
    setOriginalWebImageUri(null);
    setSelectedImageUri(null); // Clear previous selection
    setShowWebCropper(false);
    resetAnalysisState();
  };

  const resetAnalysisState = () => {
    setAnalysisResult(null);
    setAnalysisId(null);
    setFeedbackSubmitted(false);
  };

  // Automatically analyze image when imageForAnalysis changes
  useEffect(() => {
    // Only analyze if an image is selected AND we are not currently analyzing
    if (imageForAnalysis && !isAnalyzing) {
      analyzeImage(imageForAnalysis);
    }
  }, [imageForAnalysis]); // Remove isAnalyzing from dependencies

  const analyzeImage = async (source: string | Blob) => {
    if (!source) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let imageBlob: Blob;
      if (typeof source === 'string') {
        const response = await fetch(source);
        imageBlob = await response.blob();
      } else {
        imageBlob = source;
      }

      let webhookUrl = 'https://n8n.tackletechies.com/webhook/6dc9b95c-02db-4294-bd43-0323b7f7e488';

      console.log({ webhookUrl });
      const analysisResponse = await fetch(webhookUrl, {
        method: 'POST',
        body: imageBlob,
        headers: {
          'Content-Type': imageBlob.type
        }
      });

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed with status: ${analysisResponse.status}`);
      }

      const analysisData: AnalysisResponse = await analysisResponse.json();

      if (analysisData.results && analysisData.results.length > 0) {
        const result = analysisData.results[0];
        setAnalysisResult(result.bin_or_sack);
        setAnalysisId(result.Id);
      } else {
        throw new Error('No analysis results received');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Item analysis failed. Please check your internet connection or try again. Make sure your device can reach the analysis server.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitFeedback = async (isHelpful: boolean) => {
    if (analysisId === null) return;

    setIsSubmittingFeedback(true);

    try {
      const feedbackResponse = await fetch(
        'https://n8n.tackletechies.com/webhook/9b384fa3-deee-4e28-a299-fdce22a38b25',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Id: analysisId,
            Feedback: isHelpful,
          }),
        }
      );

      if (!feedbackResponse.ok) {
        throw new Error(`Feedback submission failed with status: ${feedbackResponse.status}`);
      }

      setFeedbackSubmitted(true);

      Alert.alert(
        'Thank you!',
        'Your feedback helps us improve HomeBin AI.',
        [
          {
            text: 'OK',
            onPress: () => {
              setTimeout(() => {
                resetToInitialState();
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Feedback error:', error);
      Alert.alert(
        'Feedback Failed',
        'Failed to submit feedback. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const resetToInitialState = () => {
    setSelectedImageUri(null);
    setImageForAnalysis(null);
    setAnalysisResult(null);
    setAnalysisId(null);
    setFeedbackSubmitted(false);
    setShowWebCropper(false); // Reset cropper visibility
    setOriginalWebImageUri(null); // Clear original web image URI
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Recycle size={32} color="#059669" />
            <Text style={styles.title}>HomeBin AI</Text>
          </View>
          <Text style={styles.subtitle}>Your Smart Home Waste Assistant</Text>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>My Location (optional)</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="e.g., Chelmsford, UK"
            value={userLocation}
            onChangeText={setUserLocation}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Capture or Select Item</Text>

          {/* Render buttons only if the web cropper is NOT active */}
          {!showWebCropper && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cameraButton]}
                onPress={takePhotoWithCamera}
                disabled={isAnalyzing}
              >
                <Camera size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.galleryButton]}
                onPress={pickImageFromGallery}
                disabled={isAnalyzing}
              >
                <ImageIcon size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Web Cropper UI (conditionally rendered only for web) */}
          {Platform.OS === 'web' && showWebCropper && originalWebImageUri && (
            <WebImageProcessor
              initialImageUri={originalWebImageUri}
              onImageCropped={handleWebImageCropped}
              onCancel={handleWebCropperCancel} // Added cancel prop
              isAnalyzing={isAnalyzing}
            />
          )}

          {/* Image preview based on selectedImageUri (used by both platforms) */}
          {selectedImageUri && !showWebCropper && ( // Hide preview when cropper is active
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
            </View>
          )}

          {isAnalyzing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Analyzing item...</Text>
            </View>
          )}

          {analysisResult && !isAnalyzing && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Classification Result:</Text>
              <Text style={styles.resultText}>Place in your: {analysisResult}</Text>

              {!feedbackSubmitted && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackTitle}>Was this helpful?</Text>
                  <View style={styles.feedbackButtons}>
                    <TouchableOpacity
                      style={[styles.feedbackButton, styles.positiveButton]}
                      onPress={() => submitFeedback(true)}
                      disabled={isSubmittingFeedback}
                    >
                      <ThumbsUp size={20} color="#FFFFFF" />
                      <Text style={styles.feedbackButtonText}>Helpful</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.feedbackButton, styles.negativeButton]}
                      onPress={() => submitFeedback(false)}
                      disabled={isSubmittingFeedback}
                    >
                      <ThumbsDown size={20} color="#FFFFFF" />
                      <Text style={styles.feedbackButtonText}>Not Helpful</Text>
                    </TouchableOpacity>
                  </View>

                  {isSubmittingFeedback && (
                    <ActivityIndicator size="small" color="#059669" style={styles.feedbackLoader} />
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Recycling rules can vary by location and change. Always confirm with your local council's official guidelines.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  locationSection: {
    marginBottom: 30,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  locationInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  imageSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#059669',
  },
  galleryButton: {
    backgroundColor: '#0EA5E9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 280,
    height: 280,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 20,
  },
  feedbackContainer: {
    alignItems: 'center',
    width: '100%',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  positiveButton: {
    backgroundColor: '#10B981',
  },
  negativeButton: {
    backgroundColor: '#EF4444',
  },
  feedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackLoader: {
    marginTop: 12,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
});