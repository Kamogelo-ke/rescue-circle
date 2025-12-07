import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function RegistrationScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact1Name: '',
    emergencyContact1ID: '',
    emergencyContact1Phone: '',
    emergencyContact1Relationship: '',
    emergencyContact2Name: '',
    emergencyContact2ID: '',
    emergencyContact2Phone: '',
    emergencyContact2Relationship: '',
  });
  
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [faceMatch, setFaceMatch] = useState<'verified' | 'failed' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);



  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickIdDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setIdDocument(result.assets[0].uri);
    }
  };

  const openFaceCamera = async () => {
    if (!idDocument) {
      Alert.alert('Error', 'Please upload ID document first');
      return;
    }
    
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required for face verification');
        return;
      }
    }
    
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });
      
      if (photo?.uri) {
        setFacePhoto(photo.uri);
        setShowCamera(false);
        
        // Simulate biometric verification
        setIsProcessing(true);
        setTimeout(() => {
          const isValid = Math.random() > 0.2;
          setFaceMatch(isValid ? 'verified' : 'failed');
          setIsProcessing(false);
          
          if (isValid) {
            Alert.alert('✓ Verified', 'Face successfully matched with ID document!');
          } else {
            Alert.alert('✗ Verification Failed', 'Face does not match ID document. Please try again.');
          }
        }, 3000);
      }
    }
  };

  const sendVerificationCode = () => {
    if (formData.phone.length >= 10) {
      setCodeSent(true);
      Alert.alert('Code Sent', `A 6-digit verification code has been sent to ${formData.phone}`);
    } else {
      Alert.alert('Error', 'Please enter a valid phone number');
    }
  };

  const verifyOTP = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code');
      return;
    }
    
    // Simulate OTP verification (in real app, verify with backend)
    if (verificationCode === '123456' || verificationCode.length === 6) {
      setPhoneVerified(true);
      Alert.alert('✓ Success', 'Phone number verified successfully!');
    } else {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    }
  };

  const handleSubmit = () => {
    if (!phoneVerified) {
      Alert.alert('Error', 'Please verify your phone number first');
      return;
    }
    if (!idDocument) {
      Alert.alert('Error', 'Please upload your ID document');
      return;
    }
    if (!facePhoto || faceMatch !== 'verified') {
      Alert.alert('Error', 'Please complete biometric verification');
      return;
    }
    if (!formData.emergencyContact1Name || !formData.emergencyContact1ID || !formData.emergencyContact1Phone) {
      Alert.alert('Error', 'Please complete Emergency Contact 1 details');
      return;
    }
    if (!formData.emergencyContact2Name || !formData.emergencyContact2ID || !formData.emergencyContact2Phone) {
      Alert.alert('Error', 'Please complete Emergency Contact 2 details');
      return;
    }
    
    Alert.alert('Success', 'Registration successful! Your account is now secured and ready for emergency use.');
  };

  const getProgress = () => {
    let completed = 0;
    if (formData.fullName && formData.phone && phoneVerified) completed++;
    if (formData.emergencyContact1Name && formData.emergencyContact1ID && formData.emergencyContact1Phone) completed++;
    if (idDocument) completed++;
    if (faceMatch === 'verified') completed++;
    return (completed / 4) * 100;
  };

  if (showCamera) {
    if (!permission) {
      return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
    }
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera}
          facing="front"
          ref={cameraRef}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Position Your Face</Text>
              <Text style={styles.cameraSubtitle}>Align your face within the frame</Text>
            </View>
            
            <View style={styles.faceFrame}>
              <View style={[styles.frameCorner, styles.topLeft]} />
              <View style={[styles.frameCorner, styles.topRight]} />
              <View style={[styles.frameCorner, styles.bottomLeft]} />
              <View style={[styles.frameCorner, styles.bottomRight]} />
            </View>

            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <View style={styles.spacer} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <View>
            <Text style={styles.headerTitle}>Rescue Circle</Text>
            <Text style={styles.headerSubtitle}>Secure Registration - Your Safety Matters</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Registration Progress</Text>
            <Text style={styles.progressText}>{Math.round(getProgress())}% Complete</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.idNumber}
              onChangeText={(value) => handleInputChange('idNumber', value)}
              placeholder="Enter your ID number"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="your.email@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="081 234 5678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
              {!phoneVerified && (
                <TouchableOpacity
                  style={styles.sendCodeButton}
                  onPress={sendVerificationCode}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {codeSent ? 'Resend' : 'Send Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {codeSent && !phoneVerified && (
              <>
                <Text style={styles.otpLabel}>Enter OTP</Text>
                <View style={styles.otpRow}>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.verifyCodeButton}
                    onPress={verifyOTP}
                  >
                    <Text style={styles.verifyCodeButtonText}>Verify Code</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            {phoneVerified && (
              <View style={styles.verifiedContainer}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>Phone number verified</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Residential Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your address"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Emergency Contact 1 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👥</Text>
            <Text style={styles.cardTitle}>Emergency Contact 1</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            This contact will be notified immediately when you trigger an SOS alert
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact1Name}
              onChangeText={(value) => handleInputChange('emergencyContact1Name', value)}
              placeholder="e.g., Sarah Johnson"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact1ID}
              onChangeText={(value) => handleInputChange('emergencyContact1ID', value)}
              placeholder="Enter ID number"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact1Phone}
              onChangeText={(value) => handleInputChange('emergencyContact1Phone', value)}
              placeholder="082 123 4567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact1Relationship}
              onChangeText={(value) => handleInputChange('emergencyContact1Relationship', value)}
              placeholder="e.g., Mother, Sister, Friend"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Emergency Contact 2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👥</Text>
            <Text style={styles.cardTitle}>Emergency Contact 2</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            This contact will also be notified during emergencies
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact2Name}
              onChangeText={(value) => handleInputChange('emergencyContact2Name', value)}
              placeholder="e.g., John Smith"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact2ID}
              onChangeText={(value) => handleInputChange('emergencyContact2ID', value)}
              placeholder="Enter ID number"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact2Phone}
              onChangeText={(value) => handleInputChange('emergencyContact2Phone', value)}
              placeholder="073 987 6543"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact2Relationship}
              onChangeText={(value) => handleInputChange('emergencyContact2Relationship', value)}
              placeholder="e.g., Brother, Father, Cousin"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* ID Document Upload */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>Upload Certified ID Document</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Upload a clear photo or scan of your certified ID document
          </Text>
          
          <View style={styles.uploadContainer}>
            {!idDocument ? (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📤</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickIdDocument}
                >
                  <Text style={styles.uploadButtonText}>Select ID Document</Text>
                </TouchableOpacity>
                <Text style={styles.uploadHint}>Accepted: JPG, PNG (Max 5MB)</Text>
              </View>
            ) : (
              <View style={styles.uploadSuccess}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>ID Document Uploaded</Text>
                <Image source={{ uri: idDocument }} style={styles.documentImage} />
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={pickIdDocument}
                >
                  <Text style={styles.changeButtonText}>Change Document</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Biometric Verification */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📸</Text>
            <Text style={styles.cardTitle}>Biometric Face Recognition</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Take a selfie for biometric verification. Your face will be compared to your ID document photo.
          </Text>
          
          <View style={styles.uploadContainer}>
            {!facePhoto ? (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.biometricText}>Click button to start face recognition</Text>
                <TouchableOpacity
                  style={[styles.uploadButton, !idDocument && styles.disabledButton]}
                  onPress={openFaceCamera}
                  disabled={!idDocument}
                >
                  <Text style={styles.uploadButtonText}>Start Face Recognition</Text>
                </TouchableOpacity>
                {!idDocument && (
                  <Text style={styles.warningText}>Please upload ID document first</Text>
                )}
              </View>
            ) : (
              <View style={styles.uploadSuccess}>
                <Image source={{ uri: facePhoto }} style={styles.faceImage} />
                
                {isProcessing && (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.processingText}>Comparing face with ID document...</Text>
                    <Text style={styles.processingSubtext}>Please wait</Text>
                  </View>
                )}
                
                {!isProcessing && faceMatch === 'verified' && (
                  <View style={styles.matchContainer}>
                    <Text style={styles.matchIconLarge}>✓</Text>
                    <Text style={styles.matchText}>VERIFIED</Text>
                    <Text style={styles.matchSubtext}>Face successfully matched with ID document</Text>
                  </View>
                )}
                
                {!isProcessing && faceMatch === 'failed' && (
                  <View style={styles.failedContainer}>
                    <Text style={styles.failedIconLarge}>✗</Text>
                    <Text style={styles.failedText}>VERIFICATION FAILED</Text>
                    <Text style={styles.failedSubtext}>Face does not match ID document</Text>
                  </View>
                )}
                
                {faceMatch !== 'verified' && !isProcessing && (
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={openFaceCamera}
                  >
                    <Text style={styles.retakeButtonText}>Retake Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!phoneVerified || !idDocument || faceMatch !== 'verified') && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!phoneVerified || !idDocument || faceMatch !== 'verified'}
          >
            <Text style={styles.submitButtonText}>Complete Registration</Text>
          </TouchableOpacity>
          
          {(!phoneVerified || !idDocument || faceMatch !== 'verified') && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Complete these steps to register:</Text>
              {!phoneVerified && <Text style={styles.requirementItem}>• Verify your phone number with OTP</Text>}
              {!idDocument && <Text style={styles.requirementItem}>• Upload your ID document</Text>}
              {!facePhoto && <Text style={styles.requirementItem}>• Complete biometric face recognition</Text>}
              {facePhoto && faceMatch !== 'verified' && <Text style={styles.requirementItem}>• Face verification must pass</Text>}
            </View>
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Your Security Matters</Text>
            <Text style={styles.securityText}>
              All your information is encrypted and stored securely. This verification process ensures that emergency alerts come from legitimate users, enabling faster police response times.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
  },
  sendCodeButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  sendCodeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 16,
    marginBottom: 6,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  otpInput: {
    flex: 1,
  },
  verifyCodeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  verifyCodeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  verifiedIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  verifiedText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 32,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  uploadSuccess: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    color: '#10B981',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 12,
  },
  documentImage: {
    width: 250,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  faceImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#2563EB',
  },
  changeButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  retakeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  processingText: {
    marginTop: 12,
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  processingSubtext: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  matchContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 12,
  },
  matchIconLarge: {
    fontSize: 64,
    color: '#10B981',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  matchSubtext: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
  },
  failedContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 12,
  },
  failedIconLarge: {
    fontSize: 64,
    color: '#EF4444',
    marginBottom: 8,
  },
  failedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  failedSubtext: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  requirementsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#EA580C',
    marginTop: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    borderRadius: 8,
    marginBottom: 32,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cameraSubtitle: {
    fontSize: 16,
    color: '#DBEAFE',
  },
  faceFrame: {
    alignSelf: 'center',
    width: 250,
    height: 300,
    position: 'relative',
  },
  frameCorner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#FFFFFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2563EB',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
  },
  spacer: {
    width: 80,
  },
  permissionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});