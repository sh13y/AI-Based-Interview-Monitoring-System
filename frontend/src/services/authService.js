import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const signup = async (formData) => {
  try {
    const response = await authAPI.post('/signup', {
      first_name: formData.firstName,
      last_name: formData.lastName,
      user_id: formData.userId,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      profile_picture_base64: formData.profilePicture,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Signup failed'
    };
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await authAPI.post(`/verify-email/${token}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Email verification failed'
    };
  }
};

export const login = async (credentials) => {
  try {
    const response = await authAPI.post('/login', {
      user_id: credentials.userId,
      password: credentials.password,
    });

    // Store tokens
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user_id', response.data.user_id);
    localStorage.setItem('email', response.data.email);

    return { success: true, data: response.data };
  } catch (error) {
    const status = error.response?.status;
    let message = 'Login failed';

    if (status === 423) {
      message = error.response?.data?.detail || 'Account locked due to too many failed attempts';
    } else if (status === 403) {
      message = 'Email not verified. Please check your email.';
    } else if (status === 401) {
      message = 'Invalid credentials';
    }

    return {
      success: false,
      error: message,
      status,
    };
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const response = await authAPI.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to fetch user'
    };
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};
