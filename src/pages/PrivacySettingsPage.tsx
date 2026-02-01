import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';

export default function PrivacySettingsPage() {
  const {
    storageStats,
    loadStorageStats,
    exportAllData,
    deleteAllData
  } = useAppStore();

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

  const showNotification = (type: 'success' | 'error', message: string) => {
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
      showNotification('success', '数据导出成功');
    } catch (error) {
      showNotification('error', '导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteType) return;
    
    setIsDeleting(true);
    try {
      await deleteAllData();
      showNotification('success', deleteType === 'all' ? '所有数据已删除' : '情绪记录已删除');
      setShowConfirm(false);
      setDeleteType(null);
    } catch (error) {
      showNotification('error', '删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          隐私与数据管理
        </h1>

        {/* 通知提示 */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* 存储统计 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            存储使用情况
          </h2>
          
          {storageStats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">情绪记录</span>
                <span className="font-medium">{storageStats.emotionCount} 条</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">对话历史</span>
                <span className="font-medium">{storageStats.chatCount} 条</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总存储空间</span>
                <span className="font-medium">{storageStats.storageSize}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">加载中...</p>
          )}
        </div>

        {/* 数据导出 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            数据导出
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            将所有数据导出为 JSON 文件，包括情绪记录、对话历史和偏好设置。
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium
                       hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isExporting ? '导出中...' : '导出所有数据'}
          </button>
        </div>

        {/* 数据删除 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            数据删除
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            永久删除本地存储的数据。此操作无法撤销。
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setDeleteType('emotions');
                setShowConfirm(true);
              }}
              className="w-full py-3 border border-red-200 text-red-600 rounded-lg
                         hover:bg-red-50 transition-colors"
            >
              删除情绪记录
            </button>
            
            <button
              onClick={() => {
                setDeleteType('all');
                setShowConfirm(true);
              }}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-medium
                         hover:bg-red-600 transition-colors"
            >
              删除所有数据
            </button>
          </div>
        </div>

        {/* 隐私说明 */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-medium text-blue-800 mb-2">
            您的数据安全
          </h3>
          <p className="text-sm text-blue-700">
            所有数据都存储在您的浏览器本地，不会上传到任何服务器。
            请定期导出备份以确保数据安全。
          </p>
        </div>

        {/* 确认弹窗 */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                确认删除
              </h3>
              <p className="text-gray-600 text-sm mb-6">
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
                  className="flex-1 py-2 border border-gray-200 text-gray-600
                             rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg
                             hover:bg-red-600 disabled:opacity-50"
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
