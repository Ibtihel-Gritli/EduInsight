// ============================================================
// src/api/axios.js
// Instance axios configuree une seule fois pour tout le projet
// ============================================================

import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
})