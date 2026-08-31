import axios from 'axios'

// envoie un message au chatbot et renvoie sa reponse
export async function envoyerMessageAuChatbot(message) {
  const token = localStorage.getItem('token')

  const reponse = await axios.post(
    'http://localhost:5000/api/chat',
    { message: message },
    { headers: { Authorization: 'Bearer ' + token } }
  )

  return reponse.data.reply
}