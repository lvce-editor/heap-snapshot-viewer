import { bundleJs } from '@lvce-editor/package-extension'
import fs from 'node:fs'
import { join } from 'node:path'
import { root } from './root.js'

const extension = join(root, 'packages', 'extension')
const outDir = join(extension, 'dist')

fs.rmSync(outDir, { recursive: true, force: true })

await bundleJs(join(extension, 'src', 'heapSnapshotViewerMain.ts'), join(outDir, 'heapSnapshotViewerMain.js'))
