// WebImageProcessor.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
// Note: ImagePicker is not used directly here anymore as this component only crops
import ReactCrop, { Crop, PixelCrop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // Make sure this CSS is imported in your web entry file

interface WebImageProcessorProps {
    initialImageUri: string; // The URI of the image to be cropped
    onImageCropped: (croppedBlob: Blob) => void;
    onCancel: () => void; // Added for a "Cancel" button
    isAnalyzing: boolean; // To disable buttons when analysis is in progress
}

export function WebImageProcessor({ initialImageUri, onImageCropped, onCancel, isAnalyzing }: WebImageProcessorProps) {
    const [currentImageUri, setCurrentImageUri] = useState<string | null>(initialImageUri);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    // Effect to update currentImageUri if initialImageUri changes (e.g., new photo taken)
    useEffect(() => {
        if (initialImageUri && initialImageUri !== currentImageUri) {
            setCurrentImageUri(initialImageUri);
            setCrop(undefined); // Reset crop state for new image
            setCompletedCrop(null); // Reset completed crop
        }
    }, [initialImageUri, currentImageUri]);


    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        imageRef.current = e.currentTarget;

        const img = e.currentTarget;
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;
        const aspectRatio = 4 / 3;

        let cropWidth, cropHeight, cropX, cropY;

        if (imageWidth / imageHeight > aspectRatio) {
            cropHeight = imageHeight;
            cropWidth = imageHeight * aspectRatio;
            cropX = (imageWidth - cropWidth) / 2;
            cropY = 0;
        } else {
            cropWidth = imageWidth;
            cropHeight = imageWidth / aspectRatio;
            cropX = 0;
            cropY = (imageHeight - cropHeight) / 2;
        }

        setCrop({
            unit: 'px',
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
        });
    }, []);


    const getCroppedImageBlob = useCallback(async (crop: PixelCrop): Promise<Blob> => {
        const image = imageRef.current;
        const canvas = previewCanvasRef.current;

        if (!crop || !image || !canvas) {
            console.error("Missing elements for cropping:", { crop, image, canvas });
            throw new Error('Crop, image, or canvas not available for getCroppedImageBlob.');
        }

        if (!image.complete || image.naturalWidth === 0) {
            console.error("Image not yet loaded or invalid:", image);
            throw new Error("Image is not fully loaded or has zero dimensions.");
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context.');
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    console.error("Canvas toBlob failed or returned null.");
                    reject(new Error('Canvas is empty or conversion failed.'));
                }
            }, 'image/jpeg', 0.8);
        });
    }, []);

    const handleProcessImage = async () => {
        if (completedCrop) {
            try {
                const croppedBlob = await getCroppedImageBlob(completedCrop);
                onImageCropped(croppedBlob);
            } catch (error) {
                console.error('Error getting cropped image blob:', error);
                alert(`Failed to process image for analysis: ${error instanceof Error ? error.message : String(error)}`);
            }
        } else {
            alert('Please select a crop area.');
        }
    };

    if (!currentImageUri) {
        return <Text style={styles.errorText}>No image selected for cropping.</Text>;
    }

    return (
        <View style={styles.webImageProcessorContainer}>
            <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={4 / 3}
                minWidth={100}
                minHeight={75}
            >
                <img
                    src={currentImageUri}
                    onLoad={onImageLoad}
                    style={styles.imageToCrop}
                    alt="Image to crop"
                />
            </ReactCrop>
            <View style={styles.cropButtonContainer}>
                <TouchableOpacity
                    style={[styles.cropActionButton, styles.cancelButton]}
                    onPress={onCancel}
                    disabled={isAnalyzing}
                >
                    <Text style={styles.cropButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cropActionButton, styles.analyzeButton, (!completedCrop || isAnalyzing) && styles.disabledButton]}
                    onPress={handleProcessImage}
                    disabled={!completedCrop || isAnalyzing}
                >
                    {isAnalyzing ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.cropButtonText}>Analyze Cropped Image</Text>
                    )}
                </TouchableOpacity>
            </View>

            <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
        </View>
    );
}

const styles = StyleSheet.create({
    webImageProcessorContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageCropWrapper: { // Removed from here, now directly applied to ReactCrop in return
        width: '100%',
        maxWidth: 600,
        alignItems: 'center',
        marginTop: 20,
    },
    imageToCrop: {
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
    },
    cropButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 12,
        width: '100%',
        maxWidth: 600,
    },
    cropActionButton: {
        flex: 1, // Make buttons fill space evenly
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzeButton: {
        backgroundColor: '#059669',
    },
    cancelButton: {
        backgroundColor: '#EF4444', // Red for cancel
    },
    cropButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});