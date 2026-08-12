import { useState } from 'react'

function useDarkMode() {
  // Lire le mode sauvegardé dans localStorage
  // Si rien n'est sauvegardé, le mode sombre est utilisé par défaut
  const [modeSombre, setModeSombre] = useState(() => {
    const modeSauvegarde = localStorage.getItem('modeSombre')

    if (modeSauvegarde === null) {
      return true
    }

    return modeSauvegarde === 'true'
  })

  // Changer le mode uniquement quand on clique sur le bouton
  function changerMode() {
    if (modeSombre === true) {
      setModeSombre(false)
      localStorage.setItem('modeSombre', 'false')
    } else {
      setModeSombre(true)
      localStorage.setItem('modeSombre', 'true')
    }
  }

  // Couleurs du mode sombre
  let couleurFond = 'bg-slate-950'
  let couleurFondMenu = 'bg-slate-900'
  let couleurTexte = 'text-white'
  let couleurCarte = 'bg-slate-900 border-slate-800 text-slate-400'

  // Couleurs du mode clair
  if (modeSombre === false) {
    couleurFond = 'bg-gray-100'
    couleurFondMenu = 'bg-white'
    couleurTexte = 'text-slate-900'
    couleurCarte = 'bg-white border-gray-200 text-slate-600'
  }

  return {
    modeSombre: modeSombre,
    changerMode: changerMode,
    couleurFond: couleurFond,
    couleurFondMenu: couleurFondMenu,
    couleurTexte: couleurTexte,
    couleurCarte: couleurCarte,
  }
}

export default useDarkMode