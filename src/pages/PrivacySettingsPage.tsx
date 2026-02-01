import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useChatStore } from '../store/chatStore';
import { motion } from 'framer-motion';

export default function PrivacySettingsPage() {
  const {
    storageStats,
    loadStorageStats,
    exportAllData,
    deleteAllData
  } = useAppStore();
  
  // 从 chatStore 获取对话数量（实际存储的位置）
  const conversations = useChatStore(state => state.conversations);
  const chatCount = conversations.length;

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'all' | 'emotions' | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadStorageStats();
  }, [loadStorageStats]);

  const showNotificationFn = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindspace-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotificationFn('success', '数据导出成功');
    } catch (error) {
      showNotificationFn('error', '导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteType) return;
    
    setIsDeleting(true);
    try {
      await deleteAllData();
      showNotificationFn('success', deleteType === 'all' ? '所有数据已删除' : '情绪记录已删除');
      setShowConfirm(false);
      setDeleteType(null);
    } catch (error) {
      showNotificationFn('error', '删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 transition-colors" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          隐私与数据管理
        </h1>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <div className="rounded-xl shadow-sm p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            存储使用情况
          </h2>
          
          {storageStats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>情绪记录</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{storageStats.emotionCount} 条</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>对话历史</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{chatCount} 条</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>总存储空间</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{storageStats.storageSize}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-tertiary)' }}>加载中...</p>
          )}
        </div>

        <div className="rounded-xl shadow-sm p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            数据导出
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            将所有数据导出为 JSON 文件，包括情绪记录、对话历史和偏好设置。
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 text-white rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isExporting ? '导出中...' : '导出所有数据'}
          </button>
        </div>

        <div className="rounded-xl shadow-sm p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            数据删除
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            永久删除本地存储的数据。此操作无法撤销。
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setDeleteType('emotions')
                setShowConfirm(true)
              }}
              className="w-full py-3 rounded-lg transition-colors"
              style={{ 
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                border: '1px solid'
              }}
            >
              删除情绪记录
            </button>
            
            <button
              onClick={() => {
                setDeleteType('all')
                setShowConfirm(true)
              }}
              className="w-full py-3 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#EF4444' }}
            >
              删除所有数据
            </button>
          </div>
        </div>

        <div className="rounded-xl p-6 transition-colors" style={{ backgroundColor: 'var(--accent-light)' }}>
          <h3 className="font-medium mb-2" style={{ color: 'var(--accent)' }}>
            数据存储说明
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            数据存储在当前浏览器的本地存储空间中。请定期导出备份，以防数据丢失。
          </p>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="rounded-xl p-6 max-w-sm w-full transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                确认删除
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                {deleteType === 'all'
                  ? '确定要删除所有数据吗？此操作无法撤销。'
                  : '确定要删除所有情绪记录吗？此操作无法撤销。'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setDeleteType(null);
                  }}
                  className="flex-1 py-2 rounded-lg transition-colors"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    border: '1px solid'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
