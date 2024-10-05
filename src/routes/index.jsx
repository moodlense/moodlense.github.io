import { Link } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'

export default function IndexPage() {
    const videoRef = useRef()
    const canvasRef = useRef()

    useEffect(() => {
        startVideo()
        loadModels()
    }, [])

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models")
        ]).then(() => {
            faceMyDetect()
        })
    }

    const faceMyDetect = () => {
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoRef.current,
                new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

            // Clear previous drawings on the canvas
            const canvas = canvasRef.current
            const context = canvas.getContext("2d")
            context.clearRect(0, 0, canvas.width, canvas.height)

            // Create and resize canvas for detections
            faceapi.matchDimensions(canvas, {
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            })

            const resized = faceapi.resizeResults(detections, {
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            })

            // Draw detections, landmarks, and expressions on the canvas
            faceapi.draw.drawDetections(canvas, resized)
            faceapi.draw.drawFaceLandmarks(canvas, resized)
            faceapi.draw.drawFaceExpressions(canvas, resized)

        }, 1000)
    }

    return (
        <div className="myapp">
            <div className="appvide">
                <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
            </div>
            <canvas ref={canvasRef} width="540" height="650" className="appcanvas" />
        </div>
    )
}
