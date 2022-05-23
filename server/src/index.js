// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const fsPromise = require('fs/promises') 
  canvas = require('canvas'),
  faceapi = require('face-api.js')

main()

async function main() {
  await init()

  console.log(`Image prep: loading`)
  const hImage = await fsPromise.open('test/jhfoo.jpg')
  const ImageBuffer = await hImage.readFile()
  const LocalImage = new canvas.Image()
  LocalImage.src = ImageBuffer
  console.log(`Image height x width: ${LocalImage.height}, ${LocalImage.width}`)

  const img = await canvas.loadImage('test/jhfoo.jpg')
  console.log(`Image prep: loaded`)

  await detectFace(LocalImage, new faceapi.SsdMobilenetv1Options())
  await detectFace(LocalImage, new faceapi.TinyFaceDetectorOptions())
}

async function detectFace(img, FaceDetector) {
  console.log(`Face detection: detecting`)
  const StartTimer = Date.now()
  const detections = await faceapi.detectAllFaces(img, FaceDetector)
  const StopTimer = Date.now()

  const TimeTakenSec = Math.floor((StopTimer - StartTimer)/100) / 10 
  console.log(`Face detection: done detecting in ${TimeTakenSec} secsrs`)
  console.log(detections)
}

async function init() {
  // patch nodejs environment, we need to provide an implementation of
  // HTMLCanvasElement and HTMLImageElement
  const { Canvas, Image, ImageData } = canvas
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
  console.log(faceapi.nets)

  await loadModels('./models')
}

async function loadModels(ModelPath) {
  const Models2Load = ['tinyFaceDetector', 'ssdMobilenetv1', 'faceExpressionNet']

  for (let idx = 0; idx < Models2Load.length; idx++) {
    const model = Models2Load[idx]
    console.log (`Loading model: ${model}`)
    await faceapi.nets[model].loadFromDisk(ModelPath)
    console.log (`Loaded model: ${model}`)
  }
}