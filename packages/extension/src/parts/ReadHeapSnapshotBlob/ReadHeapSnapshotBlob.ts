import { readFile, readFileAsBlob } from '@lvce-editor/api'

export const readHeapSnapshotBlob = async (uri: string): Promise<Blob> => {
  try {
    return await readFileAsBlob(uri)
  } catch {
    return new Blob([await readFile(uri)])
  }
}
