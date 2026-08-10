// ============================================================
// src/pages/TeacherCourses.jsx
// Liste des cours (avec pagination) + ajout avec image + suppression
// ============================================================

import { useState } from 'react'
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

function TeacherCourses() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')

  if (role !== 'teacher') {
    return <Navigate to="/login" />
  }

  const [modeSombre, setModeSombre] = useState(true)

  // liste des cours + pagination
  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  // formulaire d ajout
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [image, setImage] = useState(null)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    window.location.href = '/login'
  }

  function changerMode() {
    if (modeSombre === true) {
      setModeSombre(false)
    } else {
      setModeSombre(true)
    }
  }

  // va chercher la liste des cours, page par page
  function chargerLesCours() {
    axios.get('http://localhost:5000/api/courses/list?page=' + page + '&limit=5')
      .then(function (res) {
        setCourses(res.data.courses)
        setPages(res.data.pages)
      })
  }

  // se relance a chaque fois que la page change
  useEffect(function () {
    chargerLesCours()
  }, [page])

  // ajoute un cours avec image (FormData obligatoire pour un fichier)
  async function ajouterCours(event) {
    event.preventDefault()

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('level', level)
    formData.append('image', image)

    try {
      await axios.post(
        'http://localhost:5000/api/courses/ajouter-avec-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setTitle('')
      setDescription('')
      setLevel('')
      setImage(null)

      chargerLesCours()
    } catch (err) {
      alert("Erreur lors de l'ajout du cours")
    }
  }

  async function supprimerCours(idDuCours) {
    await axios.delete('http://localhost:5000/api/courses/' + idDuCours)
    chargerLesCours()
  }

  let couleurFond = 'bg-slate-950'
  let couleurFondMenu = 'bg-slate-900'
  let couleurTexte = 'text-white'
  let couleurCarte = 'bg-slate-900 border-slate-800 text-slate-400'

  if (modeSombre === false) {
    couleurFond = 'bg-gray-100'
    couleurFondMenu = 'bg-white'
    couleurTexte = 'text-slate-900'
    couleurCarte = 'bg-white border-gray-200 text-slate-600'
  }

  return (
    <div className={'flex min-h-screen ' + couleurFond}>

      <div className={couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/teacher" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Dashboard</a>
          <a href="/teacher/courses" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Courses</a>
          <a href="/teacher/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/teacher/students" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Students</a>
          <a href="/teacher/docs" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Docs</a>
          <a href="/teacher/settings" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Settings</a>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={changerMode} className="text-slate-400 text-sm text-left hover:text-cyan-400">
            {modeSombre === true ? 'Mode Clair' : 'Mode Sombre'}
          </button>
          <button onClick={handleLogout} className="text-slate-400 text-sm text-left hover:text-red-400">
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <h1 className={couleurTexte + ' text-2xl font-bold mb-4'}>Courses</h1>

        {/* Formulaire d ajout avec image */}
        <form onSubmit={ajouterCours} className={couleurCarte + ' border rounded-xl p-6 mb-6 flex flex-col gap-3'}>
          <input
            type="text"
            placeholder="Titre du cours"
            value={title}
            onChange={function (event) { setTitle(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={function (event) { setDescription(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />
          <input
            type="text"
            placeholder="Niveau (ex: L3)"
            value={level}
            onChange={function (event) { setLevel(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />
          <input
            type="file"
            onChange={function (event) { setImage(event.target.files[0]) }}
            className="text-slate-300"
            required
          />
          <button type="submit" className="bg-cyan-500 text-slate-950 font-semibold py-2 rounded-lg">
            Ajouter
          </button>
        </form>

        {/* Liste des cours */}
        <div className="space-y-2 mb-6">
          {courses.map(function (cours) {
            return (
              <div key={cours._id} className={couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
                <span>{cours.title}</span>
                <button
                  onClick={function () { supprimerCours(cours._id) }}
                  className="text-red-400 text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1}
            onClick={function () { setPage(page - 1) }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
          >
            Precedent
          </button>

          <span className={couleurTexte}>Page {page} / {pages}</span>

          <button
            disabled={page === pages}
            onClick={function () { setPage(page + 1) }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
          >
            Suivant
          </button>
        </div>

      </div>
    </div>
  )
}

export default TeacherCourses