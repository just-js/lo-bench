self.onmessage = () => {
//  console.log(event.data)
  postMessage('world')
  process.exit()
}

