"""
camera.py — Initialisation caméra et matrice intrinsèque
=========================================================
Ouvre le flux vidéo (compatible Windows/Linux/macOS) et fournit
la matrice de caméra approximative nécessaire à solvePnP.
"""

import cv2
import platform
import numpy as np

def open_camera(index=0):
    system = platform.system()
    
    if system == "Windows":
        cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(index)
    
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open camera at index {index}")
    
    ret, frame = cap.read()
    if not ret:
        raise RuntimeError("Cannot read from camera")
    
    H, W = frame.shape[:2]
    return cap, W, H

def get_camera_matrix(W, H):
    focal = W
    matrix = np.array([
        [focal,     0, W / 2],
        [    0, focal, H / 2],
        [    0,     0,     1]
    ], dtype=np.float64)
    dist_coeffs = np.zeros((4, 1), dtype=np.float64)
    return matrix, dist_coeffs