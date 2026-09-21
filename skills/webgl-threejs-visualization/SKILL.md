---
name: webgl-threejs-visualization
description: 3D canvas rendering, shader optimization, asset loading, and interactive data visualization with Three.js and React Three Fiber.
metadata:
  origin: NEXUS-OS
---

# WebGL & Three.js Visualization

Use this skill to create high-performance 3D visualizers, hardware-accelerated data graphs, and interactive canvas components.

## Performance Checklist

1. **Dispose Geometries and Materials**: Explicitly call `geometry.dispose()` and `material.dispose()` on unmount to prevent GPU VRAM leaks.
2. **InstancedMesh**: Use `InstancedMesh` to render thousands of identical 3D data nodes with a single draw call.
3. **Limit Pixel Ratio**: Clamp canvas DPR to `Math.min(window.devicePixelRatio, 2)` to prevent mobile GPU throttling.
