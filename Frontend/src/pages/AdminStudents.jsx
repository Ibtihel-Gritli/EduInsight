import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function AdminStudents() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'admin') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [students, setStudents] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

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
    setChargement(true)
    axios.get('http://localhost:5000/api/students/list', headerAuth)
      .then(function (res) {
        setStudents(res.data)
        setChargement(false)
        setErreur('')
      })
      .catch(function (err) {
        console.log(err)
        setChargement(false)
        setErreur('Impossible de charger les students. Verifie la console (F12).')
      })
  }

  useEffect(function () {
    chargerLesStudents()
  }, [])

  function viderLeFormulaire() {
    setLastNameForm('')
    setEmail('')
    setPassword('')
    setLevel('')
    setIdEnModification('')
  }

  function preparerModification(student) {
    setLastNameForm(student.lastName)
    setEmail(student.email)
    setLevel(student.level || '')
    setIdEnModification(student._id)
  }

  async function envoyerFormulaire(event) {
    event.preventDefault()

    try {
      if (idEnModification !== '') {
        await axios.put(
          'http://localhost:5000/api/students/' + idEnModification,
          { lastName: lastNameForm, level: level },
          headerAuth
        )
      } else {
        await axios.post('http://localhost:5000/api/students/ajouter', {
          lastName: lastNameForm,
          email: email,
          password: password,
          role: 'student',
          level: level,
        })
      }

      viderLeFormulaire()
      chargerLesStudents()
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message))
    }
  }

  async function supprimerStudent(idDuStudent) {
    const confirmation = window.confirm('Supprimer ce student definitivement ?')
    if (!confirmation) {
      return
    }
    await axios.delete('http://localhost:5000/api/students/' + idDuStudent, headerAuth)
    chargerLesStudents()
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Admin</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/admin/users" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Users</a>
          <a href="/admin/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/admin/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
          <a href="/admin/students" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Students</a>
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
            placeholder="Niveau (ex: L3)"
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

        {/* Liste des students */}
        {chargement === true ? (
          <p className="opacity-70">Chargement...</p>
        ) : erreur !== '' ? (
          <p className="text-red-400">{erreur}</p>
        ) : students.length === 0 ? (
          <p className="opacity-70">Aucun student pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {students.map(function (student) {
              return (
                <div key={student._id} className={darkMode.couleurCarte + ' border rounded-lg p-4 flex justify-between items-center'}>
                  <div>
                    <p className="font-medium">{student.lastName}</p>
                    <p className="text-sm opacity-70">{student.email} — {student.level || 'Niveau non defini'}</p>
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
        )}
      </div>
    </div>
  )
}

export default AdminStudents