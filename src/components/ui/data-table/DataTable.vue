<script setup lang="ts">
import { ref } from "vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

interface Props {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(["search", "paginate", "sort", "view", "edit", "toggle-status"]);

const searchQuery = ref("");

const handleSearch = () => {
  emit("search", searchQuery.value);
};

const onPaginate = (page: string | number) => {
  emit("paginate", page);
};

const onSort = (key: string) => {
  emit("sort", key);
};
</script>

<template>
  <div class="space-y-3 w-full flex-1 flex flex-col overflow-hidden">
    <!-- Toolbar: search + actions -->
    <div class="flex items-center justify-between gap-3">
      <div class="relative w-full max-w-xs">
        <Input
          v-model="searchQuery"
          placeholder="Pesquisar..."
          class="h-10 px-4 text-sm bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-primary/20 transition-all shadow-inner"
          @input="handleSearch"
        />
      </div>
      <slot name="actions" />
    </div>

    <!-- Table container with fixed height scroll support -->
    <div
      class="rounded-2xl border border-slate-200 bg-white overflow-hidden flex-1 flex flex-col shadow-sm max-h-[calc(100vh-280px)] min-h-[300px]"
    >
      <div
        class="overflow-auto scrollbar-thin scrollbar-thumb-slate-200 flex-1"
      >
        <Table class="relative w-full">
          <TableHeader class="sticky top-0 z-10 bg-slate-50 shadow-sm">
            <TableRow class="hover:bg-slate-50 border-b">
              <TableHead
                v-for="col in columns"
                :key="col.key"
                :class="
                  cn(
                    'h-9 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500',
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left',
                    col.sortable &&
                      'cursor-pointer select-none hover:text-slate-700 transition-colors',
                  )
                "
                @click="col.sortable && onSort(col.key)"
              >
                <div
                  :class="
                    cn(
                      'flex items-center gap-1',
                      col.align === 'center'
                        ? 'justify-center'
                        : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start',
                    )
                  "
                >
                  {{ col.label }}
                  <ArrowUpDown v-if="col.sortable" class="h-3 w-3 opacity-40" />
                </div>
              </TableHead>
              <TableHead
                class="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[72px]"
              >
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <!-- Loading state -->
            <template v-if="loading">
              <TableRow class="hover:bg-transparent">
                <TableCell
                  :colspan="columns.length + 1"
                  class="h-32 text-center"
                >
                  <div class="flex flex-col items-center justify-center gap-2">
                    <LoadingSpinner size="md" />
                    <span class="text-sm text-muted-foreground"
                      >Carregando dados...</span
                    >
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Empty state -->
            <template v-else-if="data.length === 0">
              <TableRow class="hover:bg-transparent">
                <TableCell
                  :colspan="columns.length + 1"
                  class="h-32 text-center text-sm text-muted-foreground"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            </template>

            <!-- Data rows -->
            <template v-else>
              <TableRow
                v-for="(item, index) in data"
                :key="item.id || index"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <TableCell
                  v-for="col in columns"
                  :key="col.key"
                  :class="
                    cn(
                      'py-2 px-4 text-sm text-slate-700',
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                          ? 'text-right'
                          : 'text-left',
                    )
                  "
                >
                  <slot :name="`cell-${col.key}`" :item="item">
                    {{ item[col.key] }}
                  </slot>
                </TableCell>

                <!-- Actions cell -->
                <TableCell class="py-2 px-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 rounded-md data-[state=open]:bg-slate-100"
                      >
                        <span class="sr-only">Abrir menu</span>
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-36">
                      <DropdownMenuLabel
                        class="text-[11px] text-muted-foreground font-medium py-1"
                      >
                        Ações
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        class="text-sm cursor-pointer"
                        @click="emit('view', item)"
                      >
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="text-sm cursor-pointer"
                        @click="emit('edit', item)"
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="text-sm cursor-pointer"
                        :class="item.status === 'Ativo' || item.status === 'A'
                          ? 'text-destructive focus:text-destructive focus:bg-destructive/10'
                          : 'text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50'"
                        @click="emit('toggle-status', item)"
                      >
                        {{ item.status === 'Ativo' || item.status === 'A' ? 'Inativar' : 'Ativar' }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination" class="flex items-center justify-between px-1 pt-1">
      <p class="text-xs text-muted-foreground">
        Mostrando
        <span class="font-medium">{{
          (pagination.current_page - 1) * pagination.per_page + 1
        }}</span
        >–<span class="font-medium">{{
          Math.min(
            pagination.current_page * pagination.per_page,
            pagination.total,
          )
        }}</span>
        de <span class="font-medium">{{ pagination.total }}</span> registros
      </p>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          class="hidden lg:flex"
          :disabled="pagination.current_page === 1"
          @click="onPaginate(1)"
        >
          <ChevronsLeft class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="pagination.current_page === 1"
          @click="onPaginate(pagination.current_page - 1)"
        >
          <ChevronLeft class="h-3.5 w-3.5" />
        </Button>
        <span class="text-xs font-medium px-2 text-slate-600">
          {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="pagination.current_page === pagination.last_page"
          @click="onPaginate(pagination.current_page + 1)"
        >
          <ChevronRight class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          class="hidden lg:flex"
          :disabled="pagination.current_page === pagination.last_page"
          @click="onPaginate(pagination.last_page)"
        >
          <ChevronsRight class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>
