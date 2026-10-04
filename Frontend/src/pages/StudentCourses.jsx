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
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [mesCours, setMesCours] = useState([])
  const [avgGrade, setAvgGrade] = useState(0)
  const [message, setMessage] = useState('')

  // quiz de chaque cours inscrit : { idDuCours: [quiz1, quiz2, ...] }
  const [quizParCours, setQuizParCours] = useState({})

  // --- Vue detail d un cours (quand on clique Continue/Review) ---
  const [coursOuvert, setCoursOuvert] = useState(null)
  const [modules, setModules] = useState([])
  const [chargementModules, setChargementModules] = useState(false)

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

  // charge les inscriptions, PUIS pour chaque cours inscrit, va chercher ses quiz
  function chargerMesCours() {
    axios.get('http://localhost:5000/api/students/' + userId + '/mes-cours', headerAuth)
      .then(async function (res) {
        const inscriptions = res.data
        setMesCours(inscriptions)

        const quizMap = {}
        for (let i = 0; i < inscriptions.length; i++) {
          const idDuCours = inscriptions[i].course._id
          const reponseQuiz = await axios.get('http://localhost:5000/api/quizzes?courseId=' + idDuCours)
          quizMap[idDuCours] = reponseQuiz.data
        }
        setQuizParCours(quizMap)
      })
  }

