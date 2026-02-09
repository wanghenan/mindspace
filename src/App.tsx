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
import SOSCompletePage from './pages/SOSCompletePage'
import SOSFeedbackPage from './pages/SOSFeedbackPage'
import SOSCelebrationPage from './pages/SOSCelebrationPage'
import PrivacySettingsPage from './pages/PrivacySettingsPage'
import UserProfilePage from './pages/UserProfilePage'
import SettingsPage from './pages/SettingsPage'

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
          {/* 合并后的完成页面（庆祝+反馈） */}
          <Route 
            path="/sos/complete" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SOSCompletePage />
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
          {/* 隐私设置页面 */}
          <Route 
            path="/privacy" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PrivacySettingsPage />
              </motion.div>
            } 
          />
          {/* 用户资料页面 */}
          <Route
            path="/profile"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfilePage />
              </motion.div>
            }
          />
          {/* AI 设置页面 */}
          <Route
            path="/settings"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsPage />
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
