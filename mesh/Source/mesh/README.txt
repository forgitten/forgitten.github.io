The haze polygon subsystem defines and interface and subsequent implementation of a basic 3d mesh data structure and rasterizer. It should allow the armeture, articulation and keyframing of 3d polygon models. It is divided into two seperate systems, a polygon model interface and a rasterizer. It requires an existing matrix math library that must be able to handle 3d points with w components.




Scene3d - A scene contains an array or map of models contained in the scene, a camera defined by a position orientation and far and back plane, and a list of lights in the scene. It also contains a listing of the materials used in this scene that models can key into.

Bulb3d - A light source. for now I will constrain this engine to point lighting.

Model3d - A polygon model consisting of triangles

Animation3d - An animation that holds an index of bone names and time based keyframes applied to those positions

Vertex3d - A struct that holds a vertex's position, u/v coordinates, and texture/color data needed to get across it

View3d - the render engine that draws 3d shaded triangles onto a canvas.
Traingles should already be transformed into camera space before being sent here. Possibly add a feature to have a single matrix from world to camera space automatically applied?

