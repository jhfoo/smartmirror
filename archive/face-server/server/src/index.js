// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const fsPromise = require('fs/promises') 
const { start } = require('repl')
  canvas = require('canvas'),
  faceapi = require('@vladmandic/face-api/dist/face-api.node.js'),
  { ServiceBroker } = require('moleculer'),
  ApiService = require('moleculer-web')

var FaceMatcher = null

main()

function startApiSvc() {
  const broker = new ServiceBroker()
  broker.createService({
    mixins: [ApiService],
    name: 'api',
    actions: {
      async detect(ctx) {
        // console.log(ctx.params.data)
        const LocalImage = new canvas.Image()
        LocalImage.src = ctx.params.data
        console.log(`Image height x width: ${LocalImage.height}, ${LocalImage.width}`)
        const descriptions = await detectFaces(LocalImage, new faceapi.TinyFaceDetectorOptions())
        if (!descriptions) {
          return []
        }

        const resp = descriptions.map((descriptor) => {
          const detection = descriptor.alignedRect
          const ret = {
            score: asDecimalPlace(detection.score, 1000),
            box: {
              x: Math.floor(detection.box.x),
              y: Math.floor(detection.box.y),
              width: Math.floor(detection.box.width),
              height: Math.floor(detection.box.height),
            },
            angle: {
              roll: asDecimalPlace(descriptor.angle.roll, 1000),
              pitch: asDecimalPlace(descriptor.angle.pitch, 1000),
              yaw: asDecimalPlace(descriptor.angle.yaw, 1000),
            }
          }

          const MatchedFace = FaceMatcher.findBestMatch(descriptor.descriptor)
          if (MatchedFace) {
            // console.log('Matched face')
            // console.log(MatchedFace)
            ret.MatchedLabel = MatchedFace.label
          }

          return ret 
        })
        return resp
      }
    },
    settings: {
      port: 3003,
      ip: '0.0.0.0',
      bodyParsers: {
        json: true,
        limit: 100 * 1024 * 1024,
      }
    },
  })
  broker.start()
}

function asDecimalPlace(number, order) {
  return Math.floor(number * order) / order
}

function b64toBuffer(base64) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

async function main() {
  await init()
  startApiSvc()

  console.log(`Image prep: loading`)
  const hImage = await fsPromise.open('test/jhfoo.jpg')
  const ImageBuffer = await hImage.readFile()
  hImage.close()

  const LocalImage = new canvas.Image()
  LocalImage.src = ImageBuffer
  console.log(`Image height x width: ${LocalImage.height}, ${LocalImage.width}`)

  const img = await canvas.loadImage('test/jhfoo.jpg')
  console.log(`Image prep: loaded`)

  // await detectFace(LocalImage, new faceapi.SsdMobilenetv1Options())
  // await detectFace(LocalImage, new faceapi.TinyFaceDetectorOptions())
}

async function detectFaces(img, FaceDetector) {
  console.log(`Face detection: detecting`)
  const StartTimer = Date.now()
  const detections = await faceapi.detectAllFaces(img, FaceDetector).withFaceLandmarks().withFaceDescriptors()
  const StopTimer = Date.now()

  const TimeTakenSec = Math.floor((StopTimer - StartTimer)/100) / 10 
  console.log(`Face detection: done detecting in ${TimeTakenSec} secs`)
  // console.log(detections)

  return detections
}

async function init() {
  // patch nodejs environment, we need to provide an implementation of
  // HTMLCanvasElement and HTMLImageElement
  const { Canvas, Image, ImageData } = canvas
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
  console.log(faceapi.nets)

  await loadModels('./models')
  const LabelDescriptors = await loadTrainingSets('./training')
  FaceMatcher = new faceapi.FaceMatcher(LabelDescriptors, 0.7)

  return {
    LabelDescriptors,
  }
}

async function loadTrainingSets(DataPath) {
  const labels = ['jhfoo','lisa','rlfoo','syfoo']
  return await Promise.all(
    labels.map(async (label) => {
      console.log(`Loading label ${label}...`)
      const img = await canvas.loadImage(`${DataPath}/${label}1.jpg`)
      const description = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      if (description) {
        const descriptors = [description.descriptor]
        return new faceapi.LabeledFaceDescriptors(label, descriptors)
      }
    })
  )
}

async function loadModels(ModelPath) {
  const Models2Load = ['tinyFaceDetector', 'ssdMobilenetv1', 'faceRecognitionNet','faceLandmark68Net','faceLandmark68TinyNet']

  for (let idx = 0; idx < Models2Load.length; idx++) {
    const model = Models2Load[idx]
    console.log (`Loading model: ${model}`)
    await faceapi.nets[model].loadFromDisk(ModelPath)
    console.log (`Loaded model: ${model}`)
  }
}