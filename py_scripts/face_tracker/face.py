"""
face.py — Estimation de pose faciale (solvePnP)
================================================
Fournit les utilitaires pour calculer la rotation et la position
de la tête dans l'espace caméra à partir des landmarks MediaPipe,
via la mise en correspondance avec un modèle 3D générique (6 points).
"""

import cv2
import numpy as np

# Ces 6 points forment un modèle de visage générique (fixe, en mm).
# solvePnP les met en correspondance avec les positions 2D détectées par MediaPipe
# pour calculer la rotation et position de la tête dans l'espace caméra
FACE_3D_MODEL = np.array([
    [  0.0,    0.0,    0.0 ],  # 1   nose tip
    [  0.0,  -63.6,  -12.5 ],  # 152 chin
    [-43.3,   32.7,  -26.0 ],  # 263 left eye corner
    [ 43.3,   32.7,  -26.0 ],  # 33  right eye corner
    [-28.9,  -28.9,  -24.1 ],  # 287 left mouth corner
    [ 28.9,  -28.9,  -24.1 ],  # 57  right mouth corner
], dtype=np.float64)

LANDMARK_IDS = [1, 152, 263, 33, 287, 57]


def get_face_pose(landmarks, W, H, cam_matrix, dist_coeffs):
    """
    Lance solvePnP sur les 6 points d'ancrage :
    Retourne les vecteurs rotation et translation propre à l'orientation du visage (rvec, tvec) 
    ou (None, None) en cas d'échec.
    """
    face_2d = np.array([
        [landmarks[i].x * W, landmarks[i].y * H]
        for i in LANDMARK_IDS
    ], dtype=np.float64)

    success, rvec, tvec = cv2.solvePnP(
        FACE_3D_MODEL, face_2d,
        cam_matrix, dist_coeffs,
        flags=cv2.SOLVEPNP_ITERATIVE
    )
    return (rvec, tvec) if success else (None, None)

def project_points(points_3d, rvec, tvec, cam_matrix, dist_coeffs):
    """Projection des points 3D propres au visage vers les coordonnées 2D de l'image."""
    projected, _ = cv2.projectPoints(
        np.array(points_3d, dtype=np.float64),
        rvec, tvec, cam_matrix, dist_coeffs
    )
    return projected.reshape(-1, 2).astype(np.int32) #OpenCV attend des coordonnées entières pour le rendu

def draw_debug_axes(frame, landmarks, W, H, rvec, tvec, cam_matrix, dist_coeffs):
    """Dessine les axes XYZ sur le bout du nez pour debug"""
    nose = (int(landmarks[1].x * W), int(landmarks[1].y * H))
    axis_pts = project_points(
        [[50,0,0], [0,50,0], [0,0,50]],
        rvec, tvec, cam_matrix, dist_coeffs
    )
    cv2.arrowedLine(frame, nose, tuple(axis_pts[0]), (0,   0, 255), 2)   # X rouge
    cv2.arrowedLine(frame, nose, tuple(axis_pts[1]), (0, 255,   0), 2)   # Y vert
    cv2.arrowedLine(frame, nose, tuple(axis_pts[2]), (255,  0,   0), 2)  # Z bleu