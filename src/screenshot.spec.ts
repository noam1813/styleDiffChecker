import puppeteer, { Browser, Page } from 'puppeteer'
import fs from 'fs'
import resemble from 'resemblejs'
import { format } from 'date-fns'
import dotenv from 'dotenv'

async function Compare(
  imageBefore: Buffer,
  imageAfter: Buffer,
  path: string,
): Promise<number> {
  // 前回と最新のスクショの差分を比較
  return new Promise((resolve, reject) => {
    resemble(imageAfter)
      .compareTo(imageBefore)
      .ignoreColors()
      .onComplete((data) => {
        if (data.getBuffer) {
          const buffer = data.getBuffer(true)
          fs.writeFileSync(path, buffer)
          resolve(Number(data.misMatchPercentage))
        } else {
          reject(new Error('Failed to get buffer'))
        }
      })
  })
}
async function pageInit(width?:number,height?:number):Promise<[Browser,Page]>{
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  return [browser,page];
}

describe('NH', () => {
  let url: string
  let browser: Browser
  let page: Page
  const parentDir = './screenshot/'
  const previousDir = parentDir + 'base/'
  const latestDir = `${parentDir}/${format(new Date(), 'MM-dd-HH:mm:ss')}/`
  beforeAll(async () => {
    dotenv.config()
    url = process.env.URL_A ?? '';
    [browser, page] = await pageInit();
    await page.goto(url)
    fs.mkdirSync(latestDir, { recursive: true })
  })
  describe('A', () => {
    let misMatchPercentage = 1
    const previousFile = previousDir + '1.1.png'
    const latestFile = latestDir + '1.1.png'
    beforeAll(async () => {
      await page.screenshot({ path: latestFile, fullPage: true })
      const imageBefore = fs.readFileSync(previousFile)
      const imageAfter = fs.readFileSync(latestFile)
      // 前回と最新のスクショの差分を比較
      misMatchPercentage = await Compare(
        imageBefore,
        imageAfter,
        latestDir + 'diff.png',
      )
    })
    it('some test description', () => {
      expect(misMatchPercentage).toBeLessThanOrEqual(0)
    })
  })

  describe('B', () => {
    let misMatchPercentage = 1
    const previousFile = previousDir + '1.2.png'
    const latestFile = latestDir + '1.2.png'
    beforeAll(async () => {
      page.click(process.env.URL_B ?? '')
      await page.waitForNavigation({
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: latestFile, fullPage: true })
      const imageBefore = fs.readFileSync(previousFile)
      const imageAfter = fs.readFileSync(latestFile)
      // 前回と最新のスクショの差分を比較
      misMatchPercentage = await Compare(
        imageBefore,
        imageAfter,
        latestDir + 'diff.png',
      )
    })
    it('some test description', () => {
      expect(misMatchPercentage).toBeLessThanOrEqual(0)
    })
  })

  describe('C', () => {
    let misMatchPercentage = 1
    const previousFile = previousDir + '1.3.png'
    const latestFile = latestDir + '1.3.png'
    beforeAll(async () => {
      page.click(process.env.URL_C ?? '')
      await page.waitForNavigation({ timeout: 60000, waitUntil: 'load' })
      await page.screenshot({ path: latestFile, fullPage: true })
      const imageBefore = fs.readFileSync(previousFile)
      const imageAfter = fs.readFileSync(latestFile)
      // 前回と最新のスクショの差分を比較
      misMatchPercentage = await Compare(
        imageBefore,
        imageAfter,
        latestDir + 'diff.png',
      )
    })
    it('some test description', () => {
      expect(misMatchPercentage).toBeLessThanOrEqual(0)
    })
  })
  afterAll(async () => {
    browser.close()
  })
})
