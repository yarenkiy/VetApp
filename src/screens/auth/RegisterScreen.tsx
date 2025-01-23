import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    address: '',
    userType: 'petOwner',
    clinicName: '',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleRegister = async () => {
    const requiredFields = ['email', 'password', 'name', 'phoneNumber', 'address'];
    if (formData.userType === 'vet') {
      requiredFields.push('clinicName', 'licenseNumber');
    }

    const emptyFields = requiredFields.filter(field => !formData[field]);
    if (emptyFields.length > 0) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(formData);
    } catch (err) {
      setError('Kayıt olurken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      
      <SegmentedButtons
        value={formData.userType}
        onValueChange={value => updateFormData('userType', value)}
        buttons={[
          { value: 'petOwner', label: 'Pet Sahibi' },
          { value: 'vet', label: 'Veteriner' },
        ]}
        style={styles.segment}
      />

      <TextInput
        label="Ad Soyad"
        value={formData.name}
        onChangeText={value => updateFormData('name', value)}
        mode="outlined"
        style={styles.input}
      />
      
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={value => updateFormData('email', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        label="Şifre"
        value={formData.password}
        onChangeText={value => updateFormData('password', value)}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />

      <TextInput
        label="Telefon"
        value={formData.phoneNumber}
        onChangeText={value => updateFormData('phoneNumber', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        label="Adres"
        value={formData.address}
        onChangeText={value => updateFormData('address', value)}
        mode="outlined"
        style={styles.input}
        multiline
      />

      {formData.userType === 'vet' && (
        <>
          <TextInput
            label="Klinik Adı"
            value={formData.clinicName}
            onChangeText={value => updateFormData('clinicName', value)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Lisans Numarası"
            value={formData.licenseNumber}
            onChangeText={value => updateFormData('licenseNumber', value)}
            mode="outlined"
            style={styles.input}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      >
        Kayıt Ol
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  segment: {
    marginBottom: 24,
  },
}); 