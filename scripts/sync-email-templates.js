(async () => {
  const path = require('path')
  const fs = require('fs').promises

  const filePath = path.join(__dirname, 'data.json')

  try {
    const rawData = await fs.readFile(filePath)
    const data = JSON.parse(rawData)

    data.push({ name: 'name', id: 'id' })

    const updatedData = JSON.stringify(data, null, 2)

    await fs.writeFile(filePath, updatedData)

    console.log(JSON.stringify(data, null, 2))

    console.log(JSON.stringify({ syncResult: Boolean(data.length) }))

    // Return the result in a format that can be captured by GitHub Actions
    process.exitCode = 0 // Indicate success
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1 // Indicate failure
  }
})()
