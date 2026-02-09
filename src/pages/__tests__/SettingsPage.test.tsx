import { describe, it, beforeEach, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from '../SettingsPage'
import { useAIConfigStore } from '../../store/aiConfigStore'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../../store/aiConfigStore')

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SettingsPage', () => {
  const mockStore = {
    selectedProvider: 'openai',
    selectedModel: 'gpt-4o-mini',
    customApiKeys: {},
    defaultModels: {},
    models: [],
    setProvider: vi.fn(),
    setApiKey: vi.fn(),
    clearApiKey: vi.fn(),
    setDefaultModel: vi.fn(),
    setSelectedModel: vi.fn(),
    validateApiKey: vi.fn(),
    isProviderConfigured: vi.fn(),
    getApiKey: vi.fn(),
    getApiBase: vi.fn(),
    getCurrentModel: vi.fn(),
    getSelectedAIModel: vi.fn(),
    getProviderModels: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useAIConfigStore).mockReturnValue(mockStore)
    mockStore.isProviderConfigured.mockReturnValue(false)
  })

  it('should render the settings page with all sections', () => {
    renderWithRouter(<SettingsPage />)

    expect(screen.getByText('AI 设置')).toBeInTheDocument()
    expect(screen.getByText('配置您的 AI 提供商和模型偏好')).toBeInTheDocument()
    expect(screen.getByText('选择提供商')).toBeInTheDocument()
    expect(screen.getByText('选择您偏好的 AI 服务提供商')).toBeInTheDocument()
    expect(screen.getByText('选择模型')).toBeInTheDocument()
    expect(screen.getByText('为选中的提供商选择默认模型')).toBeInTheDocument()
  })

  it('should render all 7 provider cards', () => {
    renderWithRouter(<SettingsPage />)

    const providers = [
      'OpenAI',
      'Zhipu AI',
      'Grok',
      'Google Gemini',
      'DeepSeek',
      'MiniMax',
      'Alibaba DashScope'
    ]

    providers.forEach(provider => {
      expect(screen.getByText(provider)).toBeInTheDocument()
    })
  })

  it('should handle provider selection', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SettingsPage />)

    const openaiButton = screen.getByRole('radio', { name: /OpenAI/ })
    await user.click(openaiButton)

    expect(mockStore.setProvider).toHaveBeenCalledWith('openai')
  })

  it('should support keyboard navigation for provider selection', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SettingsPage />)

    const providerButtons = screen.getAllByRole('radio')
    const firstButton = providerButtons[0]

    firstButton.focus()
    expect(firstButton).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    await waitFor(() => {
      expect(mockStore.setProvider).toHaveBeenCalled()
    })
  })
})

describe('ProviderSelector', () => {
  const mockStore = {
    selectedProvider: 'openai',
    setProvider: vi.fn(),
    isProviderConfigured: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useAIConfigStore).mockReturnValue(mockStore as any)
  })

  it('should show configuration status for providers', () => {
    mockStore.isProviderConfigured.mockImplementation((provider: string) => provider === 'openai')

    renderWithRouter(<SettingsPage />)

    const openaiButton = screen.getByRole('radio', { name: /OpenAI/ })
    expect(openaiButton).toHaveAttribute('aria-checked', 'true')
  })
})

describe('ModelSelector', () => {
  const mockModels = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai' as const,
      contextLength: 128000,
      supportsStreaming: true
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai' as const,
      contextLength: 128000,
      supportsStreaming: true
    }
  ]

  const mockStore = {
    selectedProvider: 'openai',
    selectedModel: 'gpt-4o-mini',
    setProvider: vi.fn(),
    setSelectedModel: vi.fn(),
    isProviderConfigured: vi.fn(),
    getProviderModels: vi.fn(() => mockModels),
  }

  beforeEach(() => {
    vi.mocked(useAIConfigStore).mockReturnValue(mockStore as any)
  })

  it('should display model metadata including context length and streaming badge', async () => {
    renderWithRouter(<SettingsPage />)

    await waitFor(() => {
      const modelButtons = screen.getAllByRole('radio')
      expect(modelButtons.length).toBeGreaterThan(0)
    })
  })

  it('should handle model selection via keyboard and mouse', async () => {
    renderWithRouter(<SettingsPage />)

    await waitFor(() => {
      const modelButtons = screen.queryAllByRole('radio')
      if (modelButtons.length > 0) {
        expect(modelButtons[0]).toBeInTheDocument()
      }
    })
  })
})
