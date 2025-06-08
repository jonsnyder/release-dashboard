import { Routes, Route } from 'react-router-dom'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import HomePage from './pages/HomePage'
import RepoPage from './pages/RepoPage'
import AuthCallback from './pages/AuthCallback'
import './App.css'

function App() {
  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/repo" element={<RepoPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </div>
    </Provider>
  )
}

export default App
