import { ElMessageBox } from 'element-plus'
import { notifySuccess } from '@/utils/notify'

export function useConfirm<T = any>(
  message: string,
  apiFn: (id: T) => Promise<any>,
  successMsg = '操作成功',
) {
  async function confirm(id: T): Promise<boolean> {
    try {
      await ElMessageBox.confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      await apiFn(id)
      notifySuccess(successMsg)
      return true
    } catch {
      return false
    }
  }

  return { confirm }
}
