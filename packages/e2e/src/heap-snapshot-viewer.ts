import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer'

const heapSnapshot = JSON.stringify({
  edges: [2, 3, 7, 2, 4, 14],
  nodes: [9, 0, 1, 0, 2, 0, 0, 3, 1, 2, 5, 0, 0, 0, 3, 2, 3, 3, 0, 0, 0],
  snapshot: {
    meta: {
      edge_fields: ['type', 'name_or_index', 'to_node'],
      edge_types: [['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak']],
      node_fields: ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness'],
      node_types: [
        [
          'hidden',
          'array',
          'string',
          'object',
          'code',
          'closure',
          'regexp',
          'number',
          'native',
          'synthetic',
          'concatenated string',
          'sliced string',
          'symbol',
          'bigint',
          'object shape',
        ],
      ],
    },
  },
  strings: ['(GC roots)', 'Widget', 'Controller', 'widget', 'controller'],
})

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.heapsnapshot`, heapSnapshot)
  await Workspace.setPath(tmpDir)

  await Main.openUri(`${tmpDir}/test.heapsnapshot`)

  const view = Locator('.HeapSnapshotView')
  await expect(view).toBeVisible()
  const constructors = Locator('.ClassName')
  await expect(constructors).toHaveCount(2)
  await expect(constructors.nth(0)).toHaveText('Widget')
  await expect(constructors.nth(1)).toHaveText('Controller')

  const filterInput = Locator('.FilterInputWrapper > .FilterInput')
  await filterInput.type('controller')
  await expect(filterInput).toHaveValue('controller')
  await new Promise((resolve) => setTimeout(resolve, 100))

  const filteredConstructors = Locator('.ClassName')
  await expect(filteredConstructors).toHaveCount(1)
  await expect(filteredConstructors).toHaveText('Controller')
}
