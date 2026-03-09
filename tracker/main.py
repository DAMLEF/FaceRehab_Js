import cv2
import mediapipe as mp
import asyncio
import websockets
import json
import threading
import numpy as np

from camera           import open_camera, get_camera_matrix
from face             import get_face_pose, draw_debug_axes
from blendshapes.eyes import extract_eyes

# ── MediaPipe ────────────────────────────────────────────────────────────────
mp_face_mesh = mp.solutions.face_mesh   
mp_drawing   = mp.solutions.drawing_utils
mp_styles    = mp.solutions.drawing_styles

# ── Caméra ───────────────────────────────────────────────────────────────────
cap, W, H            = open_camera(index=0)
cam_matrix, dist_coeffs = get_camera_matrix(W, H)

# ── Données partagées avec le serveur WebSocket ───────────────────────────────
face_data = {
    # Rotation tête
    "headYaw":   0.0,
    "headPitch": 0.0,
    "headRoll":  0.0,
    # Position tête
    "headX": 0.0,
    "headY": 0.0,
    "headZ": 0.0,
    # Yeux
    "eyeBlinkLeft":    0.0,
    "eyeBlinkRight":   0.0,
    "eyeWideLeft":     0.0,
    "eyeWideRight":    0.0,
    "eyeSquintLeft":   0.0,
    "eyeSquintRight":  0.0,
    "eyeLookInLeft":   0.0,
    "eyeLookOutLeft":  0.0,
    "eyeLookInRight":  0.0,
    "eyeLookOutRight": 0.0,
    "eyeLookUpLeft":   0.0,
    "eyeLookDownLeft": 0.0,
    "eyeLookUpRight":  0.0,
    "eyeLookDownRight":0.0,
}

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
    async with websockets.serve(ws_handler, "localhost", 8765):
        print("Serveur WebSocket démarré sur ws://localhost:8765")
        await asyncio.Future()

def run_ws_server():
    """Lance le serveur WebSocket dans un thread séparé."""
    asyncio.run(start_server())

threading.Thread(target=run_ws_server, daemon=True).start()

# ── Main loop ─────────────────────────────────────────────────────────────────
with mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
) as face_mesh:

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)

        rgb     = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)
        debug   = frame.copy()

        if results.multi_face_landmarks:
            lm = results.multi_face_landmarks[0].landmark

            # ── Debug mesh ────────────────────────────────────────────────────
            mp_drawing.draw_landmarks(
                debug, results.multi_face_landmarks[0],
                mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_styles.get_default_face_mesh_tesselation_style()
            )
            mp_drawing.draw_landmarks(
                debug, results.multi_face_landmarks[0],
                mp_face_mesh.FACEMESH_CONTOURS,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_styles.get_default_face_mesh_contours_style()
            )

            # ── Pose tête ─────────────────────────────────────────────────────
            rvec, tvec = get_face_pose(lm, W, H, cam_matrix, dist_coeffs)

            if rvec is not None:
                draw_debug_axes(debug, lm, W, H, rvec, tvec, cam_matrix, dist_coeffs)

                # tvec : position en mm
                raw_x = float(tvec[0][0])
                raw_y = float(tvec[1][0])
                raw_z = float(tvec[2][0])
                if raw_z < 0:
                    raw_x, raw_y, raw_z = -raw_x, -raw_y, -raw_z

                face_data["headX"] = raw_x
                face_data["headY"] = raw_y
                face_data["headZ"] = raw_z

                # rvec → matrice de rotation → angles euler en radians
                rot_mat, _ = cv2.Rodrigues(rvec)
                pitch = float(np.arctan2(rot_mat[2][1], rot_mat[2][2]))
                yaw   = float(np.arctan2(-rot_mat[2][0], np.sqrt(rot_mat[2][1]**2 + rot_mat[2][2]**2)))
                roll  = float(np.arctan2(rot_mat[1][0], rot_mat[0][0]))

                face_data["headPitch"] = pitch
                face_data["headYaw"]   = yaw
                face_data["headRoll"]  = roll

                # ── Blendshapes yeux ──────────────────────────────────────────
                eyes = extract_eyes(lm)
                face_data.update(eyes)

                # ── Affichage debug ───────────────────────────────────────────
                cv2.putText(debug,
                    f"yaw:{np.degrees(yaw):.1f} pitch:{np.degrees(pitch):.1f} roll:{np.degrees(roll):.1f}",
                    (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 0), 1)
                cv2.putText(debug,
                    f"blink L:{eyes['eyeBlinkLeft']:.2f} R:{eyes['eyeBlinkRight']:.2f}",
                    (10, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
                cv2.putText(debug, "Face tracked", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 0), 2)
        else:
            cv2.putText(debug, "No face", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 200), 2)

        cv2.imshow("Debug - Face Mesh", debug)

        key = cv2.waitKey(1)
        if key % 256 == 27:   # ESC
            break

cap.release()
cv2.destroyAllWindows()