import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import useDarkMode from '../hooks/useDarkMode'

function AdminDashboard() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'admin') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    quizCompletion: 0,
    avgGrade: 0,
    growth: [],
    distribution: [],
  })

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  useEffect(function () {
    axios.get('http://localhost:5000/api/analytics/admin-dashboard', headerAuth)
      .then(function (res) {
        setStats(res.data)
      })
  }, [])

  const couleursRole = ['#22d3ee', '#a78bfa', '#f472b6']

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Admin</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/admin" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Dashboard</a>
          <a href="/admin/users" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Users</a>
          <a href="/admin/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/admin/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/admin/students" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Students</a>
          <a href="/admin/analytics" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Analytics</a>
          <a href="/admin/docs" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Docs</a>
          <a href="/admin/settings" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Settings</a>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={darkMode.changerMode} className="text-slate-400 text-sm text-left hover:text-cyan-400">
            {darkMode.modeSombre === true ? 'Mode Clair' : 'Mode Sombre'}
          </button>
          <button onClick={handleLogout} className="text-slate-400 text-sm text-left hover:text-red-400">
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-6'}>Dashboard</h1>

        {/* Cartes */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Total Users</p>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
          </div>
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Active Courses</p>
            <p className="text-2xl font-bold mt-1">{stats.activeCourses}</p>
          </div>
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Quiz Completion</p>
            <p className="text-2xl font-bold mt-1">{stats.quizCompletion}%</p>
          </div>
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Avg Grade</p>
            <p className="text-2xl font-bold mt-1">{stats.avgGrade}%</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-6">

          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="font-medium mb-4">Platform Growth</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.growth}>
                <XAxis dataKey="mois" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#22d3ee" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="font-medium mb-4">User Distribution</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.distribution}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {stats.distribution.map(function (entry, index) {
                    return <Cell key={index} fill={couleursRole[index]} />
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard