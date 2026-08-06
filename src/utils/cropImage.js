function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

// Crops `cropPixels` out of the image at `imageSrc`, scaling it down so its
// longest edge is at most `maxSize` (pass null/undefined to keep full crop size).
// Never upscales. Returns a JPEG Blob.
export async function getCroppedImg(imageSrc, cropPixels, maxSize) {
  const image = await loadImage(imageSrc)

  let outW = cropPixels.width
  let outH = cropPixels.height
  if (maxSize && Math.max(outW, outH) > maxSize) {
    const scale = maxSize / Math.max(outW, outH)
    outW = Math.round(outW * scale)
    outH = Math.round(outH * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, outW, outH
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Canvas is empty'))
      else resolve(blob)
    }, 'image/jpeg', 0.92)
  })
}
