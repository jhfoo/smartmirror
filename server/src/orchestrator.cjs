const cprocess = require('child_process')
const process = require('process')

loop()

function spawnWChromium() {
  // const pWindow = cprocess.spawn('chromium', ['https://smartmirror.kungfoo.info/home', '--start-fullscreen'])
  const pWindow = cprocess.spawn('chromium', ['https://smartmirror.kungfoo.info/home', '--kiosk'])
  pWindow.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })
  
  pWindow.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })
  
  pWindow.stderr.on('close', (code) => {
    console.log(`close: ${code}`)
  })

  return pWindow
}

function loop(RefreshMin = 15) {
  const pWindow = spawnWChromium()
  setTimeout(() => {
    console.log('Restarting Chromium')
    pWindow.kill()
    loop()    
  }, RefreshMin * 1000 * 60)
}

// DISPLAY=:0.0 chromium https://smartmirror.kungfoo.info/home --start-fullscreen
