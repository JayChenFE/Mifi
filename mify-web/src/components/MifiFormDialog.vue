<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :label-width="labelWidth"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        v-for="field in fields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
        :rules="field.rules"
      >
        <el-input
          v-if="field.type === 'input' || !field.type"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
        />
        <el-input
          v-else-if="field.type === 'password'"
          v-model="formData[field.prop]"
          type="password"
          show-password
          :placeholder="field.placeholder"
        />
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          style="width: 100%"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          style="width: 100%"
        >
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-switch
          v-else-if="field.type === 'switch'"
          v-model="formData[field.prop]"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormItemRule } from 'element-plus'

export interface FormField {
  prop: string
  label: string
  type?: 'input' | 'number' | 'password' | 'select' | 'switch'
  placeholder?: string
  rules?: FormItemRule[]
  options?: { label: string; value: any }[]
}

interface Props {
  fields: FormField[]
  title?: string
  width?: string
  labelWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单',
  width: '560px',
  labelWidth: '100px',
})

const emit = defineEmits<{
  submit: [data: Record<string, any>, done: () => void]
}>()

const visible = defineModel<boolean>({ default: false })
const formRef = ref<FormInstance>()
const submitting = ref(false)

const initialForm = () => {
  const data: Record<string, any> = {}
  props.fields.forEach((f) => {
    data[f.prop] = f.type === 'switch' ? false : ''
  })
  return data
}

const formData = reactive<Record<string, any>>(initialForm())

function open(data?: Record<string, any>) {
  if (data) {
    Object.keys(data).forEach((key) => {
      if (key in formData) {
        formData[key] = data[key]
      }
    })
  }
  visible.value = true
}

function handleClosed() {
  formRef.value?.resetFields()
  Object.assign(formData, initialForm())
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    emit('submit', { ...formData }, () => {
      submitting.value = false
      visible.value = false
    })
  } catch {
    submitting.value = false
  }
}

const title = computed(() => props.title)

defineExpose({ open })
</script>
