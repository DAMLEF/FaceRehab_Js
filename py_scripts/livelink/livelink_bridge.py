"""
livelink_bridge.py — WebSocket -> Live Link Face (Unreal Engine)
===============================================================
Reçoit les blendshapes traités depuis main.js via WebSocket
et les envoie à Unreal via UDP en utilisant PyLiveLinkFace.
"""

import asyncio
import json
import socket
import websockets
from pylivelinkface import PyLiveLinkFace, FaceBlendShape

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
WS_HOST     = "localhost"
WS_PORT     = 8081

UNREAL_IP   = "127.0.0.1"
UNREAL_PORT = 11111

SUBJECT_NAME = "MediPipeFace"

# ─────────────────────────────────────────────
# Mapping camelCase (main.js) -> FaceBlendShape (PyLiveLinkFace)
# ─────────────────────────────────────────────
BS_MAP = {
    "eyeBlinkLeft":        FaceBlendShape.EyeBlinkLeft,
    "eyeLookDownLeft":     FaceBlendShape.EyeLookDownLeft,
    "eyeLookInLeft":       FaceBlendShape.EyeLookInLeft,
    "eyeLookOutLeft":      FaceBlendShape.EyeLookOutLeft,
    "eyeLookUpLeft":       FaceBlendShape.EyeLookUpLeft,
    "eyeSquintLeft":       FaceBlendShape.EyeSquintLeft,
    "eyeWideLeft":         FaceBlendShape.EyeWideLeft,
    "eyeBlinkRight":       FaceBlendShape.EyeBlinkRight,
    "eyeLookDownRight":    FaceBlendShape.EyeLookDownRight,
    "eyeLookInRight":      FaceBlendShape.EyeLookInRight,
    "eyeLookOutRight":     FaceBlendShape.EyeLookOutRight,
    "eyeLookUpRight":      FaceBlendShape.EyeLookUpRight,
    "eyeSquintRight":      FaceBlendShape.EyeSquintRight,
    "eyeWideRight":        FaceBlendShape.EyeWideRight,
    "jawForward":          FaceBlendShape.JawForward,
    "jawLeft":             FaceBlendShape.JawLeft,
    "jawRight":            FaceBlendShape.JawRight,
    "jawOpen":             FaceBlendShape.JawOpen,
    "mouthClose":          FaceBlendShape.MouthClose,
    "mouthFunnel":         FaceBlendShape.MouthFunnel,
    "mouthPucker":         FaceBlendShape.MouthPucker,
    "mouthLeft":           FaceBlendShape.MouthLeft,
    "mouthRight":          FaceBlendShape.MouthRight,
    "mouthSmileLeft":      FaceBlendShape.MouthSmileLeft,
    "mouthSmileRight":     FaceBlendShape.MouthSmileRight,
    "mouthFrownLeft":      FaceBlendShape.MouthFrownLeft,
    "mouthFrownRight":     FaceBlendShape.MouthFrownRight,
    "mouthDimpleLeft":     FaceBlendShape.MouthDimpleLeft,
    "mouthDimpleRight":    FaceBlendShape.MouthDimpleRight,
    "mouthStretchLeft":    FaceBlendShape.MouthStretchLeft,
    "mouthStretchRight":   FaceBlendShape.MouthStretchRight,
    "mouthRollLower":      FaceBlendShape.MouthRollLower,
    "mouthRollUpper":      FaceBlendShape.MouthRollUpper,
    "mouthShrugLower":     FaceBlendShape.MouthShrugLower,
    "mouthShrugUpper":     FaceBlendShape.MouthShrugUpper,
    "mouthPressLeft":      FaceBlendShape.MouthPressLeft,
    "mouthPressRight":     FaceBlendShape.MouthPressRight,
    "mouthLowerDownLeft":  FaceBlendShape.MouthLowerDownLeft,
    "mouthLowerDownRight": FaceBlendShape.MouthLowerDownRight,
    "mouthUpperUpLeft":    FaceBlendShape.MouthUpperUpLeft,
    "mouthUpperUpRight":   FaceBlendShape.MouthUpperUpRight,
    "browDownLeft":        FaceBlendShape.BrowDownLeft,
    "browDownRight":       FaceBlendShape.BrowDownRight,
    "browInnerUp":         FaceBlendShape.BrowInnerUp,
    "browOuterUpLeft":     FaceBlendShape.BrowOuterUpLeft,
    "browOuterUpRight":    FaceBlendShape.BrowOuterUpRight,
    "cheekPuff":           FaceBlendShape.CheekPuff,
    "cheekSquintLeft":     FaceBlendShape.CheekSquintLeft,
    "cheekSquintRight":    FaceBlendShape.CheekSquintRight,
    "noseSneerLeft":       FaceBlendShape.NoseSneerLeft,
    "noseSneerRight":      FaceBlendShape.NoseSneerRight,
    "tongueOut":           FaceBlendShape.TongueOut,
    # Rotation tête
    "headYaw":   FaceBlendShape.HeadYaw,
    "headPitch": FaceBlendShape.HeadPitch,
    "headRoll":  FaceBlendShape.HeadRoll,
}

# ─────────────────────────────────────────────
# UDP socket
# ─────────────────────────────────────────────
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.connect((UNREAL_IP, UNREAL_PORT))

# ─────────────────────────────────────────────
# WebSocket
# ─────────────────────────────────────────────
async def ws_handler(websocket):
    print(f"[Bridge] main.js connecté : {websocket.remote_address}")
    py_face = PyLiveLinkFace(name=SUBJECT_NAME, fps=60)

    try:
        async for message in websocket:
            print(f"[Bridge] reçu {len(message)} octets")
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                continue

            for js_key, bs_enum in BS_MAP.items():
                if js_key in data:
                    py_face.set_blendshape(bs_enum, float(data[js_key]))

            sock.sendall(py_face.encode())

    except websockets.ConnectionClosed:
        print("[Bridge] main.js déconnecté")


async def main():
    print(f"[Bridge] En écoute sur ws://{WS_HOST}:{WS_PORT}")
    print(f"[Bridge] Transfert UDP -> {UNREAL_IP}:{UNREAL_PORT}")
    print(f"[Bridge] Sujet : {SUBJECT_NAME}")
    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Bridge] Arrêté.")
    finally:
        sock.close()