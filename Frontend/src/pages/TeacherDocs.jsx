import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function TeacherDocs() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'teacher') {
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

  function chargerLesDocuments() {
    axios.get('http://localhost:5000/api/courses/list?limit=100').then(function (res) {
      const coursAvecPdf = res.data.courses.filter(function (cours) {
        return cours.pdfUrl
      })
      setDocuments(coursAvecPdf)
    })
  }

  useEffect(function () {
    chargerLesDocuments()
  }, [])

  // retire le pdf d un cours, sans supprimer le cours lui meme
  async function retirerLePdf(idDuCours) {
    await axios.put(
      'http://localhost:5000/api/courses/' + idDuCours,
      { pdfUrl: null },
      headerAuth
    )
    chargerLesDocuments()
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/teacher/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/teacher/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/teacher/students" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Students</a>
          <a href="/teacher/docs" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Docs</a>
          <a href="/teacher/settings" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Settings</a>
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

        <p className={darkMode.couleurTexte + ' text-sm opacity-70 mb-4'}>
          Pour ajouter un PDF, fais-le depuis la page Courses.
        </p>

        {documents.length === 0 && (
          <p className={darkMode.couleurCarte + ' border rounded-lg p-4 text-sm'}>
            Aucun document disponible.
          </p>
        )}

        <div className="space-y-2">
          {documents.map(function (cours) {
            return (
              <div key={cours._id} className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
                <div>
                  <p className="font-medium">{cours.title}</p>

                  <a
                    href={'http://localhost:5000/uploads/' + cours.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 text-xs hover:underline"
                  >
                    Ouvrir le PDF
                  </a>
                </div>

                <button
                  onClick={function () { retirerLePdf(cours._id) }}
                  className="text-red-400 text-sm hover:underline"
                >
                  Retirer le PDF
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TeacherDocs