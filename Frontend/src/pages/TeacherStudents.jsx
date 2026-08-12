// ============================================================
// src/pages/TeacherStudents.jsx
// Gere les students : ajouter, lister (avec pagination), modifier, supprimer
// ============================================================

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function TeacherStudents() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')

  if (role !== 'teacher') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()

  // liste complete des students recuperee du backend
  const [studentsTotal, setStudentsTotal] = useState([])

  // pagination geree manuellement, car la route /students/list
  // ne fait pas de pagination cote backend (contrairement a courses)
  const [page, setPage] = useState(1)
  const parPage = 5

  // formulaire (ajout ET modification)
  const [lastNameForm, setLastNameForm] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [level, setLevel] = useState('')

  const [idEnModification, setIdEnModification] = useState('')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLesStudents() {
    axios.get('http://localhost:5000/api/students/list').then(function (res) {
      setStudentsTotal(res.data)
    })
  }

  useEffect(function () {
    chargerLesStudents()
  }, [])

  function viderLeFormulaire() {
    setLastNameForm('')
    setEmail('')
    setPassword('')
    setStudentCode('')
    setLevel('')
    setGroup('')
    setIdEnModification('')
  }

  function preparerModification(student) {
    setLastNameForm(student.lastName)
    setEmail(student.email)
    setStudentCode(student.studentCode)
    setLevel(student.level)
    setGroup(student.group)
    setIdEnModification(student._id)
  }

  async function envoyerFormulaire(event) {
    event.preventDefault()

    if (idEnModification !== '') {
      // modification : pas besoin d envoyer le mot de passe
      await axios.put('http://localhost:5000/api/students/' + idEnModification, {
        lastName: lastNameForm,
        studentCode: studentCode,
        level: level,
        group: group,
      })
    } else {
      // ajout : le mot de passe est obligatoire
      await axios.post('http://localhost:5000/api/students/ajouter', {
        lastName: lastNameForm,
        email: email,
        password: password,
        role: 'student',
        studentCode: studentCode,
        level: level,
        group: group,
      })
    }

    viderLeFormulaire()
    chargerLesStudents()
  }

  async function supprimerStudent(idDuStudent) {
    await axios.delete('http://localhost:5000/api/students/' + idDuStudent)
    chargerLesStudents()
  }

  // decoupage de la liste complete en pages, fait ici cote frontend
  const debut = (page - 1) * parPage
  const fin = debut + parPage
  const studentsAffiches = studentsTotal.slice(debut, fin)
  const totalPages = Math.ceil(studentsTotal.length / parPage) || 1

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/teacher" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Dashboard</a>
          <a href="/teacher/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/teacher/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/teacher/students" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Students</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-4'}>Students</h1>

        <form onSubmit={envoyerFormulaire} className={darkMode.couleurCarte + ' border rounded-xl p-6 mb-6 grid grid-cols-2 gap-3'}>

          <input
            type="text"
            placeholder="Nom"
            value={lastNameForm}
            onChange={function (event) { setLastNameForm(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            required
          />

          {/* email et password seulement visibles en mode ajout, pas en modification */}
          {idEnModification === '' && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={function (event) { setEmail(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              required
            />
          )}

          {idEnModification === '' && (
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={function (event) { setPassword(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              required
            />
          )}

          <input
            type="text"
            placeholder="Niveau"
            value={level}
            onChange={function (event) { setLevel(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <div className="col-span-2 flex gap-2">
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
          {studentsAffiches.map(function (student) {
            return (
              <div key={student._id} className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
                <div>
                  <p className="font-medium">{student.lastName}</p>
                  <p className="text-sm opacity-70">{student.email} — {student.studentCode} — {student.level}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={function () { preparerModification(student) }}
                    className="text-cyan-400 text-sm hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={function () { supprimerStudent(student._id) }}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1}
            onClick={function () { setPage(page - 1) }}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
          >
            Precedent
          </button>

          <span className={darkMode.couleurTexte}>Page {page} / {totalPages}</span>

          <button
            disabled={page === totalPages}
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

export default TeacherStudents