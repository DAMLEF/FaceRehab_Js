"""
main.py — Webcam -> MediaPipe -> WebSocket
=========================================
Capture le visage en temps réel via MediaPipe FaceLandmarker,
extrait les 52 blendshapes ARKit et la pose de tête (solvePnP),
puis diffuse les données à tous les clients WebSocket connectés.
"""

import cv2
import mediapipe as mp
import asyncio
import websockets
import json
import threading
import numpy as np
import os

from mediapipe.tasks.python        import BaseOptions
from mediapipe.tasks.python.vision import FaceLandmarker, FaceLandmarkerOptions, RunningMode

from camera import open_camera, get_camera_matrix
from face   import get_face_pose, draw_debug_axes

MODEL_PATH = os.path.join(os.path.dirname(__file__), "face_landmarker.task")

# ── Caméra ───────────────────────────────────────────────────────────────────
cap, W, H = open_camera(index=0)
cam_matrix, dist_coeffs = get_camera_matrix(W, H)

# ── Données partagées avec le serveur WebSocket ───────────────────────────────
face_data = {}

# ── WebSocket ─────────────────────────────────────────────────────────────────
async def ws_handler(websocket):
    """Envoie les données du visage à chaque client connecté en continu."""
    print(f"Client connecté : {websocket.remote_address}")
    try:
        while True:
            await websocket.send(json.dumps(face_data))
            await asyncio.sleep(1 / 60)
    except websockets.ConnectionClosed:
        print("Client déconnecté")

async def start_server():
    async with websockets.serve(ws_handler, "localhost", 8080):
        print("Serveur WebSocket démarré sur ws://localhost:8080")
        await asyncio.Future()

def run_ws_server():
    """Lance le serveur WebSocket dans un thread séparé."""
    asyncio.run(start_server())

threading.Thread(target=run_ws_server, daemon=True).start()

# ── MediaPipe FaceLandmarker ──────────────────────────────────────────────────
options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=RunningMode.IMAGE,
    num_faces=1,
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=False,
    min_face_detection_confidence=0.5,
    min_face_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)

landmarker = FaceLandmarker.create_from_options(options)

# Adaptateur pour rendre les landmarks compatibles avec face.py
class LM:
    def __init__(self, x, y, z): 
        self.x = x 
        self.y = y 
        self.z = z

# ── Main loop ─────────────────────────────────────────────────────────────────
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    debug = frame.copy()

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB,
                        data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    result   = landmarker.detect(mp_image)

    if result.face_landmarks and result.face_blendshapes:
        lm          = result.face_landmarks[0]
        blendshapes = result.face_blendshapes[0]

        # 52 blendshapes ARKit directement calibrés -> dict
        bs = {b.category_name: float(b.score) for b in blendshapes}
        face_data.update(bs)

        # ── Pose tête via solvePnP ────────────────────────────────────────────
        lm_compat = [LM(p.x, p.y, p.z) for p in lm]
        rvec, tvec = get_face_pose(lm_compat, W, H, cam_matrix, dist_coeffs)

        if rvec is not None:
            raw_x = float(tvec[0][0])
            raw_y = float(tvec[1][0])
            raw_z = float(tvec[2][0])
            if raw_z < 0:
                raw_x, raw_y, raw_z = -raw_x, -raw_y, -raw_z

            face_data["headX"] = raw_x
            face_data["headY"] = raw_y
            face_data["headZ"] = raw_z
            
            rot_mat, _ = cv2.Rodrigues(rvec)
            pitch = float(np.arctan2(rot_mat[2][1], rot_mat[2][2]))
            yaw   = float(np.arctan2(-rot_mat[2][0], np.sqrt(rot_mat[2][1]**2 + rot_mat[2][2]**2)))
            roll  = float(np.arctan2(rot_mat[1][0], rot_mat[0][0]))

            face_data["headPitch"] = pitch
            face_data["headYaw"]   = yaw
            face_data["headRoll"]  = roll

            draw_debug_axes(debug, lm_compat, W, H, rvec, tvec, cam_matrix, dist_coeffs)

        # ── Landmarks afficahge debug ─────────────────────────────────────────
        for p in lm:
            cx, cy = int(p.x * W), int(p.y * H)
            cv2.circle(debug, (cx, cy), 1, (0, 255, 0), -1)

        cv2.putText(debug, "Face tracked", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 0), 2)
    else:
        cv2.putText(debug, "No face", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 200), 2)

    cv2.imshow("Debug - Face Mesh", debug)

    key = cv2.waitKey(1)
    if key % 256 == 27:   # ESC
        break

landmarker.close()
cap.release()
cv2.destroyAllWindows()
