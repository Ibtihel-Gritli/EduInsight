// ============================================================
// src/components/recommendations/RecommendationDropdown.jsx
// Liste des recommandations, avec un bouton pour rafraichir
// ============================================================

function RecommendationDropdown({ recommandations, onRefresh }) {
  return (
    <div className="absolute top-14 right-0 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">

      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <p className="text-white font-medium">Course recommendations</p>
        <button onClick={onRefresh} className="text-slate-400 hover:text-cyan-400 text-lg">
          🔄
        </button>
      </div>

      {recommandations.length === 0 ? (
        <p className="p-4 text-sm text-slate-400">Aucune recommandation pour le moment.</p>
      ) : (
        recommandations.map(function (reco) {
          return (
            <div key={reco._id} className="p-4 border-b border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <p className="text-white font-medium text-sm">
                  ⭐ {reco.course ? reco.course.title : 'Cours supprime'}
                </p>
                <span className="text-cyan-400 text-sm font-semibold">
                  {reco.confidenceScore}%
                </span>
              </div>
              <p className="text-slate-400 text-xs">{reco.message}</p>
            </div>
          )
        })
      )}
    </div>
  )
}

export default RecommendationDropdown