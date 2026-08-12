// ============================================================
// src/pages/StudentCourses.jsx
// Liste des cours disponibles + cours auxquels l'étudiant est inscrit
// ============================================================

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function StudentCourses() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  if (role !== 'student') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()

  const headerAuth = {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }

  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [mesCours, setMesCours] = useState([])
  const [message, setMessage] = useState('')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLesCours() {
    axios
      .get(
        'http://localhost:5000/api/courses/list?page=' +
          page +
          '&limit=5'
      )
      .then(function (res) {
        setCourses(res.data.courses)
        setPages(res.data.pages)
      })
      .catch(function (err) {
        console.log(err)
      })
  }

  function chargerMesCours() {
    axios
      .get(
        'http://localhost:5000/api/students/' +
          userId +
          '/mes-cours',
        headerAuth
      )
      .then(function (res) {
        setMesCours(res.data)
      })
      .catch(function (err) {
        console.log(err)
      })
  }

  useEffect(function () {
    chargerLesCours()
  }, [page])

  useEffect(function () {
    chargerMesCours()
  }, [])

  async function sInscrire(idDuCours) {
    try {
      await axios.post(
        'http://localhost:5000/api/students/' +
          userId +
          '/inscrire-cours',
        {
          courseId: idDuCours
        },
        headerAuth
      )

      setMessage('Inscription réussie !')
      chargerMesCours()
    } catch (err) {
      console.log(err)
      setMessage('Erreur lors de l inscription')
    }
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>
      <div
        className={
          darkMode.couleurFondMenu +
          ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'
        }
      >
        <div>
          <h2
            className={
              darkMode.couleurTexte +
              ' font-bold text-lg mb-1'
            }
          >
            EduInsight
          </h2>

          <p className="text-cyan-400 text-sm font-medium mb-1">
            Espace Student
          </p>

          <p className="text-slate-500 text-xs mb-6">
            {lastName}
          </p>

          <a
            href="/student"
            className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1"
          >
            Dashboard
          </a>

          <a
            href="/student/courses"
            className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1"
          >
            My Courses
          </a>

          <a
            href="/student/quizzes"
            className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1"
          >
            My Quizzes
          </a>

          <a
            href="/student/progress"
            className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1"
          >
            My Progress
          </a>

          <a
            href="/student/certificates"
            className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1"
          >
            Certificates
          </a>

          <a
            href="/student/docs"
            className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1"
          >
            Docs
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={darkMode.changerMode}
            className="text-slate-400 text-sm text-left hover:text-cyan-400"
          >
            {darkMode.modeSombre === true
              ? 'Mode Clair'
              : 'Mode Sombre'}
          </button>

          <button
            onClick={handleLogout}
            className="text-slate-400 text-sm text-left hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <h1
          className={
            darkMode.couleurTexte +
            ' text-2xl font-bold mb-4'
          }
        >
          My Courses
        </h1>

        {message !== '' && (
          <p className="text-cyan-400 text-sm mb-4">
            {message}
          </p>
        )}

        <h2
          className={
            darkMode.couleurTexte +
            ' text-lg font-semibold mb-2'
          }
        >
          Mes inscriptions
        </h2>

        <div className="space-y-2 mb-8">
          {mesCours.length === 0 && (
            <p
              className={
                darkMode.couleurCarte +
                ' border rounded-lg p-4 text-sm'
              }
            >
              Aucune inscription pour le moment.
            </p>
          )}

          {mesCours.map(function (inscription) {
            return (
              <div
                key={inscription._id}
                className={
                  darkMode.couleurCarte +
                  ' border rounded-lg p-4 flex justify-between items-center'
                }
              >
                <div>
                  <p className="font-medium">
                    {inscription.course.title}
                  </p>

                  <p className="text-sm opacity-70">
                    {inscription.course.description}
                  </p>

                  <p className="text-sm opacity-70">
                    Niveau : {inscription.course.level}
                  </p>

                  {inscription.course.pdfUrl && (
                    <a
                      href={
                        'http://localhost:5000/uploads/' +
                        inscription.course.pdfUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 text-sm hover:underline mt-2 inline-block"
                    >
                      📄 Voir le PDF
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <h2
          className={
            darkMode.couleurTexte +
            ' text-lg font-semibold mb-2'
          }
        >
          Cours disponibles
        </h2>

        <div className="space-y-2 mb-6">
          {courses.map(function (cours) {
            return (
              <div
                key={cours._id}
                className={
                  darkMode.couleurCarte +
                  ' border rounded-lg p-4 flex justify-between items-center'
                }
              >
                <div>
                  <p className="font-medium">
                    {cours.title}
                  </p>

                  <p className="text-sm opacity-70">
                    {cours.description}
                  </p>

                  <p className="text-sm opacity-70">
                    {cours.level}
                  </p>
                </div>

                <button
                  onClick={function () {
                    sInscrire(cours._id)
                  }}
                  className="bg-cyan-500 text-slate-950 font-semibold text-sm py-2 px-4 rounded-lg"
                >
                  S'inscrire
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1}
            onClick={function () {
              setPage(page - 1)
            }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
          >
            Précédent
          </button>

          <span className={darkMode.couleurTexte}>
            Page {page} / {pages}
          </span>

          <button
            disabled={page === pages}
            onClick={function () {
              setPage(page + 1)
            }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentCourses