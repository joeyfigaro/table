import {
  createTable,
  RowData,
  Table,
  TableOptions,
  TableOptionsResolved,
  TableState,
} from '@tanstack/table-core'
import { ReactiveController, ReactiveControllerHost } from 'lit'

export * from '@tanstack/table-core'

export function flexRender<TProps>(
  Comp: ((props: TProps) => string) | string | undefined,
  props: TProps
): string | null {
  if (!Comp) return null

  if (typeof Comp === 'function') {
    return Comp(props)
  }

  return Comp
}

export class TableController<TData extends RowData> implements ReactiveController {
  host: ReactiveControllerHost

  private table: Table<TData> | null = null

  private _tableState: TableState | null = null

  constructor(host: ReactiveControllerHost) {
    ;(this.host = host).addController(this)
  }

  public getTable(options: TableOptions<TData>) {
    if (!this.table) {
      const resolvedOptions: TableOptionsResolved<TData> = {
        state: {},
        onStateChange: () => {}, // noop
        renderFallbackValue: null,
        ...options,
      }

      this.table = createTable(resolvedOptions)
      this._tableState = { ...this.table.initialState, ...options.state }
    }

    this.table.setOptions(prev => ({
      ...prev,
      state: { ...this._tableState, ...options.state },
      onStateChange: (updater: any) => {
        this._tableState = updater(this._tableState)
        this.host.requestUpdate()
        options.onStateChange?.(updater)
      },
    }))

    return this.table
  }

  hostDisconnected() {}
}
