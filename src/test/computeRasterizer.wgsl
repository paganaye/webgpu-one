struct ColorBuffer {
  values: array<atomic<u32>>,
};

struct UBO {
  screenWidth: f32,
  screenHeight: f32,
  modelViewProjectionMatrix: mat4x4<f32>,
};

struct Vertex { x: f32, y: f32, z: f32, };

struct VertexBuffer {
  values: array<Vertex>,
};

@group(0) @binding(0) var<storage, read_write> outputColorBuffer : ColorBuffer;
@group(0) @binding(1) var<storage, read> vertexBuffer : VertexBuffer;
@group(0) @binding(2) var<uniform> uniforms : UBO;

// From: https://github.com/ssloy/tinyrenderer/wiki/Lesson-2:-Triangle-rasterization-and-back-face-culling
fn barycentric(v1: vec3<f32>, v2: vec3<f32>, v3: vec3<f32>, p: vec2<f32>) -> vec3<f32> {
    let u = cross(
        vec3<f32>(v3.x - v1.x, v2.x - v1.x, v1.x - p.x),
        vec3<f32>(v3.y - v1.y, v2.y - v1.y, v1.y - p.y)
    );

    if abs(u.z) < 1.0 {
        return vec3<f32>(-1.0, 1.0, 1.0);
    }

    return vec3<f32>(1.0 - (u.x + u.y) / u.z, u.y / u.z, u.x / u.z);
}

fn get_min_max(v1: vec3<f32>, v2: vec3<f32>, v3: vec3<f32>) -> vec4<f32> {
    var min_max = vec4<f32>();
    min_max.x = min(min(v1.x, v2.x), v3.x);
    min_max.y = min(min(v1.y, v2.y), v3.y);
    min_max.z = max(max(v1.x, v2.x), v3.x);
    min_max.w = max(max(v1.y, v2.y), v3.y);

    return min_max;
}

fn color_pixel(x: u32, y: u32, r: u32, g: u32, b: u32) {
    let pixelID = u32(x + y * u32(uniforms.screenWidth)) * 3u;

    atomicMin(&outputColorBuffer.values[pixelID + 0u], r);
    atomicMin(&outputColorBuffer.values[pixelID + 1u], g);
    atomicMin(&outputColorBuffer.values[pixelID + 2u], b);
}

