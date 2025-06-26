import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Recycle, Camera, Brain, Users } from 'lucide-react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Recycle size={48} color="#059669" />
          <Text style={styles.title}>About HomeBin AI</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is HomeBin AI?</Text>
          <Text style={styles.sectionText}>
            HomeBin AI is your intelligent waste classification assistant. Using advanced AI image analysis, 
            we help you determine the correct disposal method for your household items, making recycling 
            easier and more accurate.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          
          <View style={styles.featureItem}>
            <Camera size={24} color="#059669" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Capture or Select</Text>
              <Text style={styles.featureText}>
                Take a photo with your camera or choose an existing image from your gallery.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Brain size={24} color="#059669" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Analysis</Text>
              <Text style={styles.featureText}>
                Our AI analyzes your image and identifies the item and its proper disposal method.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Users size={24} color="#059669" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Community Feedback</Text>
              <Text style={styles.featureText}>
                Help improve our AI by providing feedback on the accuracy of classifications.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Use HomeBin AI?</Text>
          <Text style={styles.sectionText}>
            • Quick and accurate waste classification{'\n'}
            • Reduce contamination in recycling streams{'\n'}
            • Learn proper disposal methods{'\n'}
            • Help protect the environment{'\n'}
            • Location-aware recommendations
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important Note</Text>
          <Text style={styles.disclaimerText}>
            Recycling rules and waste management practices vary by location and can change over time. 
            While HomeBin AI provides helpful guidance, always verify with your local council's 
            official guidelines for the most accurate and up-to-date information.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            HomeBin AI - Making waste disposal smarter, one item at a time.
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderColor: '#F59E0B',
    borderWidth: 1,
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});