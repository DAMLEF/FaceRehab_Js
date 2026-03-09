import numpy as np

# ── Indices landmarks ─────────────────────────────────────────────────────────

# EAR : 6 points par œil (haut x2, bas x2, coins gauche/droite)
LEFT_EYE  = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33,  160, 158, 133, 153, 144]

# Iris (disponible avec refine_landmarks=True)
LEFT_IRIS  = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]

# Paupière basse (pour squint)
LEFT_EYE_LOWER  = [374, 380, 381, 382, 362]
RIGHT_EYE_LOWER = [145, 153, 154, 155, 133]

# ── EAR ───────────────────────────────────────────────────────────────────────

def eye_aspect_ratio(landmarks, indices):
    """
    Calcule le ratio hauteur / largeur de l'œil (Eye Aspect Ratio).
    Plus la valeur est basse, plus l'œil est fermé.
    """
    p = [np.array([landmarks[i].x, landmarks[i].y]) for i in indices]
    # Distances verticales
    v1 = np.linalg.norm(p[1] - p[5])
    v2 = np.linalg.norm(p[2] - p[4])
    # Distance horizontale
    h  = np.linalg.norm(p[0] - p[3])
    return (v1 + v2) / (2.0 * h)


def clamp01(v):
    return float(np.clip(v, 0.0, 1.0))


def remap(v, in_min, in_max):
    """Remappe v depuis [in_min, in_max] vers [0, 1]."""
    return clamp01((v - in_min) / (in_max - in_min))

# ── Valeurs de référence (calibrées empiriquement) ───────────────────────────
# EAR œil ouvert normal ≈ 0.25, fermé ≈ 0.05, grand ouvert ≈ 0.35
EAR_OPEN   = 0.25
EAR_CLOSED = 0.07
EAR_WIDE   = 0.35

# ── Extraction blendshapes yeux ───────────────────────────────────────────────

def extract_eyes(landmarks):
    """
    Retourne un dict avec les blendshapes liés aux yeux.
    Toutes les valeurs sont dans [0.0, 1.0].
    """
    ear_l = eye_aspect_ratio(landmarks, LEFT_EYE)
    ear_r = eye_aspect_ratio(landmarks, RIGHT_EYE)

    # ── Blink : 1.0 = œil fermé ──────────────────────────────────────────────
    blink_l = remap(ear_l, EAR_OPEN, EAR_CLOSED)
    blink_r = remap(ear_r, EAR_OPEN, EAR_CLOSED)

    # ── Wide : 1.0 = œil grand ouvert ────────────────────────────────────────
    wide_l = remap(ear_l, EAR_OPEN, EAR_WIDE)
    wide_r = remap(ear_r, EAR_OPEN, EAR_WIDE)

    # ── Squint : plissement — paupière basse qui monte ────────────────────────
    # On utilise le ratio EAR mais depuis le bas uniquement
    # Approximation : squint actif quand l'œil est à demi-fermé sans être blink
    squint_l = clamp01(remap(ear_l, EAR_OPEN, EAR_OPEN * 0.6) * (1.0 - blink_l))
    squint_r = clamp01(remap(ear_r, EAR_OPEN, EAR_OPEN * 0.6) * (1.0 - blink_r))

    # ── Regard (iris) ─────────────────────────────────────────────────────────
    look = extract_eye_look(landmarks)

    return {
        "eyeBlinkLeft":    blink_l,
        "eyeBlinkRight":   blink_r,
        "eyeWideLeft":     wide_l,
        "eyeWideRight":    wide_r,
        "eyeSquintLeft":   squint_l,
        "eyeSquintRight":  squint_r,
        **look
    }


def extract_eye_look(landmarks):
    """
    Estime la direction du regard depuis la position de l'iris
    par rapport au coin de l'œil.
    """
    def iris_offset(iris_ids, eye_ids):
        iris_center = np.mean(
            [[landmarks[i].x, landmarks[i].y] for i in iris_ids], axis=0
        )
        eye_left  = np.array([landmarks[eye_ids[0]].x, landmarks[eye_ids[0]].y])
        eye_right = np.array([landmarks[eye_ids[3]].x, landmarks[eye_ids[3]].y])
        eye_top   = np.array([landmarks[eye_ids[1]].x, landmarks[eye_ids[1]].y])
        eye_bot   = np.array([landmarks[eye_ids[5]].x, landmarks[eye_ids[5]].y])

        eye_w = np.linalg.norm(eye_right - eye_left)
        eye_h = np.linalg.norm(eye_bot   - eye_top)
        eye_center = (eye_left + eye_right) / 2

        dx = (iris_center[0] - eye_center[0]) / (eye_w * 0.5 + 1e-6)
        dy = (iris_center[1] - eye_center[1]) / (eye_h * 0.5 + 1e-6)
        return dx, dy   # [-1, 1]

    dx_l, dy_l = iris_offset(LEFT_IRIS,  LEFT_EYE)
    dx_r, dy_r = iris_offset(RIGHT_IRIS, RIGHT_EYE)

    return {
        # Regard horizontal
        "eyeLookInLeft":   clamp01( dx_l),   # iris vers le nez (droite pour œil gauche)
        "eyeLookOutLeft":  clamp01(-dx_l),   # iris vers l'extérieur
        "eyeLookInRight":  clamp01(-dx_r),
        "eyeLookOutRight": clamp01( dx_r),
        # Regard vertical
        "eyeLookUpLeft":   clamp01(-dy_l),   # dy négatif = vers le haut en image
        "eyeLookDownLeft": clamp01( dy_l),
        "eyeLookUpRight":  clamp01(-dy_r),
        "eyeLookDownRight":clamp01( dy_r),
    }