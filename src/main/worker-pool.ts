import {
  TaskMessage,
  TaskResult,
  TaskId,
} from '../common'

const workerCode = '<WORKER_CODE>'
const workerBlob = new Blob([workerCode], { type: 'application/javascript' })

class WorkerPool {
  #workerToTaskId: Map<Worker, number | null>
  #taskIdToWorker: Map<number, Worker>
  #timeoutId: number | null
  #maxIdleTime: number | null

  constructor() {
    this.#workerToTaskId = new Map()
    this.#taskIdToWorker = new Map()
    this.#timeoutId = null
    this.#maxIdleTime = null
  }

  #clearTimeout() {
    if (this.#timeoutId === null) return undefined
    clearTimeout(this.#timeoutId)
    this.#timeoutId = null
  }

  prepare(
    onmessage: (event: MessageEvent<TaskResult>) => void,
    maxSize: number,
    maxIdleTime: number,
  ) {
    if (this.#workerToTaskId.size) return undefined

    this.#maxIdleTime = maxIdleTime

    const workerUrl = URL.createObjectURL(workerBlob)

    while (this.#workerToTaskId.size < maxSize) {
      const worker = new Worker(workerUrl)
      worker.onmessage = onmessage
      this.#workerToTaskId.set(worker, null)
    }

    URL.revokeObjectURL(workerUrl)
  }

  assignTask(
    worker: Worker,
    taskId: TaskId,
    taskMessage: TaskMessage,
    transfer: Transferable[],
  ) {
    this.#workerToTaskId.set(worker, taskId)
    this.#taskIdToWorker.set(taskId, worker)
    this.#clearTimeout()
    worker.postMessage(taskMessage, transfer)
  }

  setTimeout() {
    if (this.#timeoutId !== null) return undefined

    this.#timeoutId = setTimeout(() => {
      for (const worker of this.#workerToTaskId.keys()) {
        worker.terminate()
      }

      this.#workerToTaskId.clear()
      this.#taskIdToWorker.clear()
    }, this.#maxIdleTime || 0)
  }

  getAvailableWorkers() {
    const availableWorkers: Worker[] = []

    for (const [worker, taskId] of this.#workerToTaskId.entries()) {
      if (taskId === null) availableWorkers.push(worker)
    }

    return availableWorkers
  }

  removeTask(taskId: number) {
    const worker = this.#taskIdToWorker.get(taskId)
    if (worker) this.#workerToTaskId.set(worker, null)
    this.#taskIdToWorker.delete(taskId)
  }
}

export const workerPool = new WorkerPool()