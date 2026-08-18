export class HeapSnapshotValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HeapSnapshotValidationError'
  }
}
