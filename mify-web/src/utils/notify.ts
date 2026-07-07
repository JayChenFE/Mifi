import { ElMessage } from 'element-plus'

export function notifySuccess(message: string) {
  ElMessage.success(message)
}

export function notifyError(message: string) {
  ElMessage.error(message)
}

export function notifyWarning(message: string) {
  ElMessage.warning(message)
}
