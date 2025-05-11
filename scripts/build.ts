import { $ } from 'bun'

const clientFileName = 'client'
const workerFileName = 'worker'
const finalFileName = 'picsquish'

await $`rm -rf ./dist`

await Bun.build({
  entrypoints: [`./src/worker/${workerFileName}.ts`],
  outdir: './dist',
  naming: `${workerFileName}.js`,
  target: 'browser',
})

await Bun.build({
  entrypoints: [`./src/worker/${workerFileName}.ts`],
  outdir: './dist',
  naming: `${workerFileName}.min.js`,
  target: 'browser',
  minify: true,
})

await Bun.build({
  entrypoints: [`./src/client/${clientFileName}.ts`],
  outdir: './dist',
  naming: `${clientFileName}.js`,
  target: 'browser',
})

await Bun.build({
  entrypoints: [`./src/client/${clientFileName}.ts`],
  outdir: './dist',
  naming: `${clientFileName}.min.js`,
  target: 'browser',
  minify: true,
})

const path = (relativePath: string) => new URL(relativePath, import.meta.url).pathname

const clientBundlePath = path(`../dist/${clientFileName}.js`)
const workerBundlePath = path(`../dist/${workerFileName}.js`)
const clientMinifiedPath = path(`../dist/${clientFileName}.min.js`)
const workerMinifiedPath = path(`../dist/${workerFileName}.min.js`)
const finalBundlePath = path(`../dist/${finalFileName}.js`)
const finalMinifiedPath = path(`../dist/${finalFileName}.min.js`)
const demoPath = path(`../demo/${finalFileName}.js`)

const clientBundledCode = await Bun.file(clientBundlePath).text()
const workerBundledCode = await Bun.file(workerBundlePath).text()
const clientMinifiedCode = await Bun.file(clientMinifiedPath).text()
const workerMinifiedCode = await Bun.file(workerMinifiedPath).text()

const finalBundledCode = clientBundledCode.replace(`"<WORKER_CODE>"`, '`\n' + workerBundledCode + '`')
const finalMinifiedCode = clientMinifiedCode.replace(`"<WORKER_CODE>"`, '`\n' + workerMinifiedCode + '`')

Bun.write(finalBundlePath, finalBundledCode)
Bun.write(finalMinifiedPath, finalMinifiedCode)
Bun.write(demoPath, finalBundledCode)

await $`rm ./dist/${clientFileName}.js`
await $`rm ./dist/${clientFileName}.min.js`
await $`rm ./dist/${workerFileName}.js`
await $`rm ./dist/${workerFileName}.min.js`

await $`bun x tsc`

export {}