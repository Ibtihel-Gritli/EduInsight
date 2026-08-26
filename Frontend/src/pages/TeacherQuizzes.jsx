import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function TeacherQuizzes() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'teacher') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState([])

  // formulaire de creation (titre + cours + questions JSON)
  const [afficherCreation, setAfficherCreation] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCourseId, setNewCourseId] = useState('')
  const [newQuestionsJson, setNewQuestionsJson] = useState('[]')
  const [erreurCreation, setErreurCreation] = useState('')

  // formulaire d edition (un quiz existant)
  const [quizEnEdition, setQuizEnEdition] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editQuestionsJson, setEditQuestionsJson] = useState('')
  const [erreurEdition, setErreurEdition] = useState('')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLesQuiz() {
    axios.get('http://localhost:5000/api/quizzes').then(function (res) {
      setQuizzes(res.data)
    })
  }

  function chargerLesCours() {
    axios.get('http://localhost:5000/api/courses/list?limit=100').then(function (res) {
      setCourses(res.data.courses)
    })
  }

  useEffect(function () {
    chargerLesQuiz()
    chargerLesCours()
  }, [])

  async function creerQuiz(event) {
    event.preventDefault()
    setErreurCreation('')

    if (newCourseId === '') {
      setErreurCreation('Choisis un cours')
      return
    }

    let questionsParsees = []
    if (newQuestionsJson.trim() !== '') {
      try {
        questionsParsees = JSON.parse(newQuestionsJson)
      } catch (err) {
        setErreurCreation('Le format JSON des questions est invalide')
        return
      }
    }

    await axios.post(
      'http://localhost:5000/api/quizzes/course/' + newCourseId,
      { title: newTitle, description: '', questions: questionsParsees },
      headerAuth
    )

    setNewTitle('')
    setNewCourseId('')
    setNewQuestionsJson('[]')
    setAfficherCreation(false)
    chargerLesQuiz()
  }

  // au clic sur Edit : va chercher les questions actuelles, les transforme en JSON lisible
  async function ouvrirEdition(quiz) {
    const res = await axios.get('http://localhost:5000/api/quizzes/' + quiz._id + '/questions', headerAuth)
    const questions = res.data.questions

    const questionsFormat = questions.map(function (q) {
      if (q.type === 'TrueFalse') {
        const choixVrai = q.choices.find(function (c) { return c.text === 'Vrai' })
        return { type: 'tf', q: q.statement, correct: choixVrai ? choixVrai.isCorrect : true }
      } else {
        const options = q.choices.map(function (c) { return c.text })
        let indexCorrect = 0
        for (let i = 0; i < q.choices.length; i++) {
          if (q.choices[i].isCorrect) {
            indexCorrect = i
          }
        }
        return { type: 'mcq', q: q.statement, options: options, correct: indexCorrect }
      }
    })

    setQuizEnEdition(quiz)
    setEditTitle(quiz.title)
    setEditQuestionsJson(JSON.stringify(questionsFormat, null, 2))
    setErreurEdition('')
  }

  function fermerEdition() {
    setQuizEnEdition(null)
    setEditTitle('')
    setEditQuestionsJson('')
    setErreurEdition('')
  }

  async function enregistrerEdition(event) {
    event.preventDefault()

    let questionsParsees

    try {
      questionsParsees = JSON.parse(editQuestionsJson)
    } catch (err) {
      setErreurEdition('Le format JSON est invalide')
      return
    }

    await axios.put(
      'http://localhost:5000/api/quizzes/' + quizEnEdition._id,
      { title: editTitle },
      headerAuth
    )

    await axios.put(
      'http://localhost:5000/api/quizzes/' + quizEnEdition._id + '/questions',
      { questions: questionsParsees },
      headerAuth
    )

    fermerEdition()
    chargerLesQuiz()
  }

  async function supprimerQuiz(idDuQuiz) {
    await axios.delete('http://localhost:5000/api/quizzes/' + idDuQuiz, headerAuth)
    chargerLesQuiz()
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/teacher/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/teacher/quizzes" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Quizzes</a>
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
        <div className="flex justify-between items-center mb-4">
          <h1 className={darkMode.couleurTexte + ' text-2xl font-bold'}>Quizzes</h1>
          <button
            onClick={function () { setAfficherCreation(!afficherCreation) }}
            className="bg-cyan-500 text-slate-950 font-semibold text-sm py-2 px-4 rounded-full"
          >
            + Create Quiz
          </button>
        </div>

        {afficherCreation && (
          <form onSubmit={creerQuiz} className={darkMode.couleurCarte + ' border rounded-xl p-6 mb-6 flex flex-col gap-3'}>
            <label className="text-sm text-slate-400">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={function (event) { setNewTitle(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              required
            />

            <label className="text-sm text-slate-400">Course</label>
            <select
              value={newCourseId}
              onChange={function (event) { setNewCourseId(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            >
              <option value="">Choisir un cours</option>
              {courses.map(function (cours) {
                return <option key={cours._id} value={cours._id}>{cours.title}</option>
              })}
            </select>

            <label className="text-sm text-slate-400">Questions (JSON avec type: mcq/tf)</label>
            <textarea
              value={newQuestionsJson}
              onChange={function (event) { setNewQuestionsJson(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm h-40"
            />

            {erreurCreation !== '' && (
              <p className="text-red-400 text-sm">{erreurCreation}</p>
            )}

            <button type="submit" className="bg-cyan-500 text-slate-950 font-semibold py-2 rounded-lg">
              Creer
            </button>
          </form>
        )}

        {quizEnEdition !== null && (
          <form onSubmit={enregistrerEdition} className={darkMode.couleurCarte + ' border rounded-xl p-6 mb-6 flex flex-col gap-3'}>
            <p className="font-medium">Edit Quiz</p>

            <label className="text-sm text-slate-400">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={function (event) { setEditTitle(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            />

            <label className="text-sm text-slate-400">Course</label>
            <p className="p-3 bg-slate-800 rounded-lg text-sm opacity-70">
              {quizEnEdition.course ? quizEnEdition.course.title : ''}
            </p>

            <label className="text-sm text-slate-400">Questions (JSON avec type: mcq/tf)</label>
            <textarea
              value={editQuestionsJson}
              onChange={function (event) { setEditQuestionsJson(event.target.value) }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm h-48"
            />

            {erreurEdition !== '' && (
              <p className="text-red-400 text-sm">{erreurEdition}</p>
            )}

            <div className="flex gap-2">
              <button type="submit" className="bg-cyan-500 text-slate-950 font-semibold py-2 px-4 rounded-lg">
                Save
              </button>
              <button type="button" onClick={fermerEdition} className="text-slate-400 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

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
              {quizzes.map(function (quiz) {
                return (
                  <tr key={quiz._id} className="border-b border-slate-800">
                    <td className="p-4">{quiz.title}</td>
                    <td className="p-4">{quiz.course ? quiz.course.title : 'Cours supprime'}</td>
                    <td className="p-4">{quiz.questionsCount}</td>
                    <td className="p-4">
                      <button
                        onClick={function () { ouvrirEdition(quiz) }}
                        className="text-cyan-400 text-sm hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={function () { supprimerQuiz(quiz._id) }}
                        className="text-red-400 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {quizzes.length === 0 && (
            <p className="p-4 text-sm opacity-70">Aucun quiz cree pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherQuizzes