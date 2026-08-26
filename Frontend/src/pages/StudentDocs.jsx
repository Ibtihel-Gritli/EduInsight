import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function StudentDocs() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  if (role !== 'student') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [documents, setDocuments] = useState([])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  useEffect(function () {
    axios.get('http://localhost:5000/api/students/' + userId + '/mes-cours', headerAuth)
      .then(function (res) {
        const inscriptions = res.data
        const coursAvecPdf = []

        for (let i = 0; i < inscriptions.length; i++) {
          const cours = inscriptions[i].course
          if (cours && cours.pdfUrl) {
            coursAvecPdf.push(cours)
          }
        }

        setDocuments(coursAvecPdf)
      })
  }, [])

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Student</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/student/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Courses</a>
          <a href="/student/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Quizzes</a>
          <a href="/student/progress" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Progress</a>
          <a href="/student/certificates" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Certificates</a>
          <a href="/student/docs" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Docs</a>
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

        {documents.length === 0 && (
          <p className={darkMode.couleurCarte + ' border rounded-lg p-4 text-sm'}>
            Aucun document disponible.
          </p>
        )}

        <div className="space-y-2">
          {documents.map(function (cours) {
            return (
              <div key={cours._id} className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
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

export default StudentDocs