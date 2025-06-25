const server = Bun.serve({
  port: 8000,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url)
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname

    try {
      const file = Bun.file(`./demo${filePath}`)
      const exists = await file.exists()
      
      if (!exists) return new Response('Not Found', { status: 404 })
      
      return new Response(file, {
        headers: {
          // 'Cross-Origin-Embedder-Policy': 'require-corp',
          // 'Cross-Origin-Opener-Policy': 'same-origin',
          // 'Access-Control-Allow-Origin': '*'
        }
      })
    } catch (error) {
      return new Response('Server Error', { status: 500 })
    }
  }
})

console.log(`Server running on http://localhost:${server.port}`)