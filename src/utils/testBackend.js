// src/utils/testBackend.js
import api from '../services/api';

export const testBackend = async () => {
  console.log('🧪 Testing backend...');
  
  try {
    // Test 1: Health check
    const health = await api.get('/health');
    console.log('✅ Health check:', health.data);
    
    // Test 2: Register
    const register = await api.post('/auth/register', {
      email: 'test' + Date.now() + '@test.com',
      password: 'test123',
      username: 'Test User'
    });
    console.log('✅ Register:', register.data);
    
    // Test 3: Login
    const login = await api.post('/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    console.log('✅ Login:', login.data);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
};
