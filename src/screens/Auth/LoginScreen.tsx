import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { signIn } from '@lib/firebase';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (e: any) {
      setError(e.message || 'Failed to sign in');
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
          <Text style={styles.title}>CampusRide</Text>
          <Text style={styles.subtitle}>Share Rides. Go Green.</Text>
        </View>
        
        <View style={styles.featureTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Eco-Friendly</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Save Money</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Connect</Text>
          </View>
        </View>
      </View>

      {/* Bottom Half - Login Box */}
      <View style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Sign in to continue your ride</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                placeholder="student@campus.edu"
                placeholderTextColor="#90A4AE"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput} 
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput 
                placeholder="Enter your password"
                placeholderTextColor="#90A4AE"
                value={password}
                onChangeText={setPassword}
                secureTextEntry 
                style={styles.textInput} 
              />
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              New to CampusRide?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
              <Text style={styles.signupLink}>
                Create account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    // paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    //backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    //shadowColor: '#4FC3F7',
    //shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    //shadowRadius: 6,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f6422ff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  featureTags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  tag: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  tagText: {
    color: '#1f6422ff',
    fontSize: 12,
    fontWeight: '600',
  },
  loginContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  loginBox: {
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
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f6422ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  form: {
    gap: 20,
    marginBottom: 20,
  },
  inputContainer: {
    gap: 8,
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
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E0F7FA',
    fontSize: 16,
    color: '#1A237E',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#1f6422ff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#78909C',
    fontSize: 15,
  },
  signupLink: {
    color: '#1f6422ff',
    fontSize: 15,
    fontWeight: '700',
  },
});