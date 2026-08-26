import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function TeacherSettings() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'teacher') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  async function changerMotDePasse(event) {
    event.preventDefault()

    try {
      await axios.patch(
        'http://localhost:5000/api/auth/change-password',
        { currentPassword: currentPassword, newPassword: newPassword },
        headerAuth
      )
      setMessage('Mot de passe mis a jour')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setMessage('Mot de passe actuel incorrect')
    }
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Teacher</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/teacher/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/teacher/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/teacher/students" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Students</a>
          <a href="/teacher/docs" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Docs</a>
          <a href="/teacher/settings" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Settings</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-4'}>Settings</h1>

        <form onSubmit={changerMotDePasse} className={darkMode.couleurCarte + ' border rounded-xl p-6 max-w-md flex flex-col gap-3'}>
          <p className="font-medium mb-2">Changer le mot de passe</p>

          <input type="password" placeholder="Mot de passe actuel" value={currentPassword}
            onChange={function (event) { setCurrentPassword(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" required />

          <input type="password" placeholder="Nouveau mot de passe" value={newPassword}
            onChange={function (event) { setNewPassword(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" required />

          <button type="submit" className="bg-cyan-500 text-slate-950 font-semibold py-2 rounded-lg">
            Enregistrer
          </button>

          {message !== '' && (
            <p className="text-cyan-400 text-sm">{message}</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default TeacherSettings