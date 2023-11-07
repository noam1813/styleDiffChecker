import puppeteer, { Browser, Page } from 'puppeteer'
import fs from 'fs'
import resemble from 'resemblejs'

describe('aaa', () => {
  let url: string
  let misMatchPercentage = 0
  let browser: Browser
  let page: Page
  beforeAll(async () => {
    url = 'http://localhost:3001'

    browser = await puppeteer.launch({ headless: 'new' })
    page = await browser.newPage()

    const parentDir = './screenshot/'

    // 一つ前のスクショのパスを取得
    const previousFile = parentDir + 'old/example.png'

    // 最新のスクショとディレクトリを作成
    const latestDir = parentDir + 'new/'
    fs.mkdirSync(latestDir, { recursive: true })
    const latestFile = latestDir + 'example.png'
    await page.screenshot({ path: latestFile, fullPage: true })

    // 最新と一つ前のスクショを取得
    const imageBefore = fs.readFileSync(previousFile)
    const imageAfter = fs.readFileSync(latestFile)
    // 前回と最新のスクショの差分を比較
    resemble(imageAfter)
      .compareTo(imageBefore)
      .ignoreColors()
      .onComplete((data) => {
        console.log(data.getBuffer)
        if (data.getBuffer) {
          const buffer = data.getBuffer(true)
          fs.writeFileSync(latestDir + 'diff.png', buffer)
        }
      })
  })
  afterAll(async () => {
    browser.close()
  })
  it('some test description', () => {
    // 差分許容率はとりあえず１％にしておきます。
    expect(misMatchPercentage).toBe(0)
  })
})
