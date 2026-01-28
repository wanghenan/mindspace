/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHSCOPE_API_KEY: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_OPENAI_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
