import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

// Exemple de JSON pre-rempli dans la popup, pour montrer le format attendu
const EXEMPLE_JSON = '[{"type":"mcq","q":"Question ?","options":["A","B","C","D"],"correct":0}]'

function AdminQuizzes() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  // Si ce n'est pas un admin, on le renvoie vers le login
  if (role !== 'admin') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  // --- Donnees principales ---
  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState([])
  const [chargement, setChargement] = useState(true)

  // --- Etats pour la popup (modal) de creation ---
  const [modalOuverte, setModalOuverte] = useState(false)
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [questionsJson, setQuestionsJson] = useState(EXEMPLE_JSON)
  const [erreurForm, setErreurForm] = useState('')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  // Va chercher tous les quiz depuis le backend
  function chargerLesQuiz() {
    setChargement(true)
    axios.get('http://localhost:5000/api/quizzes', headerAuth)
      .then(function (res) {
        setQuizzes(res.data)
        setChargement(false)
      })
      .catch(function (err) {
        console.log(err)
        setChargement(false)
      })
  }

  // Va chercher tous les cours, pour remplir le menu deroulant "Course"
  function chargerLesCours() {
    axios.get('http://localhost:5000/api/courses/list?limit=100')
      .then(function (res) {
        setCourses(res.data.courses)
        // On selectionne le 1er cours par defaut, pour eviter un menu vide
        if (res.data.courses.length > 0) {
          setCourseId(res.data.courses[0]._id)
        }
      })
  }

  // useEffect avec [] vide = se lance UNE SEULE FOIS, au chargement de la page
  useEffect(function () {
    chargerLesQuiz()
    chargerLesCours()
  }, [])

  // Ouvre la popup et remet le formulaire a zero
  function ouvrirModal() {
    setTitle('')
    setQuestionsJson(EXEMPLE_JSON)
    setErreurForm('')
    setModalOuverte(true)
  }

  function fermerModal() {
    setModalOuverte(false)
  }

  // Envoie le nouveau quiz au backend
  async function sauvegarderQuiz() {
    // --- Verifications avant d'envoyer ---
    if (courseId === '') {
      setErreurForm('Choisis un cours')
      return
    }
    if (title.trim() === '') {
      setErreurForm('Le titre est obligatoire')
      return
    }

    // Le champ "Questions" est du texte tape par l'utilisateur.
    // JSON.parse() essaie de le transformer en vraie liste JavaScript.
    // Si l'utilisateur a mal ecrit le JSON (virgule en trop, etc.),
    // JSON.parse() plante : c'est pour ca qu'on met un try/catch.
    let questionsParsees
    try {
      questionsParsees = JSON.parse(questionsJson)
    } catch (err) {
      setErreurForm('Le JSON des questions est invalide, verifie la syntaxe')
      return
    }

    // --- Envoi au backend ---
    try {
      await axios.post(
        'http://localhost:5000/api/quizzes/course/' + courseId,
        { title: title, questions: questionsParsees },
        headerAuth
      )
      fermerModal()
      chargerLesQuiz()
    } catch (err) {
      setErreurForm(err.response?.data?.message || err.message)
    }
  }

  async function supprimerQuiz(idDuQuiz) {
    const confirmation = window.confirm('Supprimer ce quiz definitivement ?')
    if (!confirmation) {
      return
    }
    await axios.delete('http://localhost:5000/api/quizzes/' + idDuQuiz, headerAuth)
    chargerLesQuiz()
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      {/* ---------- Menu lateral ---------- */}
      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Admin</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/admin/users" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Users</a>
          <a href="/admin/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/admin/quizzes" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Quizzes</a>
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

      {/* ---------- Contenu principal ---------- */}
      <div className="flex-1 p-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className={darkMode.couleurTexte + ' text-2xl font-bold'}>Quizzes</h1>
          <button
            onClick={ouvrirModal}
            className="bg-cyan-500 text-slate-950 font-semibold py-2 px-4 rounded-lg"
          >
            + Create Quiz
          </button>
        </div>

        {/* ---------- Tableau des quiz ---------- */}
        <div className={darkMode.couleurCarte + ' border rounded-xl overflow-hidden'}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm opacity-70">
                <th className="p-4">Quiz</th>
                <th className="p-4">Course</th>
                <th className="p-4">Questions</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargement === true ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center opacity-70">Chargement...</td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center opacity-70">Aucun quiz pour le moment</td>
                </tr>
              ) : (
                quizzes.map(function (quiz) {
                  return (
                    <tr key={quiz._id} className="border-b border-slate-800">
                      <td className="p-4">{quiz.title}</td>
                      <td className="p-4 opacity-80">
                        {quiz.course ? quiz.course.title : 'Cours supprime'}
                      </td>
                      <td className="p-4">{quiz.questionsCount}</td>
                      <td className="p-4">
                        <button
                          onClick={function () { supprimerQuiz(quiz._id) }}
                          className="text-red-400 text-sm hover:underline"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Popup de creation ---------- */}
      {modalOuverte === true && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={darkMode.couleurCarte + ' border rounded-xl p-6 w-[500px]'}>
            <h2 className={darkMode.couleurTexte + ' text-lg font-bold mb-4'}>New Quiz</h2>

            <label className="text-sm opacity-70 block mb-1">Title</label>
            <input
              value={title}
              onChange={function (event) { setTitle(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            />

            <label className="text-sm opacity-70 block mb-1">Course</label>
            <select
              value={courseId}
              onChange={function (event) { setCourseId(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            >
              {courses.map(function (cours) {
                return <option key={cours._id} value={cours._id}>{cours.title}</option>
              })}
            </select>

            <label className="text-sm opacity-70 block mb-1">
              Questions (JSON with type: mcq/tf)
            </label>
            <textarea
              value={questionsJson}
              onChange={function (event) { setQuestionsJson(event.target.value) }}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-2 font-mono text-sm"
            />

            {erreurForm !== '' && (
              <p className="text-red-400 text-sm mb-2">{erreurForm}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={fermerModal} className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={sauvegarderQuiz} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminQuizzes