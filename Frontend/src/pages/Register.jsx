// ============================================================
// src/pages/Register.jsx
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { api } from '../api/axios'

export default function Register() {
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!lastName || !email || !password) {
      setError('Remplissez tous les champs')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caracteres')
      return
    }

    try {
      await api.post('/register', { lastName, email, password, role })
      navigate('/login')
    } catch {
      setError("Erreur lors de l'inscription")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-800">

        <div className="p-10 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl mb-6">
              EI
            </div>
            <span className="text-xs tracking-widest text-cyan-400 font-semibold">
              SMART EDUCATION
            </span>
            <h1 className="text-3xl font-bold text-white mt-4 leading-tight">
              Empower every learner with actionable insights.
            </h1>
            <p className="text-slate-400 mt-4">
              Monitor course engagement, quiz outcomes, and student progress in a single polished workspace.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mt-8">
            <p className="text-cyan-400 text-sm font-semibold mb-2">Why teams love EduInsight</p>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>Real-time teaching analytics</li>
              <li>Beautiful dashboards for instructors and students</li>
              <li>Secure authentication and modern UI</li>
            </ul>
          </div>
        </div>

        <div className="p-10 flex flex-col justify-center">
          <span className="text-xs tracking-widest text-slate-500 font-semibold">
            ACCESS PORTAL
          </span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div>
              <label className="text-sm text-slate-400">Full Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Amara Benali"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Choose your role</label>
              <div className="grid grid-cols-2 gap-3">

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value)}
                    className="peer hidden"
                  />
                  <div className="p-3 rounded-lg border text-sm font-medium text-center bg-slate-800 border-slate-700 text-slate-300 peer-checked:bg-cyan-500/10 peer-checked:border-cyan-500 peer-checked:text-cyan-400">
                    Student
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={(e) => setRole(e.target.value)}
                    className="peer hidden"
                  />
                  <div className="p-3 rounded-lg border text-sm font-medium text-center bg-slate-800 border-slate-700 text-slate-300 peer-checked:bg-cyan-500/10 peer-checked:border-cyan-500 peer-checked:text-cyan-400">
                    Teacher
                  </div>
                </label>

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 text-slate-950 font-semibold py-3 rounded-lg mt-2"
            >
              Create account
            </button>

            <p className="text-center text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400">Login</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}