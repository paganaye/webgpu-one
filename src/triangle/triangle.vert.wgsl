// @vertex: This annotation specifies that the following function is a vertex shader. 
// Vertex shaders are responsible for processing individual vertices of a mesh 
// and determining their final positions in screen space.

@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4<f32> {
// This function is the entry point of the vertex shader and returns a vec4<f32> position value

// The following lines define an array of vec2<f32> positions representing vertices of a triangle
  var pos = array<vec2<f32>, 3>(
  vec2(0.0, 0.25),
  vec2(-0.5, -0.5),
  vec2(0.5, -0.5)
  );

// The vertex_index parameter represents the current index of the vertex being processed

// The return statement constructs a vec4<f32> position value using the vertex index
// It fetches the corresponding position from the pos array and sets the z and w components to 0.0 and 1.0 respectively
return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}

