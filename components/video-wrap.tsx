import { RefObject, useEffect, useRef } from "react"
import { useAtom } from "jotai"

import {
  mediaCanvasRefAtom,
  mediaStreamActiveAtom,
  mediaStreamRefAtom,
  removeBGAtom,
} from "@/lib/atoms"
import { cn } from "@/lib/utils"

export default function VideoWrap() {
  const [removeBG] = useAtom(removeBGAtom)
  const [mediaStreamActive] = useAtom(mediaStreamActiveAtom)
  const [mediaStreamRef, setMediaStreamRef] = useAtom(mediaStreamRefAtom) as [
    RefObject<HTMLVideoElement> | undefined,
    (value: RefObject<HTMLVideoElement> | undefined) => void,
  ]
  const [mediaCanvasRef, setMediaCanvasRef] = useAtom(mediaCanvasRefAtom) as [
    RefObject<HTMLCanvasElement> | undefined,
    (value: RefObject<HTMLCanvasElement> | undefined) => void,
  ]

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMediaStreamRef(videoRef)
    setMediaCanvasRef(canvasRef)
  }, [setMediaStreamRef, setMediaCanvasRef])

  useEffect(() => {
    console.log("removeBG:", removeBG);
    console.log("mediaStreamActive:", mediaStreamActive);

    if (!removeBG || !mediaStreamActive || !mediaStreamRef || !mediaCanvasRef)
      return

    const renderCanvas = () => {
      const video = mediaStreamRef.current
      const canvas = mediaCanvasRef.current
      if (!canvas || !video) return
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i]
        const green = data[i + 1]
        const blue = data[i + 2]

        if (isCloseToGreen([red, green, blue])) {
          data[i + 3] = 0 // Set alpha channel to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0)

      return requestAnimationFrame(renderCanvas)
    }

    const isCloseToGreen = (color: number[]) => {
      const [red, green, blue] = color
      const th = 90 // Adjust threshold for green detection
      return green > th && red < th && blue < th
    }

    const animationFrameId = renderCanvas()

    return () => cancelAnimationFrame(animationFrameId!)
  }, [removeBG, mediaStreamActive])

  return (
    <div id="videoWrap">
      <video
        playsInline
        autoPlay
        ref={videoRef}
        className={cn("max-h-[500px] w-full")}
        style={{ border: "2px solid red" }}
      ></video>
      <canvas
        ref={canvasRef}
        className={cn("max-h-[500px] w-full")}
        style={{ border: "2px solid blue" }}
      ></canvas>
    </div>
  )
}