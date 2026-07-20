import { cp } from 'node:fs/promises'
import path, { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from './root.js'

await import('./build.js')

await cp(path.join(root, 'dist'), path.join(root, 'dist2'), {
  recursive: true,
  force: true,
})

const sharedProcessPath = join(root, 'node_modules', '@lvce-editor', 'shared-process', 'index.js')
const sharedProcessUri = pathToFileURL(sharedProcessPath).toString()
const { exportStatic } = await import(sharedProcessUri)

const { commitHash } = await exportStatic({
  extensionPath: 'packages/extension',
  root,
})

await cp(path.join(root, 'dist2'), path.join(root, 'dist', commitHash, 'extensions', 'builtin.heap-snapshot-viewer'), {
  recursive: true,
  force: true,
})
