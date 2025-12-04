import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from 'react-native';
import { signUpWithProfile } from '@lib/firebase';
import { useNavigation } from '@react-navigation/native';

const siesRegex = /@(sies(\w+)?\.sies\.edu\.in|sies\.edu\.in)$/i;

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Any'>('Any');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !department || !year || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!siesRegex.test(email)) {
      setError('Please use your official SIES institutional email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUpWithProfile(email, password, { 
        name, 
        email, 
        gender, 
        department, 
        year, 
        rating: 5, 
        phone 
      });
    } catch (e: any) {
      setError(e.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Top Half - Brand Section */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Join CampusRide</Text>
          <Text style={styles.subtitle}>Start sharing rides today</Text>
        </View>
        
        <View style={styles.featureTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Verified Students</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Safe Rides</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Campus Only</Text>
          </View>
        </View>
      </View>

      {/* Bottom Half - Sign Up Form */}
      <View style={styles.signupContainer}>
        <ScrollView 
          style={styles.formBox}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
        >
          <Text style={styles.signupTitle}>Create Account</Text>
          <Text style={styles.signupSubtitle}>Join our campus ride-sharing community</Text>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput 
                  placeholder="Enter your full name"
                  placeholderTextColor="#90A4AE"
                  value={name}
                  onChangeText={setName}
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>SIES Email *</Text>
              <TextInput 
                placeholder="student@sies.edu.in"
                placeholderTextColor="#90A4AE"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />
              <Text style={styles.emailHint}>Use your institutional email</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput 
                placeholder="Create a secure password"
                placeholderTextColor="#90A4AE"
                value={password}
                onChangeText={setPassword}
                secureTextEntry 
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderContainer}>
                  {['Any', 'Male', 'Female', 'Other'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderOption,
                        gender === option && styles.genderOptionSelected
                      ]}
                      onPress={() => setGender(option as any)}
                    >
                      <Text style={[
                        styles.genderText,
                        gender === option && styles.genderTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Department *</Text>
                <TextInput 
                  placeholder="e.g. Computer Engineering"
                  placeholderTextColor="#90A4AE"
                  value={department}
                  onChangeText={setDepartment}
                  style={styles.textInput}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Year *</Text>
                <TextInput 
                  placeholder="e.g. 2nd Year"
                  placeholderTextColor="#90A4AE"
                  value={year}
                  onChangeText={setYear}
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput 
                placeholder="Enter your phone number"
                placeholderTextColor="#90A4AE"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  brandSection: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f6422ff',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
  },
  featureTags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  tag: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  tagText: {
    color: '#1f6422ff',
    fontSize: 11,
    fontWeight: '600',
  },
  signupContainer: {
    flex: 1.2,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  formBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    maxHeight: '90%',
  },
  formContent: {
    paddingBottom: 20,
  },
  signupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f6422ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  signupSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f6422ff',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#F8FDFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#E0F7FA',
    fontSize: 15,
    color: '#1A237E',
    fontWeight: '500',
  },
  emailHint: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FDFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#E0F7FA',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#1f6422ff',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#78909C',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#1f6422ff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1f6422ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#78909C',
    fontSize: 15,
  },
  loginLink: {
    color: '#1f6422ff',
    fontSize: 15,
    fontWeight: '700',
  },
});