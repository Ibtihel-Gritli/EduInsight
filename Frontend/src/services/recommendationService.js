import axios from 'axios'

export async function getRecommendations() {
  const token = localStorage.getItem('token')
  const reponse = await axios.get(
    'http://localhost:5000/api/recommendations',
    { headers: { Authorization: 'Bearer ' + token } }
  )
  return reponse.data
}

export async function marquerRecommandationsLues() {
  const token = localStorage.getItem('token')
  await axios.patch(
    'http://localhost:5000/api/recommendations/marquer-lues',
    {},
    { headers: { Authorization: 'Bearer ' + token } }
  )
}