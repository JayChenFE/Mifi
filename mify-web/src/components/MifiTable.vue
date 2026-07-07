<template>
  <div class="mifi-table">
    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
        :formatter="col.formatter"
      >
        <template v-if="col.slot" #default="{ row }">
          <slot :name="col.slot" :row="row" />
        </template>
      </el-table-column>
    </el-table>

    <div v-if="showPagination" class="mifi-table__pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'

export interface ColumnConfig {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  slot?: string
}

interface Props {
  columns: ColumnConfig[]
  api: (params: Record<string, any>) => Promise<{ list: any[]; total: number }>
  showPagination?: boolean
  defaultPageSize?: number
  extraParams?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  showPagination: true,
  defaultPageSize: 20,
  extraParams: () => ({}),
})

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(props.defaultPageSize)

async function fetchData() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...props.extraParams,
    }
    const res = await props.api(params)
    list.value = res.list ?? []
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

function refresh() {
  page.value = 1
  fetchData()
}

watch(
  () => props.extraParams,
  () => refresh(),
  { deep: true },
)

onMounted(() => {
  fetchData()
})

defineExpose({ refresh, fetchData })
</script>

<style scoped>
.mifi-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-4);
}
</style>
