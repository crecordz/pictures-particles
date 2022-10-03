precision highp float;
attribute vec3 position;
attribute vec2 source;
attribute vec2 target;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float size;
uniform float blend;
uniform sampler2D sourceTex;
uniform sampler2D targetTex;
uniform vec2 dimensions;
varying vec3 vColor;

void main() {
	vec3 origin = vec3(source, 0.);
	vec3 destination = vec3(target, 0.);

	vec3 p =  mix(origin, destination, blend);

	vec3 d = destination - origin;

	float r = length(d);

	p.z = 0.5*r*sin(3.1415926*blend);

	vColor = vec3(1.0,0.,0.);
	vec2 uvSource = source/dimensions.x;
	vec2 uvTarget = target/dimensions.x;

	vColor = mix(texture2D(sourceTex, uvSource).rgb,
	 			 texture2D(targetTex, uvTarget).rgb, 
				 blend);
	p.xy -= .5*dimensions;
	p *= 1. / dimensions.x;
	p.y *= -1.;
	vec4 mvPosition = modelViewMatrix * vec4(p, 1.);
	gl_PointSize = size * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}