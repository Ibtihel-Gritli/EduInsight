import { useState, useEffect } from 'react'
import { getRecommendations, marquerRecommandationsLues } from '../../services/recommendationService'
import RecommendationDropdown from './RecommendationDropdown'

function RecommendationBell() {
  // tous les hooks sont declares AVANT tout return conditionnel
  const [ouvert, setOuvert] = useState(false)
  const [recommandations, setRecommandations] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const role = localStorage.getItem('role')

  function chargerLesRecommandations() {
    getRecommendations().then(function (donnees) {
      setRecommandations(donnees.recommandations)
      setUnreadCount(donnees.unreadCount)
    })
  }

  useEffect(function () {
    // on ne fait l appel API que si c est bien un student, mais le hook lui-meme est TOUJOURS declare
    if (role === 'student') {
      chargerLesRecommandations()
    }
  }, [role])

  async function toggleDropdown() {
    const nouvelEtat = !ouvert
    setOuvert(nouvelEtat)

    if (nouvelEtat === true && unreadCount > 0) {
      await marquerRecommandationsLues()
      setUnreadCount(0)
    }
  }

  function rafraichir() {
    chargerLesRecommandations()
  }

  // le return conditionnel vient APRES tous les hooks, jamais avant
  if (role !== 'student') {
    return null
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={toggleDropdown}
        className="relative bg-slate-800 border border-slate-700 w-11 h-11 rounded-full flex items-center justify-center text-xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {ouvert && (
        <RecommendationDropdown recommandations={recommandations} onRefresh={rafraichir} />
      )}
    </div>
  )
}

export default RecommendationBell