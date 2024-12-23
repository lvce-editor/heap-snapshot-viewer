import { replace } from '@lvce-editor/package-extension'
import { cp, readFile, writeFile } from 'node:fs/promises'
import path, { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from './root.js'

await import('./build.js')

await cp(path.join(root, 'dist'), path.join(root, 'dist2'), {
  recursive: true,
  force: true,
})

const sharedProcessPath = join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'shared-process', 'index.js')
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

await replace({
  path: path.join(root, 'dist', commitHash, 'config', 'webExtensions.json'),
  occurrence: 'src/heapSnapshotViewerMain.ts',
  replacement: 'dist/heapSnapshotViewerMain.js',
})

const pathPrefix = '/heap-snapshot-viewer'
const webViewsPath = join(root, 'dist', commitHash, 'config', 'webViews.json')
const extensionJsonPath = join(root, 'dist', commitHash, 'extensions', 'builtin.heap-snapshot-viewer', 'extension.json')
const extensionJsonContent = await readFile(extensionJsonPath, 'utf8')
const extensionJson = JSON.parse(extensionJsonContent)
extensionJson.webViews[0].path = `${commitHash}/extensions/${extensionJson.id}/${extensionJson.webViews[0].path}`
extensionJson.webViews[0].remotePath = `${pathPrefix}/${commitHash}/extensions/${extensionJson.id}`
await writeFile(webViewsPath, JSON.stringify(extensionJson.webViews, null, 2) + '\n')
