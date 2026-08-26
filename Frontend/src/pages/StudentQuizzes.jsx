import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function StudentQuizzes() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  if (role !== 'student') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [searchParams] = useSearchParams()
  const courseIdDepuisUrl = searchParams.get('courseId')

  const [lignes, setLignes] = useState([])

  const [quizActif, setQuizActif] = useState(null)
  const [questions, setQuestions] = useState([])
  const [attemptId, setAttemptId] = useState('')
  const [reponses, setReponses] = useState({})
  const [score, setScore] = useState(null)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  async function chargerLeTableau() {
    const resInscriptions = await axios.get('http://localhost:5000/api/students/' + userId + '/mes-cours', headerAuth)
    const inscriptions = resInscriptions.data

    const resTentatives = await axios.get('http://localhost:5000/api/quiz-attempts/mes-tentatives/' + userId, headerAuth)
    const tentatives = resTentatives.data

    const lignesFinales = []

    for (let i = 0; i < inscriptions.length; i++) {
      const cours = inscriptions[i].course
      const resQuiz = await axios.get('http://localhost:5000/api/quizzes?courseId=' + cours._id)

      for (let j = 0; j < resQuiz.data.length; j++) {
        const quiz = resQuiz.data[j]

        let bestScore = 0
        for (let k = 0; k < tentatives.length; k++) {
          if (tentatives[k].quiz && tentatives[k].quiz._id === quiz._id) {
            if (tentatives[k].score > bestScore) {
              bestScore = tentatives[k].score
            }
          }
        }

        lignesFinales.push({
          course: cours,
          quiz: quiz,
          bestScore: bestScore,
        })
      }
    }

    setLignes(lignesFinales)

    if (courseIdDepuisUrl) {
      const ligneCorrespondante = lignesFinales.find(function (l) {
        return l.course._id === courseIdDepuisUrl
      })
      if (ligneCorrespondante) {
        commencerQuiz(ligneCorrespondante.quiz)
      }
    }
  }

  useEffect(function () {
    chargerLeTableau()
  }, [])

  async function commencerQuiz(quiz) {
    const reponseTentative = await axios.post(
      'http://localhost:5000/api/quiz-attempts/start/' + quiz._id,
      {},
      headerAuth
    )

    const reponseQuestions = await axios.get(
      'http://localhost:5000/api/quizzes/' + quiz._id + '/questions',
      headerAuth
    )

    setAttemptId(reponseTentative.data._id)
    setQuizActif(quiz)
    setQuestions(reponseQuestions.data.questions)
    setReponses({})
    setScore(null)
  }

  function choisirReponse(idDeLaQuestion, idDuChoix) {
    const nouvellesReponses = Object.assign({}, reponses)
    nouvellesReponses[idDeLaQuestion] = idDuChoix
    setReponses(nouvellesReponses)
  }

  async function soumettreQuiz(event) {
    event.preventDefault()

    const listeReponses = []
    for (const idDeLaQuestion in reponses) {
      listeReponses.push({
        questionId: idDeLaQuestion,
        selectedChoiceId: reponses[idDeLaQuestion],
      })
    }

    const res = await axios.post(
      'http://localhost:5000/api/quiz-attempts/' + attemptId + '/submit',
      { answers: listeReponses },
      headerAuth
    )

    setScore(res.data.score)
  }

  function fermerLeQuiz() {
    setQuizActif(null)
    setQuestions([])
    setReponses({})
    setScore(null)
    chargerLeTableau()
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Student</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/student/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Courses</a>
          <a href="/student/quizzes" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">My Quizzes</a>
          <a href="/student/progress" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Progress</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-4'}>My Quizzes</h1>

        {quizActif === null && (
          <div className={darkMode.couleurCarte + ' border rounded-xl overflow-hidden'}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-sm opacity-70">
                  <th className="p-4">Course</th>
                  <th className="p-4">Quiz</th>
                  <th className="p-4">Questions</th>
                  <th className="p-4">Best Score</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map(function (ligne) {
                  return (
                    <tr key={ligne.quiz._id} className="border-b border-slate-800">
                      <td className="p-4">{ligne.course.title}</td>
                      <td className="p-4">{ligne.quiz.title}</td>
                      <td className="p-4">{ligne.quiz.questionsCount}</td>
                      <td className="p-4">{ligne.bestScore}</td>
                      <td className="p-4">
                        <button
                          onClick={function () { commencerQuiz(ligne.quiz) }}
                          className="bg-cyan-500 text-slate-950 font-semibold text-sm py-1 px-3 rounded-full"
                        >
                          Start
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {lignes.length === 0 && (
              <p className="p-4 text-sm opacity-70">Aucun quiz disponible pour le moment.</p>
            )}
          </div>
        )}

        {quizActif !== null && score === null && (
          <form onSubmit={soumettreQuiz} className={darkMode.couleurCarte + ' border rounded-xl p-6 flex flex-col gap-4'}>
            <p className="font-medium">{quizActif.title}</p>

            {questions.map(function (question) {
              return (
                <div key={question._id}>
                  <p className="mb-2">{question.statement}</p>
                  {question.choices.map(function (choix) {
                    return (
                      <label key={choix._id} className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name={question._id}
                          value={choix._id}
                          onChange={function () { choisirReponse(question._id, choix._id) }}
                        />
                        <span>{choix.text}</span>
                      </label>
                    )
                  })}
                </div>
              )
            })}

            <div className="flex gap-2">
              <button type="submit" className="bg-cyan-500 text-slate-950 font-semibold py-2 px-4 rounded-lg">
                Soumettre
              </button>
              <button type="button" onClick={fermerLeQuiz} className="text-slate-400 text-sm">
                Annuler
              </button>
            </div>
          </form>
        )}

        {score !== null && (
          <div className={darkMode.couleurCarte + ' border rounded-xl p-6'}>
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">Quiz termine !</p>
              <button
                onClick={fermerLeQuiz}
                className="bg-cyan-500/10 text-cyan-400 text-sm font-medium px-4 py-1 rounded-full"
              >
                Back
              </button>
            </div>
            <p className="text-2xl font-bold">Score : {score}</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default StudentQuizzes