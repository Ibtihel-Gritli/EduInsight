import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

import TeacherCourses from './pages/TeacherCourses'
import TeacherQuizzes from './pages/TeacherQuizzes'
import TeacherStudents from './pages/TeacherStudents'
import TeacherDocs from './pages/TeacherDocs'
import TeacherSettings from './pages/TeacherSettings'

import StudentCourses from './pages/StudentCourses'
import StudentQuizzes from './pages/StudentQuizzes'
import StudentProgress from './pages/StudentProgress'
import StudentCertificates from './pages/StudentCertificates'
import StudentDocs from './pages/StudentDocs'

import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminCourses from './pages/AdminCourses'
import AdminQuizzes from './pages/AdminQuizzes'
import AdminStudents from './pages/AdminStudents'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminDocs from './pages/AdminDocs'
import AdminSettings from './pages/AdminSettings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Header />
            <Home />
            <Footer />
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/docs" element={<TeacherDocs />} />
        <Route path="/teacher/settings" element={<TeacherSettings />} />

        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/quizzes" element={<StudentQuizzes />} />
        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path="/student/docs" element={<StudentDocs />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/quizzes" element={<AdminQuizzes />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/docs" element={<AdminDocs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App