// src/config/api.ts

// URL base da API - usa variável de ambiente ou localhost como fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Em desenvolvimento, pode usar o proxy ('/api')
// Em produção, usa a URL completa
export const getApiUrl = (endpoint: string): string => {
  // Se estamos em desenvolvimento e o endpoint começa com '/api'
  if (import.meta.env.DEV && endpoint.startsWith('/api')) {
    return endpoint; // Usa o proxy do Vite
  }
  
  // Remove '/api' se existir no início do endpoint
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
  
  // Retorna URL completa
  return `${API_BASE_URL}/api${cleanEndpoint}`;
};

// Função helper para fazer requisições
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Para cookies de autenticação
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};