const getDefaultApiUrl = () => {
  const { hostname } = window.location;
  // If accessing locally or via local network IP (192.168.x.x, 10.x.x.x, etc.)
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') || 
    hostname.startsWith('100.') // Tailscale/VPN IPs
  ) {
    return `http://${hostname}:8081/api`;
  }
  return 'https://api-sknhos.moph.go.th/api';
};

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const BASE_URL = configuredApiUrl || getDefaultApiUrl();

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response, originalRequestConfig = null) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("Non-JSON Response from server:", text);
    throw new Error(`Server Error: ${response.status} - ${text.substring(0, 40)}...`);
  }

  // Handle 401 Unauthorized (Token Expired)
  if (response.status === 401 && originalRequestConfig && !originalRequestConfig._retry) {
    originalRequestConfig._retry = true;
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      try {
        // Attempt to get a new access token
        const refreshResponse = await fetch(`${BASE_URL}/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          // Save new access token
          localStorage.setItem('token', refreshData.token);
          
          // Retry the original request with the new token
          const newHeaders = {
            ...originalRequestConfig.headers,
            'Authorization': `Bearer ${refreshData.token}`
          };
          
          const retryResponse = await fetch(originalRequestConfig.url, {
            method: originalRequestConfig.method,
            headers: newHeaders,
            body: originalRequestConfig.body,
          });
          
          return handleResponse(retryResponse, null); // Don't retry again
        } else {
          // Refresh token failed/expired
          if (localStorage.getItem('refresh_token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            window.dispatchEvent(new Event('auth-expired'));
          }
          throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        }
      } catch (error) {
        if (localStorage.getItem('refresh_token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.dispatchEvent(new Event('auth-expired'));
        }
        throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }
    } else {
      // No refresh token available
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-expired'));
      }
      throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }
  }

  if (!response.ok) {
    throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
  }
  return data;
};

export const api = {
  get: async (endpoint) => {
    const config = {
      url: `${BASE_URL}${endpoint}`,
      method: 'GET',
      headers: getHeaders(),
    };
    const response = await fetch(config.url, config);
    return handleResponse(response, config);
  },

  post: async (endpoint, body) => {
    const config = {
      url: `${BASE_URL}${endpoint}`,
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    };
    const response = await fetch(config.url, config);
    return handleResponse(response, config);
  },

  put: async (endpoint, body) => {
    const config = {
      url: `${BASE_URL}${endpoint}`,
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    };
    const response = await fetch(config.url, config);
    return handleResponse(response, config);
  },

  delete: async (endpoint) => {
    const config = {
      url: `${BASE_URL}${endpoint}`,
      method: 'DELETE',
      headers: getHeaders(),
    };
    const response = await fetch(config.url, config);
    return handleResponse(response, config);
  },
};

export default api;
