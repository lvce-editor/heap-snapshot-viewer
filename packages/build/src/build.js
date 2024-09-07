import { packageExtension, bundleJs, replace } from '@lvce-editor/package-extension'
import fs, { readFileSync } from 'node:fs'
import path, { join } from 'node:path'
import { root } from './root.js'

const extension = path.join(root, 'packages', 'extension')
const heapSnapshotWorker = path.join(root, 'packages', 'heap-snapshot-worker')

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

fs.mkdirSync(path.join(root, 'dist'))

const packageJson = JSON.parse(readFileSync(join(extension, 'package.json')).toString())
delete packageJson.xo
delete packageJson.jest
delete packageJson.prettier
delete packageJson.devDependencies

fs.writeFileSync(join(root, 'dist', 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
fs.copyFileSync(join(root, 'README.md'), join(root, 'dist', 'README.md'))
fs.copyFileSync(join(root, 'LICENSE'), join(root, 'dist', 'LICENSE'))
fs.copyFileSync(join(root, 'ThirdPartyNotices.txt'), join(root, 'dist', 'ThirdPartyNotices.txt'))
fs.copyFileSync(join(extension, 'extension.json'), join(root, 'dist', 'extension.json'))
fs.cpSync(join(extension, 'src'), join(root, 'dist', 'src'), {
  recursive: true,
})
fs.cpSync(join(extension, 'media'), join(root, 'dist', 'media'), {
  recursive: true,
})

fs.cpSync(join(heapSnapshotWorker, 'src'), join(root, 'dist', 'heap-snapshot-worker', 'src'), {
  recursive: true,
})

const workerUrlFilePath = path.join(root, 'dist', 'src', 'parts', 'HeapSnapshotWorkerUrl', 'HeapSnapshotWorkerUrl.ts')
await replace({
  path: workerUrlFilePath,
  occurrence: 'src/heapSnapshotWorkerMain.ts',
  replacement: 'dist/heapSnapshotWorkerMain.js',
})

const assetDirPath = path.join(root, 'dist', 'src', 'parts', 'AssetDir', 'AssetDir.ts')
await replace({
  path: assetDirPath,
  occurrence: '../../../../',
  replacement: '../',
})

await replace({
  path: join(root, 'dist', 'extension.json'),
  occurrence: 'src/heapSnapshotViewerMain.ts',
  replacement: 'dist/heapSnapshotViewerMain.js',
})

await bundleJs(
  join(root, 'dist', 'heap-snapshot-worker', 'src', 'heapSnapshotWorkerMain.ts'),
  join(root, 'dist', 'heap-snapshot-worker', 'dist', 'heapSnapshotWorkerMain.js'),
)

await bundleJs(join(root, 'dist', 'src', 'heapSnapshotViewerMain.ts'), join(root, 'dist', 'dist', 'heapSnapshotViewerMain.js'))

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
