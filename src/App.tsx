import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import InsightPage from './pages/InsightPage'
import SOSEmotionPage from './pages/SOSEmotionPage'
import SOSAnalysisPage from './pages/SOSAnalysisPage'
import SOSCardPage from './pages/SOSCardPage'
import SOSFeedbackPage from './pages/SOSFeedbackPage'
import SOSCelebrationPage from './pages/SOSCelebrationPage'

function App() {
  const location = useLocation()

  return (
    <ErrorBoundary>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HomePage />
              </motion.div>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChatPage />
              </motion.div>
            } 
          />
          <Route 
            path="/insight" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InsightPage />
              </motion.div>
            } 
          />
          {/* SOS急救流程路由 */}
          <Route 
            path="/sos/emotion" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SOSEmotionPage />
              </motion.div>
            } 
          />
          <Route 
            path="/sos/analysis" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SOSAnalysisPage />
              </motion.div>
            } 
          />
          <Route 
            path="/sos/card/:emotionType" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SOSCardPage />
              </motion.div>
            } 
          />
          <Route 
            path="/sos/celebration" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SOSCelebrationPage />
              </motion.div>
            } 
          />
          <Route 
            path="/sos/feedback" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SOSFeedbackPage />
              </motion.div>
            } 
          />
          {/* 其他路由将逐步添加 */}
        </Routes>
        </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
