import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function AdminDocs() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')

  if (role !== 'admin') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const [courses, setCourses] = useState([])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  useEffect(function () {
    axios.get('http://localhost:5000/api/courses/list?limit=100').then(function (res) {
      // on ne garde que les cours qui ont vraiment un pdf
      const coursAvecPdf = res.data.courses.filter(function (cours) {
        return cours.pdfUrl
      })
      setCourses(coursAvecPdf)
    })
  }, [])

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Admin</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/admin" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Dashboard</a>
          <a href="/admin/users" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Users</a>
          <a href="/admin/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/admin/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/admin/students" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Students</a>
          <a href="/admin/analytics" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Analytics</a>
          <a href="/admin/docs" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Docs</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-4'}>Docs</h1>

        {courses.length === 0 && (
          <p className={darkMode.couleurCarte + ' border rounded-lg p-4 text-sm'}>
            Aucun document disponible.
          </p>
        )}

        <div className="space-y-2">
          {courses.map(function (cours) {
            return (
              <div
                key={cours._id}
                className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}
              >
                <p className="font-medium">{cours.title}</p>

                <a
                  href={'http://localhost:5000/uploads/' + cours.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 text-sm hover:underline"
                >
                  Ouvrir le PDF
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminDocs