export default function useCurrentStudent() {
  const lastName = localStorage.getItem('lastName')
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('userId')

  return {
    lastName: lastName,
    role: role,
    userId: userId,
  }
}