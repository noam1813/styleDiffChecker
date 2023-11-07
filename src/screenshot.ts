import puppeteer from 'puppeteer'
import * as readline from 'readline'
import fs from 'fs'
import resemble, { ComparisonResult } from 'resemblejs'

interface CompareResult {
  isSameDimensions: boolean
  dimensionDifference: { width: number; height: number }
  rawMisMatchPercentage: number
  misMatchPercentage: string
  diffBounds: { top: number; left: number; bottom: number; right: number }
  analysisTime: number
  getImageDataUrl: () => any
  getBuffer: () => any
}

function initReadLine(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

async function takeScreenshot(url: string, outputPath: string) {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.goto(url)
  await page.screenshot({ path: outputPath })
  await browser.close()
}

async function askOptions(rl: readline.Interface): Promise<string> {
  let url: string = ''
  url = await new Promise((resolve) =>
    rl.question('aiueo : ', (answer) => resolve(answer)),
  )
  console.log(url)
  return 'http://' + url
}

async function main() {
  let rl: readline.Interface
  let url: string

  rl = initReadLine()
  url = await askOptions(rl)
  // takeScreenshot(url, 'example.png')

  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  const parentDir = 'screenshot/'

  // 一つ前のスクショのパスを取得
  const list = fs.readdirSync(parentDir)
  const previousFile = parentDir + 'old/example.png'

  // 最新のスクショとディレクトリを作成
  const latestDir = parentDir + 'new/'
  fs.mkdirSync(latestDir, { recursive: true })
  const latestFile = latestDir + 'example.png'
  await page.screenshot({ path: latestFile, fullPage: true })

  // 最新と一つ前のスクショを取得
  const imageBefore = fs.readFileSync(previousFile)
  const imageAfter = fs.readFileSync(latestFile)

  let misMatchPercentage = 0

  // 前回と最新のスクショの差分を比較
  resemble(imageAfter)
    .compareTo(imageBefore)
    .ignoreColors()
    .onComplete((data) => {
      console.log(data.getBuffer)
      if (data.getBuffer) {
        const buffer = data.getBuffer(true)
        fs.writeFileSync(latestDir + 'diff.png', buffer)
        console.log('前回スクショとの差分画像を作成しました。')
        console.log(data) // dataの中に差分画像生成時に色々なデータが入ってます。
      }
    })

  // 差分許容率はとりあえず１％にしておきます。
  expect(misMatchPercentage).toBeLessThan(1)

  // 最後に必ず閉じる
  rl.close()
}

main()
