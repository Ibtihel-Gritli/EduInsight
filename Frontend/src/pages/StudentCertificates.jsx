// ============================================================
// src/pages/StudentCertificates.jsx
// Certificat visuel (image de fond + donnees superposees)
// avec telechargement en PDF
// ============================================================

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import useDarkMode from '../hooks/useDarkMode'

// Attribution de la mention selon le pourcentage
function getMention(pourcentage) {
  if (pourcentage === 100) return 'Mention Excellent'
  if (pourcentage >= 90) return 'Mention Tres Bien'
  if (pourcentage >= 75) return 'Mention Bien'
  if (pourcentage >= 50) return 'Passable'
  return null
}

function StudentCertificates() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'student') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [certificats, setCertificats] = useState([])
  const [chargement, setChargement] = useState(true)
  const [idEnTelechargement, setIdEnTelechargement] = useState(null)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  // utilise la route deja existante /api/analytics/student-progress,
  // qui renvoie chaque cours avec sa moyenne (grade) et son statut
  function chargerLesCertificats() {
    setChargement(true)
    axios.get('http://localhost:5000/api/analytics/student-progress', headerAuth)
      .then(function (res) {
        const coursDuStudent = res.data.courses

        // on ne garde que les cours termines, avec une note >= 50%
        const coursValides = []
        for (let i = 0; i < coursDuStudent.length; i++) {
          const cours = coursDuStudent[i]
          if (cours.status === 'Completed' && cours.grade >= 50) {
            coursValides.push({
              id: i,
              courseTitle: cours.title,
              percentageScore: cours.grade,
              mention: getMention(cours.grade),
              date: new Date().toLocaleDateString('fr-FR'),
            })
          }
        }

        setCertificats(coursValides)
        setChargement(false)
      })
      .catch(function (err) {
        console.log(err)
        setChargement(false)
      })
  }

  useEffect(function () {
    chargerLesCertificats()
  }, [])

  // transforme le certificat affiche a l ecran en PDF telechargeable
  async function telechargerEnPDF(cert) {
    const element = document.getElementById('certificate-' + cert.id)
    if (!element) {
      return
    }

    try {
      setIdEnTelechargement(cert.id)

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)

      const titreNettoye = cert.courseTitle.replace(/[^a-zA-Z0-9]/g, '_')
      pdf.save('Certificat_' + titreNettoye + '.pdf')
    } catch (err) {
      console.log('Erreur telechargement PDF : ' + err.message)
    } finally {
      setIdEnTelechargement(null)
    }
  }

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
          <a href="/student/certificates" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Certificates</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-6'}>Certificates</h1>

        {chargement === true ? (
          <p className="opacity-70">Chargement de vos certificats...</p>
        ) : certificats.length === 0 ? (
          <p className={darkMode.couleurCarte + ' border rounded-2xl p-8 text-center text-sm opacity-70'}>
            Aucun certificat disponible. Vous devez terminer un cours avec une moyenne d'au moins 50%.
          </p>
        ) : (
          <div className="space-y-10">
            {certificats.map(function (cert) {
              return (
                <div key={cert.id} className="flex flex-col items-center">

                  {/* Certificat : image de fond + donnees superposees */}
                  <div
                    id={'certificate-' + cert.id}
                    className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-amber-200 bg-white"
                  >
                    <img
                      src="/certif.png"
                      alt="Certificate Template"
                      className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
                    />

                    <div className="absolute inset-0 flex flex-col items-center text-center">
                      <h3 className="absolute top-[42%] text-2xl sm:text-3xl font-bold text-[#3B2F15] capitalize leading-tight">
                        {lastName}
                      </h3>

                      <p className="absolute top-[52%] text-xs sm:text-sm text-[#7A6A44] font-medium">
                        a suivi et valide avec succes le cours
                      </p>

                      <h4 className="absolute top-[57%] text-xl sm:text-2xl font-bold text-[#3B2F15] leading-tight px-6">
                        {cert.courseTitle}
                      </h4>

                      <div className="absolute top-[66%] text-xs sm:text-sm text-[#6B5B35] font-medium space-y-0.5">
                        <p>
                          Score : <span className="font-bold">{cert.percentageScore}%</span>
                          {cert.mention && <span className="italic"> ({cert.mention})</span>}
                        </p>
                        <p>
                          Date : <span className="font-bold">{cert.date}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={function () { telechargerEnPDF(cert) }}
                      disabled={idEnTelechargement === cert.id}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-xl shadow-md"
                    >
                      {idEnTelechargement === cert.id ? 'Generation du PDF...' : 'Telecharger PDF'}
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentCertificates