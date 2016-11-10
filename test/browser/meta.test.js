import {
  loadTestFile, writeTestFile, useTestFileScaffold, removeTestFile
} from './support'

describe('browser testing setup', () => {
  describe('reading a local file', () => {
    before(() => writeTestFile(`<html><body>hello world!</body></html>`))
    after(() => removeTestFile())

    it('works', function () {
      this.timeout(5000)
      return loadTestFile()
      .evaluate(() => document.body.textContent)
      .end()
      .then(text => expect(text).to.equal('hello world!'))
    })
  })

  describe('rendering a React component', () => {
    before(function () {
      this.timeout(10000)
      return useTestFileScaffold('meta')
    })
    after(() => removeTestFile())

    it('works', function () {
      this.timeout(5000)
      return loadTestFile()
      .evaluate(() => document.querySelector('span').textContent)
      .end()
      .then(text => expect(text).to.equal('I am a component, hear me roar!'))
    })
  })
})
