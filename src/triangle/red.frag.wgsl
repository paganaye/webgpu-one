@fragment
fn main() -> @location(0) vec4<f32> {
  // This function is the entry point of the shader and returns a vec4<f32> color value

  // The following line creates a vec4 with the values (1.0, 0.5, 0.0, 1.0)
  // which represents an orange color with an alpha value of 1.0 (fully opaque)
  return vec4(1.0, 0.5, 0.0, 1.0);
}

