(async () => {
  const path = require('path')
  const fs = require('fs').promises
  const { promisify } = require('util')
  const { exec } = require('child_process')

  const execAsync = promisify(exec)

  const filePath = path.join(__dirname, 'templates-meta-data.json')

  console.log(filePath)

  const rawData = await fs.readFile(filePath)
  const data = JSON.parse(rawData)

  data.push({ name: 'name', id: 'id' })

  const updatedData = JSON.stringify(data, null, 2)

  await fs.writeFile(filePath, updatedData)

  await execAsync('git add scripts/templates-meta-data.json')
  await execAsync('git commit -m "update email templates meta data [ci skip]"')
  await execAsync('git push')

  return Boolean(data.length)
})()
