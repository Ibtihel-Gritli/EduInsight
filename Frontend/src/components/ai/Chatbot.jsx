// Bouton flottant + fenetre de discussion avec le chatbot

import { useState } from 'react'
import { envoyerMessageAuChatbot } from '../../services/chatService'
import useCurrentStudent from '../../hooks/useCurrentStudent'

function Chatbot() {
  const utilisateur = useCurrentStudent()

  // n affiche le chatbot que si quelqu un est connecte
  if (!utilisateur.userId) {
    return null
  }

  const [ouvert, setOuvert] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Salut ! Je suis l assistant EduInsight. Comment je peux t aider ?' },
  ])
  const [texteSaisi, setTexteSaisi] = useState('')
  const [chargement, setChargement] = useState(false)

  async function envoyerLeMessage(event) {
    event.preventDefault()

    const messageUtilisateur = texteSaisi.trim()
    if (messageUtilisateur === '') {
      return
    }

    // ajoute le message de l utilisateur a la liste, tout de suite
    const nouveauxMessages = messages.concat([{ role: 'user', text: messageUtilisateur }])
    setMessages(nouveauxMessages)
    setTexteSaisi('')
    setChargement(true)

    try {
      const reponse = await envoyerMessageAuChatbot(messageUtilisateur)
      setMessages(nouveauxMessages.concat([{ role: 'assistant', text: reponse }]))
    } catch (err) {
      setMessages(nouveauxMessages.concat([{ role: 'assistant', text: 'Erreur, reessaie plus tard.' }]))
    }

    setChargement(false)
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={function () { setOuvert(!ouvert) }}
        className="fixed bottom-6 right-6 bg-cyan-500 text-slate-950 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-50"
      >
        {ouvert ? '×' : '💬'}
      </button>

      {/* Fenetre de discussion */}
      {ouvert && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex flex-col z-50">

          <div className="p-3 border-b border-slate-700">
            <p className="text-white font-medium text-sm">Assistant EduInsight</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(function (msg, index) {
              const estUtilisateur = msg.role === 'user'
              return (
                <div
                  key={index}
                  className={'max-w-[85%] p-2 rounded-lg text-sm ' +
                    (estUtilisateur
                      ? 'bg-cyan-500 text-slate-950 ml-auto'
                      : 'bg-slate-800 text-white')}
                >
                  {msg.text}
                </div>
              )
            })}

            {chargement && (
              <div className="bg-slate-800 text-slate-400 text-sm p-2 rounded-lg max-w-[85%]">
                En train d ecrire...
              </div>
            )}
          </div>

          <form onSubmit={envoyerLeMessage} className="p-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={texteSaisi}
              onChange={function (event) { setTexteSaisi(event.target.value) }}
              placeholder="Ecris ton message..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
            />
            <button
              type="submit"
              className="bg-cyan-500 text-slate-950 font-semibold px-3 rounded-lg text-sm"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default Chatbot