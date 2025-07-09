import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { GoogleSignInButton } from '../components/ui/GoogleSignInButton';
import { AuthService } from '../services/authService';
import { theme } from '../theme';

export default function LoginScreen({ onLogin }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('LoginScreen: handleLogin called with username:', username, 'password:', password);
    if (username && password) {
      console.log('LoginScreen: Calling onLogin with credentials');
      onLogin({ username, password });
    } else {
      console.log('LoginScreen: Missing username or password');
      Alert.alert('Error', 'Please enter both username and password');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('LoginScreen: Google sign-in initiated');
      const user = await AuthService.googleSignIn();
      console.log('LoginScreen: Google sign-in successful for user:', user.email);
      onLogin({ username: user.email || 'google_user', password: 'google_auth' });
    } catch (error: any) {
      console.error('LoginScreen: Google sign-in failed:', error);
      Alert.alert('Google Sign-In Error', error.message);
    }
  };

  const handleForgotPassword = () => {
    if (username) {
      Alert.alert(
        'Forgot Password',
        `Password reset email will be sent to ${username}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Reset Email',
            onPress: async () => {
              try {
                await AuthService.resetPassword(username);
                Alert.alert('Success', 'Password reset email sent!');
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Please enter your email address first');
    }
  };

  const handleSignUp = () => {
    if (username && password) {
      Alert.alert(
        'Sign Up',
        `Create account for ${username}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create Account',
            onPress: async () => {
              try {
                await AuthService.signUp(username, password);
                Alert.alert('Success', 'Account created successfully!');
                onLogin({ username, password });
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Please enter both email and password to sign up');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formContainer}>
        <Card style={styles.loginCard}>
          <CardContent>
            <CardTitle style={styles.title}>Welcome Back</CardTitle>
            <Text style={styles.subtitle}>Sign in to your account</Text>
            
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
            
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
            
            <Button onPress={handleLogin} style={styles.loginButton}>
              Sign In
            </Button>
            
            <View style={styles.optionsContainer}>
              <Button variant="outline" size="sm" onPress={handleForgotPassword}>
                Forgot Password?
              </Button>
              <Button variant="outline" size="sm" onPress={handleSignUp}>
                Sign Up
              </Button>
            </View>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <GoogleSignInButton onPress={handleGoogleSignIn} />
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    minHeight: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  loginCard: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.font.sizeTitle,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.font.family,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontFamily: theme.font.family,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  dividerText: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
    fontFamily: theme.font.family,
  },
}); 