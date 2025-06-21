import { $ } from 'bun'
import { MAIN_FILE_NAME, WORKER_FILE_NAME, DEMO_PATH, FINAL_PATH } from '../src/common'

await $`rm -rf ./dist`

await Bun.build({
  entrypoints: [`./src/main/${MAIN_FILE_NAME}.ts`],
  outdir: `./${FINAL_PATH}`,
  naming: `${MAIN_FILE_NAME}.js`,
  target: 'browser',
})

await Bun.build({
  entrypoints: [`./src/main/${MAIN_FILE_NAME}.ts`],
  outdir: `./${FINAL_PATH}`,
  naming: `${MAIN_FILE_NAME}.min.js`,
  target: 'browser',
  minify: true,
})

await Bun.build({
  entrypoints: [`./src/worker/${WORKER_FILE_NAME}.ts`],
  outdir: `./${FINAL_PATH}`,
  naming: `${WORKER_FILE_NAME}.js`,
  target: 'browser',
})

await Bun.build({
  entrypoints: [`./src/worker/${WORKER_FILE_NAME}.ts`],
  outdir: `./${FINAL_PATH}`,
  naming: `${WORKER_FILE_NAME}.min.js`,
  target: 'browser',
  minify: true,
})

const path = (relativePath: string) => new URL(relativePath, import.meta.url).pathname

const mainBundlePath = path(`../${FINAL_PATH}/${MAIN_FILE_NAME}.js`)
const workerBundlePath = path(`../${FINAL_PATH}/${WORKER_FILE_NAME}.js`)
const demoMainBundlePath = path(`../${DEMO_PATH}/${MAIN_FILE_NAME}.js`)
const demoWorkerBundlePath = path(`../${DEMO_PATH}/${WORKER_FILE_NAME}.js`)

const mainBundledCode = await Bun.file(mainBundlePath).text()
const workerBundledCode = await Bun.file(workerBundlePath).text()

Bun.write(demoMainBundlePath, mainBundledCode)
Bun.write(demoWorkerBundlePath, workerBundledCode)

await $`bun x tsc`
