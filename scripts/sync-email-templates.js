(async () => {
  console.log('some error')

  process.exit(-1)

  const path = require('path')
  const fs = require('fs').promises

  const filePath = path.join(__dirname, 'templates-meta-data.json')

  const rawData = await fs.readFile(filePath)
  const data = JSON.parse(rawData)

  data.push({ name: 'name', id: 'id' })

  const updatedData = JSON.stringify(data, null, 2)

  await fs.writeFile(filePath, updatedData)

  // console.log(Boolean(data.length))

  return Boolean(data.length)
})()
