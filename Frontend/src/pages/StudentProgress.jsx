import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import useDarkMode from '../hooks/useDarkMode'

function StudentProgress() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'student') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [donnees, setDonnees] = useState({
    coursesCompleted: 0,
    avgGrade: 0,
    gradeHistory: [],
    courses: [],
  })
  const [chargement, setChargement] = useState(true)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLaProgression() {
    setChargement(true)
    axios.get('http://localhost:5000/api/analytics/student-progress', headerAuth)
      .then(function (res) {
        setDonnees(res.data)
        setChargement(false)
      })
      .catch(function (err) {
        console.log(err)
        setChargement(false)
      })
  }

  useEffect(function () {
    chargerLaProgression()
  }, [])

  function couleurStatut(statut) {
    if (statut === 'Completed') return 'bg-emerald-500/20 text-emerald-400'
    return 'bg-orange-500/20 text-orange-400'
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Student</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/student/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Courses</a>
          <a href="/student/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Quizzes</a>
          <a href="/student/progress" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">My Progress</a>
          <a href="/student/certificates" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Certificates</a>
          <a href="/student/docs" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Docs</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-6'}>My Progress</h1>

        {chargement === true ? (
          <p className="opacity-70">Chargement...</p>
        ) : (
          <>
            {/* 2 cartes */}
            <div className="grid grid-cols-2 gap-4 mb-8" style={{ maxWidth: '600px' }}>
              <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
                <p className="text-sm opacity-70">Courses Completed</p>
                <p className="text-2xl font-bold mt-1">{donnees.coursesCompleted}</p>
              </div>
              <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
                <p className="text-sm opacity-70">Average Grade</p>
                <p className="text-2xl font-bold mt-1">{donnees.avgGrade}%</p>
              </div>
            </div>

            {/* Graphique */}
            <div className={darkMode.couleurCarte + ' border rounded-xl p-5 mb-8'}>
              <p className="font-medium mb-4">Grade History</p>

              {donnees.gradeHistory.length === 0 ? (
                <p className="opacity-70 text-sm">Pas encore de quiz passe.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={donnees.gradeHistory}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" name="Score %" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tableau par cours */}
            <div className={darkMode.couleurCarte + ' border rounded-xl overflow-hidden'}>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-sm opacity-70">
                    <th className="p-4">Course</th>
                    <th className="p-4">Grade</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donnees.courses.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-center opacity-70">Aucun cours pour le moment</td>
                    </tr>
                  ) : (
                    donnees.courses.map(function (cours, index) {
                      return (
                        <tr key={index} className="border-b border-slate-800">
                          <td className="p-4">{cours.title}</td>
                          <td className="p-4">{cours.grade}%</td>
                          <td className="p-4">
                            <span className={'px-3 py-1 rounded-full text-xs font-medium ' + couleurStatut(cours.status)}>
                              {cours.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StudentProgress