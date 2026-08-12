import { Navigate } from 'react-router-dom'
import useDarkMode from '../hooks/useDarkMode'

function StudentCertificates() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')

  if (role !== 'student') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    window.location.href = '/login'
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>
      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Student</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/student" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Dashboard</a>
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
        <h1 className={darkMode.couleurTexte + ' text-2xl font-bold mb-4'}>Certificates</h1>
        <div className={darkMode.couleurCarte + ' border rounded-xl p-8'}>
          Contenu a venir.
        </div>
      </div>
    </div>
  )
}

export default StudentCertificates