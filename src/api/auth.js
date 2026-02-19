import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const login = async (email, password) => {
  const { data } = await axios.post(`${API_BASE}/api/login`, {
    email,
    password,
  })
  return data
}
