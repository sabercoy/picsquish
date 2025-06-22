import { $ } from 'bun'

const MAIN_FILE_NAME = 'picsquish'
const WORKER_FILE_NAME = 'worker'
const DEMO_PATH = 'demo'
const FINAL_PATH = 'dist'
const TEMP_PATH = `${FINAL_PATH}/temp`

function escapeWorkerCode(code: string) {
  // escape backslashes: \ becomes \\
  code = code.replace(/\\/g, '\\\\')
  // escape backticks: ` becomes \`
  code = code.replace(/`/g, '\\`')
  // escape interpolations: ${ becomes \${
  code = code.replace(/\$\{/g, '\\${')

  return code
}

await $`rm -rf ./dist`

await Bun.build({
  entrypoints: [`./src/main/${MAIN_FILE_NAME}.ts`],
  outdir: `./${TEMP_PATH}`,
  naming: `${MAIN_FILE_NAME}.js`,
  target: 'browser',
})

await Bun.build({
  entrypoints: [`./src/main/${MAIN_FILE_NAME}.ts`],
  outdir: `./${TEMP_PATH}`,
  naming: `${MAIN_FILE_NAME}.min.js`,
  target: 'browser',
  minify: true,
})

await Bun.build({
  entrypoints: [`./src/worker/${WORKER_FILE_NAME}.ts`],
  outdir: `./${TEMP_PATH}`,
  naming: `${WORKER_FILE_NAME}.js`,
  target: 'browser',
})

await Bun.build({
  entrypoints: [`./src/worker/${WORKER_FILE_NAME}.ts`],
  outdir: `./${TEMP_PATH}`,
  naming: `${WORKER_FILE_NAME}.min.js`,
  target: 'browser',
  minify: true,
})

const path = (relativePath: string) => new URL(relativePath, import.meta.url).pathname

const mainBundlePath = path(`../${TEMP_PATH}/${MAIN_FILE_NAME}.js`)
const mainMinifiedPath = path(`../${TEMP_PATH}/${MAIN_FILE_NAME}.min.js`)
const workerBundlePath = path(`../${TEMP_PATH}/${WORKER_FILE_NAME}.js`)
const workerMinifiedPath = path(`../${TEMP_PATH}/${WORKER_FILE_NAME}.min.js`)

const mainBundledCode = await Bun.file(mainBundlePath).text()
const mainMinifiedCode = await Bun.file(mainMinifiedPath).text()
const workerBundledCode = await Bun.file(workerBundlePath).text()
const workerMinifiedCode = await Bun.file(workerMinifiedPath).text()

const escapedWorkerBundledCode = escapeWorkerCode(workerBundledCode)
const escapedWorkerMinifiedCode = escapeWorkerCode(workerMinifiedCode)

const finalBundledCode = mainBundledCode.replace(`"<WORKER_CODE>"`, '`\n' + escapedWorkerBundledCode + '`')
const finalMinifiedCode = mainMinifiedCode.replace(`"<WORKER_CODE>"`, '`\n' + escapedWorkerMinifiedCode + '`')

const finalBundlePath = path(`../${FINAL_PATH}/${MAIN_FILE_NAME}.js`)
const finalMinifiedPath = path(`../${FINAL_PATH}/${MAIN_FILE_NAME}.min.js`)
const demoPath = path(`../${DEMO_PATH}/${MAIN_FILE_NAME}.js`)

Bun.write(finalBundlePath, finalBundledCode)
Bun.write(finalMinifiedPath, finalMinifiedCode)
Bun.write(demoPath, finalBundledCode)

await $`rm ./${TEMP_PATH}/${MAIN_FILE_NAME}.js`
await $`rm ./${TEMP_PATH}/${MAIN_FILE_NAME}.min.js`
await $`rm ./${TEMP_PATH}/${WORKER_FILE_NAME}.js`
await $`rm ./${TEMP_PATH}/${WORKER_FILE_NAME}.min.js`
await $`rmdir ./${TEMP_PATH}`

await $`bun x tsc`
