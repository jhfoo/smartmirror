async function main() {
  const VideoStream = await navigator.mediaDevices.getUserMedia({
    video: true
  })
  const elVideo = document.querySelector('#LiveVideo')
  elVideo.srcObject = VideoStream

  setTimeout(async () => {
    try {
      // const CameraStream = await navigator.mediaDevices.getUserMedia({
      //   video: true
      // })
      // const track = CameraStream.getVideoTracks()[0]
      // console.log(track.getCapabilities())
      takeScreenshot()
    }
    catch(err) {
      console.error('getUserMedia() error:', error)
    }
  
    console.log('main() executed')
  }, 3 * 1000)
}

var CameraStream = null

async function takeScreenshot() {
  const elVideo = document.querySelector('#LiveVideo')
  const canvas = document.querySelector('#canvas')
  canvas.width = elVideo.videoWidth
  canvas.height = elVideo.videoHeight

  const bitmap = await createImageBitmap(elVideo)
  canvas.getContext('2d').drawImage(bitmap,0,0)
  // canvas.getContext('2d').drawImage(elVideo, 0, 0)

  setTimeout(async () => {
    takeScreenshot()
  }, 1 * 1000);

  return

  try {
    const CameraStream = await navigator.mediaDevices.getUserMedia({
      video: true
    })
    const track = CameraStream.getVideoTracks()[0]
    await track.applyConstraints({
      // brightness: 200,
      // width: 1280,
      // height: 760,
      width: 640,
      height: 480,
    })
    const imageCapture = new ImageCapture(track)
    console.log(`imageCapture.track.readyState: ${imageCapture.track.readyState}`)
    console.log(`imageCapture.track.enabled: ${imageCapture.track.enabled}`)
    console.log(`imageCapture.track.muted: ${imageCapture.track.muted}`)
  
    // const bitmap = await imageCapture.grabFrame()
    const blob = await imageCapture.takePhoto()
    // console.log(blob)
    const bitmap = await createImageBitmap(blob)
    // console.log(bitmap)

    canvas.height = bitmap.height
    canvas.width = bitmap.width
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    canvas.getContext('2d').drawImage(bitmap,0,0)
    track.stop()
  } catch (err) {
    console.error(err)
  }

  setTimeout(async () => {
    await takeScreenshot()
  }, 1 * 1000);

}

