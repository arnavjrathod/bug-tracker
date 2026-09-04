import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import IssueList from './pages/IssueList'
import IssueDetail from './pages/IssueDetail'
import IssueForm from './pages/IssueForm'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<IssueList />} />
          <Route path="/issues/new" element={<IssueForm />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/issues/:id/edit" element={<IssueForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