function chargerLaMoyenne() {
  axios.get(
    'http://localhost:5000/api/analytics/student-progress',
    headerAuth
  )
    .then(function (res) {
      setAvgGrade(res.data.avgGrade || 0);
    })
    .catch(function (err) {
      console.log("Erreur moyenne :", err);
      setAvgGrade(0);
    });
}

  useEffect(function () {
    chargerLesCours()
  }, [page])

  useEffect(function () {
    chargerMesCours()
    chargerLaMoyenne()
  }, [])

  async function sInscrire(idDuCours) {
    try {
      await axios.post(
        'http://localhost:5000/api/students/' + userId + '/inscrire-cours',
        { courseId: idDuCours },
        headerAuth
      )
      setMessage('Inscription reussie !')
      chargerMesCours()
    } catch (err) {
      setMessage('Erreur lors de l inscription')
    }
  }

  function ouvrirCours(cours) {
    setCoursOuvert(cours)
    setChargementModules(true)

    axios.get('http://localhost:5000/api/modules/course/' + cours._id, headerAuth)
      .then(function (res) {
        setModules(res.data)
        setChargementModules(false)
      })
      .catch(function (err) {
        console.log(err)
        setChargementModules(false)
      })
  }

  function fermerCours() {
    setCoursOuvert(null)
    setModules([])
  }

  // redirige vers My Quizzes, filtre sur ce cours
  function allerAuQuiz() {
    window.location.href = '/student/quizzes?courseId=' + coursOuvert._id
  }

  // --- Chiffres pour les 4 cartes ---
  let nombreEnrolled = 0
  let nombreCompleted = 0

  for (let i = 0; i < mesCours.length; i++) {
    if (mesCours[i].status === 'completed') {
      nombreCompleted = nombreCompleted + 1
    } else {
      nombreEnrolled = nombreEnrolled + 1
    }
  }

  const coursNonInscrits = []
  for (let i = 0; i < courses.length; i++) {
    let dejaInscrit = false

    for (let j = 0; j < mesCours.length; j++) {
      if (mesCours[j].course && mesCours[j].course._id === courses[i]._id) {
        dejaInscrit = true
      }
    }

    if (dejaInscrit === false) {
      coursNonInscrits.push(courses[i])
    }
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Student</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/student/courses" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">My Courses</a>
          <a href="/student/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">My Quizzes</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-6'}>My Courses</h1>

        {message !== '' && (
          <p className="text-cyan-400 text-sm mb-4">{message}</p>
        )}

        {/* 4 cartes */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Enrolled</p>
            <p className="text-2xl font-bold mt-1">{nombreEnrolled}</p>
          </div>
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Completed</p>
            <p className="text-2xl font-bold mt-1">{nombreCompleted}</p>
          </div>
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Avg Grade</p>
            <p className="text-2xl font-bold mt-1">{avgGrade.toFixed(0)}%</p>
          </div>
          <div className={darkMode.couleurCarte + ' border rounded-xl p-5'}>
            <p className="text-sm opacity-70">Available</p>
            <p className="text-2xl font-bold mt-1">{coursNonInscrits.length}</p>
          </div>
        </div>

        {coursOuvert !== null ? (
          <div className={darkMode.couleurCarte + ' border rounded-xl p-6'}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={darkMode.couleurTexte + ' text-lg font-bold'}>{coursOuvert.title}</h2>
              <button
                onClick={fermerCours}
                className="bg-cyan-500/10 text-cyan-400 text-sm font-medium px-4 py-1 rounded-full"
              >
                Back
              </button>
            </div>

            <p className="text-sm opacity-70 mb-2">
              Prof : {coursOuvert.teacher ? coursOuvert.teacher.lastName : 'Non defini'}
            </p>

            {coursOuvert.pdfUrl && (
              <a
                href={'http://localhost:5000/uploads/' + coursOuvert.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 text-sm hover:underline block mb-4"
              >
                Voir le PDF du cours
              </a>
            )}

            {chargementModules === true ? (
              <p className="opacity-70">Chargement...</p>
            ) : modules.length === 0 ? null : (
              <div className="space-y-3 mb-6">
                {modules.map(function (moduleActuel) {
                  return (
                    <div key={moduleActuel._id}>
                      {moduleActuel.lessons.map(function (lecon) {
                        return (
                          <div key={lecon._id} className="border border-slate-700 rounded-lg p-4 mb-3">
                            <p className="font-semibold">{lecon.title}</p>
                            {lecon.content && (
                              <p className="text-sm opacity-70 mt-1">{lecon.content}</p>
                            )}
                            {lecon.pdfUrl && (
                              <a
                                href={'http://localhost:5000/uploads/' + lecon.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 text-sm hover:underline block mt-2"
                              >
                                Voir le PDF
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Liste des quiz de ce cours */}
            {quizParCours[coursOuvert._id] && quizParCours[coursOuvert._id].length > 0 && (
              <div className="mb-4">
                <p className="font-medium text-sm mb-2">Quiz disponibles</p>
                <div className="space-y-2">
                  {quizParCours[coursOuvert._id].map(function (quiz) {
                    return (
                      <div key={quiz._id} className="border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm">{quiz.title}</span>
                        <button
                          onClick={allerAuQuiz}
                          className="bg-cyan-500 text-slate-950 font-semibold text-xs py-1 px-3 rounded-full"
                        >
                          Take Quiz
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className={darkMode.couleurTexte + ' text-lg font-semibold mb-2'}>Mes inscriptions</h2>

            <div className="space-y-2 mb-8">
              {mesCours.length === 0 && (
                <p className={darkMode.couleurCarte + ' border rounded-lg p-4 text-sm'}>
                  Aucune inscription pour le moment.
                </p>
              )}

              {mesCours.map(function (inscription) {
                const estComplete = inscription.status === 'completed'
                const statutTexte = estComplete ? 'Completed' : 'Enrolled'
                const statutCouleur = estComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                const boutonTexte = estComplete ? 'Review' : 'Continue'
                const nomDuProf = inscription.course.teacher ? inscription.course.teacher.lastName : 'Prof non defini'
                const listeQuiz = quizParCours[inscription.course._id] || []

                return (
                  <div key={inscription._id} className={darkMode.couleurCarte + ' border rounded-lg p-4'}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{inscription.course.title}</p>
                        <p className="text-sm opacity-70">{inscription.course.level} — {nomDuProf}</p>
                        <span className={'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ' + statutCouleur}>
                          {statutTexte}
                        </span>
                      </div>

                      <button
                        onClick={function () { ouvrirCours(inscription.course) }}
                        className="bg-cyan-500/10 text-cyan-400 font-semibold text-sm py-2 px-4 rounded-full"
                      >
                        {boutonTexte}
                      </button>
                    </div>

                    {listeQuiz.length > 0 && (
                      <p className="text-xs opacity-70 mt-3">
                        {listeQuiz.length} quiz disponible{listeQuiz.length > 1 ? 's' : ''} : {listeQuiz.map(function (q) { return q.title }).join(', ')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <h2 className={darkMode.couleurTexte + ' text-lg font-semibold mb-2'}>Cours disponibles</h2>

            <div className="space-y-2 mb-6">
              {coursNonInscrits.length === 0 && (
                <p className={darkMode.couleurCarte + ' border rounded-lg p-4 text-sm'}>
                  Tu es deja inscrit a tous les cours de cette page.
                </p>
              )}

              {coursNonInscrits.map(function (cours) {
                const nomDuProf = cours.teacher ? cours.teacher.lastName : 'Prof non defini'

                return (
                  <div key={cours._id} className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
                    <div>
                      <p className="font-medium">{cours.title}</p>
                      <p className="text-sm opacity-70">{cours.description}</p>
                      <p className="text-sm opacity-70">{cours.level} — {nomDuProf}</p>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                        Available
                      </span>
                    </div>

                    <button
                      onClick={function () { sInscrire(cours._id) }}
                      className="bg-cyan-500 text-slate-950 font-semibold text-sm py-2 px-4 rounded-full"
                    >
                      S inscrire
                    </button>
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

              <span className={darkMode.couleurTexte}>Page {page} / {pages}</span>

              <button
                disabled={page === pages}
                onClick={function () { setPage(page + 1) }}
                className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StudentCourses