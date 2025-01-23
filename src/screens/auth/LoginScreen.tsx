import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/types';

type UserType = 'petOwner' | 'vet';

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const { login } = useAuth();

  const [userType, setUserType] = useState<UserType>('petOwner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, userType);
      // Login başarılı olduğunda kullanıcı tipine göre yönlendirme
      if (userType === 'petOwner') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PetOwnerTabs' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'VetTabs' }],
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register', { userType });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          VetApp
        </Text>
      </View>
      <View style={styles.form}>
        <SegmentedButtons
          value={userType}
          onValueChange={(value) => setUserType(value as UserType)}
          buttons={[
            { value: 'petOwner', label: 'Pet Sahibi' },
            { value: 'vet', label: 'Veteriner' },
          ]}
          style={styles.userTypeSelector}
        />
        <TextInput
          label="E-posta"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        <Button
          mode="text"
          onPress={handleForgotPassword}
          style={styles.forgotPasswordButton}
        >
          Şifremi Unuttum
        </Button>
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
        >
          Giriş Yap
        </Button>
        <View style={styles.registerContainer}>
          <Text variant="bodyMedium">Hesabınız yok mu?</Text>
          <Button mode="text" onPress={handleRegister}>
            Kayıt Ol
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  userTypeSelector: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});