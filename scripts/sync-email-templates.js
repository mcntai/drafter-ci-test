(async () => {
  const path = require('path')
  const fs = require('fs').promises
  const { promisify } = require('util')
  const { exec } = require('child_process')

  const execAsync = promisify(exec)

  const isObject = obj => obj === Object(obj)

  const isDate = date => date instanceof Date

  const clone = (obj, { preserveTypes = true } = {}) => {
    if (Array.isArray(obj)) {
      return obj.concat()
    }

    if (isObject(obj)) {
      const clone = preserveTypes ? Object.create(Object.getPrototypeOf(obj)) : {}

      return Object.assign(clone, obj)
    }

    return obj
  }

  const cloneDeep = (obj, options) => {
    if (Array.isArray(obj)) {
      return obj.map(item => cloneDeep(item, options))
    }

    if (obj instanceof Date) {
      return new Date(obj)
    }

    if (isObject(obj) && !isDate(obj)) {
      const result = clone(obj, options)

      Object.keys(obj).forEach(key => {
        result[key] = cloneDeep(obj[key], options)
      })

      return result
    }

    return obj
  }

  const equals = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b)

  const compare = (a, b, attributes) => {
    if (!attributes) {
      attributes = Object.keys(a)
    }

    return attributes.filter(attr => !equals(a[attr], b[attr]))
  }

  const commitUpdatedTemplatesMetaData = async () => {
    const userEmail = `-c user.email="${process.env.GITHUB_ACTOR}@users.noreply.github.com"`
    const userName = `-c user.name="${process.env.GITHUB_ACTOR}"`

    await execAsync('git add scripts/sync/email-templates/templates-meta-data.json')
    await execAsync(`git ${userEmail} ${userName} commit -m "add updated templates meta data [ci skip]"`)
    await execAsync('git push')
  }

  const shouldCommitChanges = templatesDataBeforeChanges => {
    console.log({ templatesDataBeforeChanges })

    const changes = compare(templatesDataBeforeChanges, require('./templates-meta-data.json'))

    return changes.length
  }

  const filePath = path.join(__dirname, 'templates-meta-data.json')

  const templatesMetaDataMap = require('./templates-meta-data.json')

  const templatesDataBeforeChanges = cloneDeep(templatesMetaDataMap)

  const name = 'RESET_PASSWORD'

  const template = templatesMetaDataMap[name]

  if (template) {
    template.name = 'updated'
  } else {
    templatesMetaDataMap[name] = { name: 'name', id: 'id' }
  }

  const updatedData = JSON.stringify(templatesMetaDataMap, null, 2)

  await fs.writeFile(filePath, updatedData)

  if (shouldCommitChanges(templatesDataBeforeChanges)) {
    console.log('should commit changes')

    await commitUpdatedTemplatesMetaData()
  }
})()
