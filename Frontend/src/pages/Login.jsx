// ============================================================
// src/pages/Login.jsx
// Page de connexion, avec useState pour chaque champ
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  // fonction appelee quand l utilisateur clique sur "Login"
  async function handleSubmit(event) {
    // empeche la page de se recharger
    event.preventDefault()

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // on garde le token et le role dans le navigateur
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.user.role)
        navigate('/')
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-800">

        {/* Colonne gauche : presentation */}
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

        {/* Colonne droite : formulaire */}
        <div className="p-10 flex flex-col justify-center">
          <span className="text-xs tracking-widest text-slate-500 font-semibold">
            ACCESS PORTAL
          </span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm text-slate-400">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 text-slate-950 font-semibold py-3 rounded-lg mt-2"
            >
              Login
            </button>

            <p className="text-center text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400">Create one</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login