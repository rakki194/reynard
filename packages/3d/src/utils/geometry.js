// 3D geometry utilities and helpers
/**
 * Create a 3D vector
 */
export function createVector3(x = 0, y = 0, z = 0) {
    return { x, y, z };
}
/**
 * Add two 3D vectors
 */
export function addVector3(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}
/**
 * Subtract two 3D vectors
 */
export function subtractVector3(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    };
}
/**
 * Multiply a 3D vector by a scalar
 */
export function multiplyVector3(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar,
        z: vector.z * scalar,
    };
}
/**
 * Calculate the length of a 3D vector
 */
export function lengthVector3(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}
/**
 * Normalize a 3D vector
 */
export function normalizeVector3(vector) {
    const len = lengthVector3(vector);
    if (len === 0)
        return createVector3();
    return multiplyVector3(vector, 1 / len);
}
/**
 * Calculate the distance between two 3D points
 */
export function distanceVector3(a, b) {
    return lengthVector3(subtractVector3(a, b));
}
/**
 * Calculate the dot product of two 3D vectors
 */
export function dotVector3(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
/**
 * Calculate the cross product of two 3D vectors
 */
export function crossVector3(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}
/**
 * Linear interpolation between two 3D vectors
 */
export function lerpVector3(a, b, t) {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
    };
}
/**
 * Create a bounding box from an array of 3D points
 */
export function createBoundingBox(points) {
    if (points.length === 0) {
        return {
            min: createVector3(),
            max: createVector3(),
        };
    }
    let minX = points[0].x;
    let minY = points[0].y;
    let minZ = points[0].z;
    let maxX = points[0].x;
    let maxY = points[0].y;
    let maxZ = points[0].z;
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        minZ = Math.min(minZ, point.z);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        maxZ = Math.max(maxZ, point.z);
    }
    return {
        min: createVector3(minX, minY, minZ),
        max: createVector3(maxX, maxY, maxZ),
    };
}
/**
 * Calculate the center of a bounding box
 */
export function centerBoundingBox(box) {
    return {
        x: (box.min.x + box.max.x) / 2,
        y: (box.min.y + box.max.y) / 2,
        z: (box.min.z + box.max.z) / 2,
    };
}
/**
 * Calculate the size of a bounding box
 */
export function sizeBoundingBox(box) {
    return {
        x: box.max.x - box.min.x,
        y: box.max.y - box.min.y,
        z: box.max.z - box.min.z,
    };
}
/**
 * Check if a point is inside a bounding box
 */
export function isPointInBoundingBox(point, box) {
    return (point.x >= box.min.x &&
        point.x <= box.max.x &&
        point.y >= box.min.y &&
        point.y <= box.max.y &&
        point.z >= box.min.z &&
        point.z <= box.max.z);
}
/**
 * Expand a bounding box to include a point
 */
export function expandBoundingBox(box, point) {
    return {
        min: {
            x: Math.min(box.min.x, point.x),
            y: Math.min(box.min.y, point.y),
            z: Math.min(box.min.z, point.z),
        },
        max: {
            x: Math.max(box.max.x, point.x),
            y: Math.max(box.max.y, point.y),
            z: Math.max(box.max.z, point.z),
        },
    };
}
/**
 * Convert HSL to RGB
 */
export function hslToRgb(h, s, l) {
    const hue2rgb = (p, q, t) => {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r, g, b];
}
/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h, s, l];
}
/**
 * Generate a random color
 */
export function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
}
/**
 * Generate a color from a hash string
 */
export function colorFromHash(str) {
    const hash = str.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return hslToRgb(hue / 360, 0.7, 0.6);
}
/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Map a value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
/**
 * Generate points in a sphere
 */
export function generateSpherePoints(center, radius, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        // Generate random point on unit sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        points.push({
            x: center.x + x,
            y: center.y + y,
            z: center.z + z,
        });
    }
    return points;
}
/**
 * Generate points in a cube
 */
export function generateCubePoints(center, size, count) {
    const points = [];
    // const halfSize = size / 2;
    for (let i = 0; i < count; i++) {
        points.push({
            x: center.x + (Math.random() - 0.5) * size,
            y: center.y + (Math.random() - 0.5) * size,
            z: center.z + (Math.random() - 0.5) * size,
        });
    }
    return points;
}
