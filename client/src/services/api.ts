import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

// Helper for WhatsApp prefilled link
export const generateWhatsAppLink = (phone: string, text: string) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
