<template>
  <div class="provider-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">模型提供商管理</h1>
        <p class="page-desc">管理 OpenAI、Claude、Gemini、Ollama 等 LLM Provider 及模型配置</p>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增提供商
      </el-button>
    </div>

    <!-- Table -->
    <MifiTable
      ref="tableRef"
      :columns="columns"
      :api="fetchList"
      :show-pagination="false"
    >
      <template #type="{ row }">
        <el-tag :type="typeTagTheme(row.type)">{{ row.type }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.enabled ? 'success' : 'info'">
          {{ row.enabled ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
      </template>
    </MifiTable>

    <!-- Form Dialog -->
    <MifiFormDialog
      v-model="dialogVisible"
      ref="dialogRef"
      :fields="formFields"
      :title="editingId ? '编辑提供商' : '新增提供商'"
      width="520px"
      label-width="80px"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Provider, ProviderType } from '@/types/provider'
import MifiTable, { type ColumnConfig } from '@/components/MifiTable.vue'
import MifiFormDialog, { type FormField } from '@/components/MifiFormDialog.vue'
import { useConfirm } from '@/composables/useConfirm'
import { notifySuccess } from '@/utils/notify'

// ---- Mock Data ----
const mockProviders: Provider[] = [
  { id: 1, name: 'OpenAI', type: 'OpenAI', apiKey: 'sk-***', baseUrl: 'https://api.openai.com/v1', enabled: true, createdAt: '2026-01-15 10:30:00' },
  { id: 2, name: 'Claude', type: 'Claude', apiKey: 'sk-***', baseUrl: 'https://api.anthropic.com', enabled: true, createdAt: '2026-02-20 14:00:00' },
  { id: 3, name: 'Gemini Pro', type: 'Gemini', apiKey: '***', baseUrl: 'https://generativelanguage.googleapis.com', enabled: false, createdAt: '2026-03-10 09:15:00' },
  { id: 4, name: 'Local Llama', type: 'Ollama', apiKey: '', baseUrl: 'http://localhost:11434', enabled: true, createdAt: '2026-05-01 16:45:00' },
]

// ---- Table ----
const columns: ColumnConfig[] = [
  { prop: 'name', label: '名称', minWidth: 140 },
  { prop: 'type', label: '类型', width: 100, slot: 'type' },
  { prop: 'baseUrl', label: 'Base URL', minWidth: 220 },
  { prop: 'enabled', label: '状态', width: 80, slot: 'status' },
  { prop: 'createdAt', label: '创建时间', width: 170 },
  { prop: 'action', label: '操作', width: 150, slot: 'action' },
]

const tableRef = ref<InstanceType<typeof MifiTable>>()

function typeTagTheme(type: ProviderType): '' | 'primary' | 'warning' | 'success' {
  const map: Record<ProviderType, '' | 'primary' | 'warning' | 'success'> = {
    OpenAI: 'primary',
    Claude: 'warning',
    Gemini: '',
    Ollama: 'success',
  }
  return map[type]
}

function fetchList() {
  return Promise.resolve({ list: mockProviders, total: mockProviders.length })
}

// ---- Form Dialog ----
const dialogVisible = ref(false)
const dialogRef = ref<InstanceType<typeof MifiFormDialog>>()
const editingId = ref<number | null>(null)

const formFields: FormField[] = [
  { prop: 'name', label: '名称', rules: [{ required: true, message: '请输入名称' }] },
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    rules: [{ required: true, message: '请选择类型' }],
    options: [
      { label: 'OpenAI', value: 'OpenAI' },
      { label: 'Claude', value: 'Claude' },
      { label: 'Gemini', value: 'Gemini' },
      { label: 'Ollama', value: 'Ollama' },
    ],
  },
  { prop: 'apiKey', label: 'API Key', type: 'password', placeholder: '请输入 API Key' },
  { prop: 'baseUrl', label: 'Base URL', placeholder: 'https://api.openai.com/v1' },
]

function handleCreate() {
  editingId.value = null
  dialogRef.value?.open()
}

function handleEdit(row: Provider) {
  editingId.value = row.id
  dialogRef.value?.open({
    name: row.name,
    type: row.type,
    apiKey: row.apiKey,
    baseUrl: row.baseUrl,
  })
}

function handleSubmit(data: Record<string, any>, done: () => void) {
  if (editingId.value) {
    const provider = mockProviders.find((p) => p.id === editingId.value)
    if (provider) Object.assign(provider, { name: data.name, type: data.type, apiKey: data.apiKey, baseUrl: data.baseUrl })
    notifySuccess('编辑成功')
  } else {
    mockProviders.push({
      id: Date.now(),
      name: data.name,
      type: data.type as ProviderType,
      apiKey: data.apiKey || '',
      baseUrl: data.baseUrl || '',
      enabled: true,
      createdAt: new Date().toLocaleString('zh-CN'),
    })
    notifySuccess('新增成功')
  }
  tableRef.value?.refresh()
  done()
}

// ---- Delete ----
const { confirm: confirmDelete } = useConfirm<number>(
  '确定删除该提供商？此操作不可恢复。',
  (id) => {
    const idx = mockProviders.findIndex((p) => p.id === id)
    if (idx > -1) mockProviders.splice(idx, 1)
    tableRef.value?.refresh()
    return Promise.resolve()
  },
  '删除成功',
)

function handleDelete(row: Provider) {
  confirmDelete(row.id)
}
</script>

<style scoped>
.provider-page {
  max-width: var(--container-max);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.page-desc {
  margin-top: var(--space-1);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

/* 表格行高 */
.provider-page :deep(.el-table__body .el-table__row td) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.provider-page :deep(.el-table__header th) {
  padding-top: 10px;
  padding-bottom: 10px;
}

/* 操作列按钮间距 */
.provider-page :deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>
