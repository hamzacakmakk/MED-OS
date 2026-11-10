"""Cobb angle estimate from detected vertebra boxes.

Pure Python (no model or framework imports) so it can be unit tested on its own.
`spine()` in yolo_choser.py runs the YOLO model and passes the boxes here.
"""
import math


def analyze_spine(detections):
    """detections: list of ([x1, y1, x2, y2], confidence) for each detected vertebra.

    Returns the same dict the API has always returned for spine images.
    """
    if len(detections) == 0:
        return {"analysis_result": "Omurga yapısı tespit edilemedi.", "findings": []}

    # 1. Centre point of every box
    centers = []
    for (x1, y1, x2, y2), confidence in detections:
        centers.append({
            "cx": (x1 + x2) / 2,
            "cy": (y1 + y2) / 2,
            "conf": float(confidence),
            "box": [x1, y1, x2, y2],
        })

    # A Cobb estimate needs at least three vertebrae
    if len(centers) < 3:
        return {"analysis_result": "Cobb açısı hesaplamak için yeterli omur tespit edilemedi (En az 3 omur gerekli).",
                "findings": centers}

    # 2. Sort top to bottom
    centers = sorted(centers, key=lambda p: p["cy"])

    # 3. Top, apex (middle) and bottom vertebra
    top_vertebra = centers[0]
    bottom_vertebra = centers[-1]
    apex_vertebra = centers[len(centers) // 2]

    angle1 = math.degrees(math.atan2(apex_vertebra["cy"] - top_vertebra["cy"],
                                     apex_vertebra["cx"] - top_vertebra["cx"]))
    angle2 = math.degrees(math.atan2(bottom_vertebra["cy"] - apex_vertebra["cy"],
                                     bottom_vertebra["cx"] - apex_vertebra["cx"]))

    # Difference between the two line angles, folded into the acute angle
    cobb_angle = abs(angle1 - angle2)
    if cobb_angle > 180:
        cobb_angle = 360 - cobb_angle
    if cobb_angle > 90:
        cobb_angle = 180 - cobb_angle
    cobb_angle = round(cobb_angle, 2)

    return {
        "analysis": f"Cobb Açısı: {cobb_angle}° - {grade(cobb_angle)}",
        "cobb_angle_degree": cobb_angle,
        "details": {
            "top_point": {"x": top_vertebra["cx"], "y": top_vertebra["cy"]},
            "apex_point": {"x": apex_vertebra["cx"], "y": apex_vertebra["cy"]},
            "bottom_point": {"x": bottom_vertebra["cx"], "y": bottom_vertebra["cy"]},
        },
        "detected_vertebrae_count": len(centers),
        "vertebrae": [c["box"] for c in centers],
    }


def grade(cobb_angle):
    """Scoliosis severity for a Cobb angle in degrees."""
    if cobb_angle < 10:
        return "Normal omurga hizalanması (Skolyoz bulgusu yok veya sadece postüral asimetri)."
    if cobb_angle < 20:
        return "Hafif derece skolyoz. Genellikle sadece gözlem ve düzenli kontrol önerilir."
    if cobb_angle < 40:
        return "Orta derece skolyoz. Korse tedavisi veya fizik tedavi değerlendirilebilir."
    return "İleri derece skolyoz. Cerrahi müdahale açısından ortopedi uzmanı değerlendirmesi gereklidir."
