import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function TeacherCourses() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'teacher') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [pdf, setPdf] = useState(null)

  const [idEnModification, setIdEnModification] = useState('')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLesCours() {
    axios.get('http://localhost:5000/api/courses/list?page=' + page + '&limit=5')
      .then(function (res) {
        setCourses(res.data.courses)
        setPages(res.data.pages)
      })
  }

  useEffect(function () {
    chargerLesCours()
  }, [page])

  function viderLeFormulaire() {
    setTitle('')
    setDescription('')
    setLevel('')
    setPdf(null)
    setIdEnModification('')
  }

  function preparerModification(cours) {
    setTitle(cours.title)
    setDescription(cours.description)
    setLevel(cours.level)
    setIdEnModification(cours._id)
  }

  async function envoyerFormulaire(event) {
    event.preventDefault()

    try {
      if (idEnModification !== '') {
        await axios.put(
          'http://localhost:5000/api/courses/' + idEnModification,
          { title: title, description: description, level: level },
          headerAuth
        )
      } else {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('level', level)
        if (pdf) {
          formData.append('pdf', pdf)
        }

        await axios.post(
          'http://localhost:5000/api/courses/ajouter-avec-image',
          formData,
          {
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      viderLeFormulaire()
      chargerLesCours()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  async function supprimerCours(idDuCours) {
    await axios.delete('http://localhost:5000/api/courses/' + idDuCours, headerAuth)
    chargerLesCours()
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/teacher/courses" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Courses</a>
          <a href="/teacher/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/teacher/students" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Students</a>
          <a href="/teacher/docs" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Docs</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-4'}>Courses</h1>

        <form onSubmit={envoyerFormulaire} className={darkMode.couleurCarte + ' border rounded-xl p-6 mb-6 flex flex-col gap-3'}>
          <input type="text" placeholder="Titre du cours" value={title}
            onChange={function (event) { setTitle(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" required />
          <input type="text" placeholder="Description" value={description}
            onChange={function (event) { setDescription(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
          <input type="text" placeholder="Niveau (ex: L3)" value={level}
            onChange={function (event) { setLevel(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />

          {idEnModification === '' && (
            <div>
              <label className="text-sm text-slate-400 block mb-1">PDF du cours</label>
              <input type="file" accept="application/pdf"
                onChange={function (event) { setPdf(event.target.files[0]) }}
                className="text-slate-300" />
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="bg-cyan-500 text-slate-950 font-semibold py-2 px-4 rounded-lg">
              {idEnModification === '' ? 'Ajouter' : 'Enregistrer les modifications'}
            </button>
            {idEnModification !== '' && (
              <button type="button" onClick={viderLeFormulaire} className="text-slate-400 text-sm">
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2 mb-6">
          {courses.map(function (cours) {
            return (
              <div key={cours._id} className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
                <div>
                  <p className="font-medium">{cours.title}</p>
                  <p className="text-sm opacity-70">{cours.level}</p>
                  {cours.pdfUrl && (
                    <a href={'http://localhost:5000/uploads/' + cours.pdfUrl} target="_blank" rel="noreferrer"
                      className="text-cyan-400 text-xs hover:underline">
                      Voir le PDF
                    </a>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={function () { preparerModification(cours) }} className="text-cyan-400 text-sm hover:underline">
                    Modifier
                  </button>
                  <button onClick={function () { supprimerCours(cours._id) }} className="text-red-400 text-sm hover:underline">
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 items-center">
          <button disabled={page === 1} onClick={function () { setPage(page - 1) }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40">
            Precedent
          </button>
          <span className={darkMode.couleurTexte}>Page {page} / {pages}</span>
          <button disabled={page === pages} onClick={function () { setPage(page + 1) }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40">
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherCourses