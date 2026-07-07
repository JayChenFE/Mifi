import { ref, type Ref } from 'vue'

interface UseRequestReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: (...args: any[]) => Promise<T | null>
}

export function useRequest<T = any>(
  fn: (...args: any[]) => Promise<T>,
): UseRequestReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (...args: any[]): Promise<T | null> => {
    loading.value = true
    error.value = null
    try {
      const result = await fn(...args)
      data.value = result
      return result
    } catch (e: any) {
      error.value = e?.message || '请求失败'
      return null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
