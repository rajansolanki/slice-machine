import Store from 'lib/models/ui/Store'
import { Widget } from '../../../lib/models/common/widgets'
import { GroupWidget, GroupAsArray } from '../../../lib/models/common/CustomType/group'
import Actions, { updateWidgetMockConfig, deleteWidgetMockConfig } from './actions'

export default class CustomTypeStore implements Store {
  constructor(readonly dispatch: ({ type, payload }: { type: string, payload?: any }) => void) {}

  test() {
    this.dispatch({ type: Actions.Test })
  }
  reset() {
    this.dispatch({ type: Actions.Reset })
  }
  tab(tabId: string) {
    return {
      addWidget: (id: string, widget: Widget | GroupWidget) => {
        this.dispatch({ type: Actions.AddWidget, payload: { tabId, id, widget } })
      },
      removeWidget: (id: string) => {
        this.dispatch({ type: Actions.RemoveWidget, payload: { tabId, id } })
      },
      replaceWidget: (previousKey: string, newKey: string, value: Widget | GroupAsArray) => {
        this.dispatch({ type: Actions.ReplaceWidget, payload: { tabId, previousKey, newKey, value } }) 
      },
      reorderWidget: (start: number, end: number) => {
        this.dispatch({ type: Actions.ReorderWidget, payload: { tabId, start, end }})
      },
      updateWidgetMockConfig: updateWidgetMockConfig(this.dispatch)(),
      deleteWidgetMockConfig: deleteWidgetMockConfig(this.dispatch)(),
      createSliceZone: () => {
        this.dispatch({ type: Actions.CreateSliceZone, payload: { tabId } })
      },
      deleteSliceZone: () => {
        this.dispatch({ type: Actions.DeleteSliceZone, payload: { tabId } })
      }
    }
  }

}