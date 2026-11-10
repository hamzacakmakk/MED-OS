"""Tests for the Cobb angle estimate (no models or services needed).

Run from backend/full_api:  python -m pytest
"""
import json
import math
import os
import sys

import pytest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from app.spine_metrics import analyze_spine, grade  # noqa: E402

SAMPLE = os.path.join(HERE, "..", "..", "..", "frontend", "public", "samples", "spine-sample.json")


def box_at(cx, cy, w=60, h=40):
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]


def test_no_vertebrae():
    out = analyze_spine([])
    assert out["findings"] == []
    assert "tespit edilemedi" in out["analysis_result"]


def test_fewer_than_three_vertebrae():
    out = analyze_spine([(box_at(100, 100), 0.9), (box_at(100, 200), 0.8)])
    assert "En az 3 omur" in out["analysis_result"]
    assert len(out["findings"]) == 2


def test_straight_spine_is_zero_degrees():
    dets = [(box_at(200, y), 0.9) for y in range(100, 1100, 100)]
    out = analyze_spine(dets)
    assert out["cobb_angle_degree"] == 0
    assert out["detected_vertebrae_count"] == 10
    assert out["analysis"].startswith("Cobb Açısı: 0")


def test_known_bend():
    # top -> apex leans 20 degrees right of vertical, apex -> bottom leans 20 degrees left
    top, apex = (200, 100), (200 + 400 * math.tan(math.radians(20)), 500)
    bottom = (200, 900)
    dets = [(box_at(*p), 0.9) for p in (bottom, top, apex)]   # unsorted on purpose
    out = analyze_spine(dets)
    assert out["cobb_angle_degree"] == pytest.approx(40, abs=0.01)
    assert out["details"]["top_point"]["y"] == 100      # sorted top to bottom
    assert out["details"]["bottom_point"]["y"] == 900


def test_matches_saved_model_output():
    """Feeding the boxes the spine model produced for the sample X-ray gives the saved result."""
    with open(SAMPLE, encoding="utf-8") as f:
        saved = json.load(f)["analysis"]
    out = analyze_spine([(b, 0.9) for b in saved["vertebrae"]])
    assert out["cobb_angle_degree"] == pytest.approx(saved["cobb_angle_degree"], abs=0.02)
    assert out["detected_vertebrae_count"] == saved["detected_vertebrae_count"]
    for k in ("top_point", "apex_point", "bottom_point"):
        assert out["details"][k]["x"] == pytest.approx(saved["details"][k]["x"], abs=0.01)


@pytest.mark.parametrize("angle,word", [(5, "Normal"), (10, "Hafif"), (19.9, "Hafif"),
                                        (20, "Orta"), (39.9, "Orta"), (40, "İleri"), (70, "İleri")])
def test_grade_thresholds(angle, word):
    assert grade(angle).startswith(word)