fn draw_quad(p0: vec3<f32>, p1: vec3<f32>, p2: vec3<f32>, p3: vec3<f32>,p4: vec3<f32>, p5: vec3<f32>, p6: vec3<f32>, p7: vec3<f32>, p8: vec3<f32>) {
/*
    let min_max = get_min_max(v1, v2, v3);
    let startX = u32(min_max.x);
    let startY = u32(min_max.y);
    let endX = u32(min_max.z);
    let endY = u32(min_max.w);

    for (var x: u32 = startX; x <= endX; x = x + 1u) {
        for (var y: u32 = startY; y <= endY; y = y + 1u) {
            let bc = barycentric(v1, v2, v3, vec2<f32>(f32(x), f32(y)));
            let color = (bc.x * v1.z + bc.y * v2.z + bc.z * v3.z) * 50.0 - 400.0;

            let R = color;
            let G = color;
            let B = color;

            if bc.x >= 0.0 && bc.y >= 0.0 && bc.z >= 0.0 {
                color_pixel(x, y, u32(R), u32(G), u32(B));
            }
        }
    }

    for (var x: u32 = 0; x <= 255; x = x + 1u) {
        for (var y: u32 = 0; y <= 255; y = y + 1u) {
            // let bc = barycentric(v1, v2, v3, vec2<f32>(f32(x), f32(y)));
            let color = 128;

            let R = color;
            let G = color;
            let B = color;

            //if bc.x >= 0.0 && bc.y >= 0.0 && bc.z >= 0.0 {
                color_pixel(x, y, u32(R), u32(G), u32(B));
            //}
        }
    }

*/

    var v: f32 = 0.0;
    //context.lineWidth = 1.5;
    var step: f32 = 1.0 / 256.0;

    loop {
        var vSqr: f32 = v * v;
        var mv: f32 = 1.0 - v;
        var mvSqr: f32 = mv * mv;
        var tmvv: f32 = 2.0 * mv * v;

        var u: f32 = 0.0;
        loop {
            var uSqr: f32 = u * u;
            var mu: f32 = 1.0 - u;
            var tmuu: f32 = 2.0 * mu * u;
            var muSqr: f32 = mu * mu;
            var x: f32;
            var y: f32;
            var z: f32;

            var xh: f32 = muSqr * p0.x + tmuu * p1.x + uSqr * p2.x;
            var yh: f32 = muSqr * p0.y + tmuu * p1.y + uSqr * p2.y;
            var zh: f32 = muSqr * p0.z + tmuu * p1.z + uSqr * p2.z;

            var xm: f32 = muSqr * p3.x + tmuu * p4.x + uSqr * p5.x;
            var ym: f32 = muSqr * p3.y + tmuu * p4.y + uSqr * p5.y;
            var zm: f32 = muSqr * p3.z + tmuu * p4.z + uSqr * p5.z;

            var xl: f32 = muSqr * p6.x + tmuu * p7.x + uSqr * p8.x;
            var yl: f32 = muSqr * p6.y + tmuu * p7.y + uSqr * p8.y;
            var zl: f32 = muSqr * p6.z + tmuu * p7.z + uSqr * p8.z;

            x = mvSqr * xh + tmvv * xm + vSqr * xl;
            y = mvSqr * yh + tmvv * ym + vSqr * yl;
            z = mvSqr * zh + tmvv * zm + vSqr * zl;

            //  var pt = project(Point(x, y, z));
            //   if (pt != null) {
            //     var rgbo = getPixel(u * 256.0, v * 256.0);
            //     context.fillStyle = vec4<f32>(rgbo.r / 255.0, rgbo.g / 255.0, rgbo.b / 255.0, 1.0);
            //     context.fillRect(pt.x, pt.y, 2.0, 2.0);
            //   }
            let color = 128;

            let R = color;
            let G = color;
            let B = color;
            color_pixel(u32(x), u32(y), u32(R), u32(G), u32(B));

            u += step;
            if (u > 1.0) {
                break;
            }
        }
        v += step;
        if (v > 1.0) {
            break;
        }
    }
}



fn project(v: Vertex) -> vec3<f32> {
    var screenPos = uniforms.modelViewProjectionMatrix * vec4<f32>(v.x, v.y, v.z, 1.0);
    screenPos.x = (screenPos.x / screenPos.w) * uniforms.screenWidth;
    screenPos.y = (screenPos.y / screenPos.w) * uniforms.screenHeight;

    return vec3<f32>(screenPos.x, screenPos.y, screenPos.w);
}

fn is_off_screen(v: vec3<f32>) -> bool {
    if v.x < 0.0 || v.x > uniforms.screenWidth || v.y < 0.0 || v.y > uniforms.screenHeight {
        return true;
    }

    return false;
}

@compute @workgroup_size(256, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x * 9u;

    let v0 = project(vertexBuffer.values[index + 0u]);
    let v1 = project(vertexBuffer.values[index + 1u]);
    let v2 = project(vertexBuffer.values[index + 2u]);
    let v3 = project(vertexBuffer.values[index + 3u]);
    let v4 = project(vertexBuffer.values[index + 4u]);
    let v5 = project(vertexBuffer.values[index + 5u]);
    let v6 = project(vertexBuffer.values[index + 6u]);
    let v7 = project(vertexBuffer.values[index + 7u]);
    let v8 = project(vertexBuffer.values[index + 8u]);

    if is_off_screen(v0) 
        && is_off_screen(v1) 
        && is_off_screen(v2) 
        && is_off_screen(v3) 
        && is_off_screen(v4) 
        && is_off_screen(v5) 
        && is_off_screen(v6) 
        && is_off_screen(v7)
        && is_off_screen(v8) {
        return;
    }

    draw_quad(v0, v1, v2, v3, v4, v5, v6, v7, v8);
}


@compute @workgroup_size(256, 1)
fn clear(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x * 3u;

    atomicStore(&outputColorBuffer.values[index + 0u], 255u);
    atomicStore(&outputColorBuffer.values[index + 1u], 255u);
    atomicStore(&outputColorBuffer.values[index + 2u], 255u);
}
