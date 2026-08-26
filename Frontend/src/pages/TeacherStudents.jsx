import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function TeacherStudents() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'teacher') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [students, setStudents] = useState([])
  const [chargement, setChargement] = useState(true)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLesStudents() {
    setChargement(true)
    axios.get('http://localhost:5000/api/students/teacher-students', headerAuth)
      .then(function (res) {
        setStudents(res.data)
        setChargement(false)
      })
      .catch(function (err) {
        console.log(err)
        setChargement(false)
      })
  }

  useEffect(function () {
    chargerLesStudents()
  }, [])

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-6'}>Students</h1>

        <div className={darkMode.couleurCarte + ' border rounded-xl overflow-hidden'}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm opacity-70">
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Enrolled</th>
                <th className="p-4">Avg Grade</th>
              </tr>
            </thead>
            <tbody>
              {chargement === true ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center opacity-70">Chargement...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center opacity-70">Aucun student inscrit a tes cours pour le moment.</td>
                </tr>
              ) : (
                students.map(function (s, index) {
                  return (
                    <tr key={index} className="border-b border-slate-800">
                      <td className="p-4">{s.lastName}</td>
                      <td className="p-4 opacity-80">{s.email}</td>
                      <td className="p-4">{s.enrolled}</td>
                      <td className="p-4">{s.avgGrade}%</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeacherStudents