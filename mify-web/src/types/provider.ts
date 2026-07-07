export type ProviderType = 'OpenAI' | 'Claude' | 'Gemini' | 'Ollama'

export interface Provider {
  id: number
  name: string
  type: ProviderType
  apiKey: string
  baseUrl: string
  enabled: boolean
  createdAt: string
}
