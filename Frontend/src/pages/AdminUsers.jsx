import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import useDarkMode from '../hooks/useDarkMode'

function AdminUsers() {
  const role = localStorage.getItem('role')
  const lastName = localStorage.getItem('lastName')
  const token = localStorage.getItem('token')

  if (role !== 'admin') {
    return <Navigate to="/login" />
  }

  const darkMode = useDarkMode()
  const headerAuth = { headers: { Authorization: 'Bearer ' + token } }

  const [users, setUsers] = useState([])
  const [roleFiltre, setRoleFiltre] = useState('all')
  const [chargement, setChargement] = useState(true)

  // --- Modal "Add User" ---
  const [modalAjoutOuverte, setModalAjoutOuverte] = useState(false)
  const [nouveauNom, setNouveauNom] = useState('')
  const [nouvelEmail, setNouvelEmail] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [nouveauRole, setNouveauRole] = useState('student')
  const [erreurAjout, setErreurAjout] = useState('')

  // --- Modal modification ---
  const [userEnEdition, setUserEnEdition] = useState(null)
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState('student')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('lastName')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }

  function chargerLesUsers() {
    setChargement(true)
    axios.get(
      'http://localhost:5000/api/users/list?role=' + roleFiltre,
      headerAuth
    ).then(function (res) {
      setUsers(res.data)
      setChargement(false)
    }).catch(function (err) {
      console.log(err)
      setChargement(false)
    })
  }

  useEffect(function () {
    chargerLesUsers()
  }, [roleFiltre])

  // ---------- Ajout d'un user ----------
  function ouvrirModalAjout() {
    setNouveauNom('')
    setNouvelEmail('')
    setNouveauMotDePasse('')
    setNouveauRole('student')
    setErreurAjout('')
    setModalAjoutOuverte(true)
  }

  function fermerModalAjout() {
    setModalAjoutOuverte(false)
  }

  async function ajouterUser() {
    if (nouveauNom.trim() === '' || nouvelEmail.trim() === '' || nouveauMotDePasse.trim() === '') {
      setErreurAjout('Tous les champs sont obligatoires')
      return
    }

    try {
      await axios.post(
        'http://localhost:5000/api/users/ajouter',
        {
          lastName: nouveauNom,
          email: nouvelEmail,
          password: nouveauMotDePasse,
          role: nouveauRole,
        },
        headerAuth
      )
      fermerModalAjout()
      chargerLesUsers()
    } catch (err) {
      setErreurAjout(err.response?.data?.message || err.message)
    }
  }

  // ---------- Activer / desactiver ----------
  function toggleActif(user) {
    axios.put(
      'http://localhost:5000/api/users/' + user._id,
      { isActive: !user.isActive },
      headerAuth
    ).then(function () {
      chargerLesUsers()
    })
  }

  // ---------- Suppression ----------
  function supprimerUser(user) {
    const confirmation = window.confirm('Supprimer ' + user.lastName + ' definitivement ?')
    if (!confirmation) {
      return
    }
    axios.delete(
      'http://localhost:5000/api/users/' + user._id,
      headerAuth
    ).then(function () {
      chargerLesUsers()
    })
  }

  // ---------- Modification ----------
  function ouvrirEdition(user) {
    setUserEnEdition(user)
    setFormLastName(user.lastName || '')
    setFormEmail(user.email || '')
    setFormRole(user.role || 'student')
  }

  function fermerEdition() {
    setUserEnEdition(null)
  }

  function enregistrerModification() {
    axios.put(
      'http://localhost:5000/api/users/' + userEnEdition._id,
      { lastName: formLastName, email: formEmail, role: formRole },
      headerAuth
    ).then(function () {
      fermerEdition()
      chargerLesUsers()
    }).catch(function (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message))
    })
  }

  // ---------- Couleurs des badges ----------
  function badgeRole(r) {
    if (r === 'admin') return 'bg-purple-500/20 text-purple-400'
    if (r === 'teacher') return 'bg-cyan-500/20 text-cyan-400'
    return 'bg-blue-500/20 text-blue-400'
  }

  return (
    <div className={'flex min-h-screen ' + darkMode.couleurFond}>

      <div className={darkMode.couleurFondMenu + ' w-64 border-r border-slate-800 p-6 flex flex-col justify-between'}>
        <div>
          <h2 className={darkMode.couleurTexte + ' font-bold text-lg mb-1'}>EduInsight</h2>
          <p className="text-cyan-400 text-sm font-medium mb-1">Espace Admin</p>
          <p className="text-slate-500 text-xs mb-6">{lastName}</p>

          <a href="/admin/users" className="block px-4 py-2 rounded-lg text-cyan-400 bg-cyan-500/10 mb-1">Users</a>
          <a href="/admin/courses" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Courses</a>
          <a href="/admin/quizzes" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 mb-1">Quizzes</a>
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

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className={darkMode.couleurTexte + ' text-2xl font-bold'}>User Management</h1>
          <button
            onClick={ouvrirModalAjout}
            className="bg-cyan-500 text-slate-950 font-semibold py-2 px-4 rounded-full"
          >
            + Add User
          </button>
        </div>

        {/* Filtre */}
        <div className="flex gap-4 mb-6">
          <select
            value={roleFiltre}
            onChange={function (event) { setRoleFiltre(event.target.value) }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
          >
            <option value="all">Tous les roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* Tableau */}
        <div className={darkMode.couleurCarte + ' border rounded-xl overflow-hidden'}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm opacity-70">
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargement === true ? (
                <tr><td colSpan="4" className="p-4 text-center opacity-70">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center opacity-70">Aucun utilisateur trouve</td></tr>
              ) : (
                users.map(function (u) {
                  return (
                    <tr key={u._id} className="border-b border-slate-800">
                      <td className="p-4">{u.lastName}</td>
                      <td className="p-4">
                        <span className={'px-3 py-1 rounded-full text-xs font-medium ' + badgeRole(u.role)}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={function () { toggleActif(u) }}
                          className={'px-3 py-1 rounded-full text-xs font-medium ' + (u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 flex gap-3">
                        <button
                          onClick={function () { ouvrirEdition(u) }}
                          className="bg-cyan-500/10 text-cyan-400 text-xs font-medium px-3 py-1 rounded-full hover:bg-cyan-500/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={function () { supprimerUser(u) }}
                          className="text-red-400 text-xs hover:underline"
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

      {/* ---------- Modal Add User ---------- */}
      {modalAjoutOuverte === true && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={darkMode.couleurCarte + ' border rounded-xl p-6 w-96'}>
            <h2 className={darkMode.couleurTexte + ' text-lg font-bold mb-4'}>Add User</h2>

            <label className="text-sm opacity-70 block mb-1">Nom</label>
            <input
              value={nouveauNom}
              onChange={function (event) { setNouveauNom(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            />

            <label className="text-sm opacity-70 block mb-1">Email</label>
            <input
              type="email"
              value={nouvelEmail}
              onChange={function (event) { setNouvelEmail(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            />

            <label className="text-sm opacity-70 block mb-1">Mot de passe</label>
            <input
              type="password"
              value={nouveauMotDePasse}
              onChange={function (event) { setNouveauMotDePasse(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            />

            <label className="text-sm opacity-70 block mb-1">Role</label>
            <select
              value={nouveauRole}
              onChange={function (event) { setNouveauRole(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            {erreurAjout !== '' && (
              <p className="text-red-400 text-sm mb-2">{erreurAjout}</p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button onClick={fermerModalAjout} className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={ajouterUser} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal modification ---------- */}
      {userEnEdition !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={darkMode.couleurCarte + ' border rounded-xl p-6 w-96'}>
            <h2 className={darkMode.couleurTexte + ' text-lg font-bold mb-4'}>Modifier l'utilisateur</h2>

            <label className="text-sm opacity-70 block mb-1">Nom</label>
            <input
              value={formLastName}
              onChange={function (event) { setFormLastName(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            />

            <label className="text-sm opacity-70 block mb-1">Email</label>
            <input
              value={formEmail}
              onChange={function (event) { setFormEmail(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4"
            />

            <label className="text-sm opacity-70 block mb-1">Role</label>
            <select
              value={formRole}
              onChange={function (event) { setFormRole(event.target.value) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-6"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            <div className="flex justify-end gap-3">
              <button onClick={fermerEdition} className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800">
                Annuler
              </button>
              <button onClick={enregistrerModification} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers