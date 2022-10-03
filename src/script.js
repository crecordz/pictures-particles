import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {gsap} from 'gsap';
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}
/**
 * Sizes
 */
 const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer()
 renderer.setSize(sizes.width, sizes.height)
 renderer.setPixelRatio(window.devicePixelRatio)
// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000);


var container = document.getElementById('container');
container.appendChild(renderer.domElement);
/**
 * Textures
 */
 function loadImages(paths,whenLoaded) {
    var imgs=[];
    paths.forEach(function(path) {
      var img = new Image;
      img.onload = function() {
        imgs.push(img);
        if (imgs.length===paths.length) whenLoaded(imgs);
      };
      img.src = path;
    });
  }

let images = ['/textures/00.jpg', '/textures/01.jpg']
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

let obj = [];
  images.forEach((img) => {
    obj.push({file:img});
  });
  console.log(obj);

let material

  loadImages(images,function(loadedImages) {


    obj.forEach((image,index) => {
      let img = loadedImages[index];
     
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      ctx.drawImage(img,0,0);

      

      let data = ctx.getImageData(0,0,canvas.width,canvas.height);

      let buffer = data.data;


      let rgb = [];
      let c = new THREE.Color();

      for (var i = 0; i < buffer.length; i=i+4) {
        c.setRGB(buffer[i],buffer[i+1],buffer[i+2]);
        rgb.push({c: c.clone(),id: i/4});
      }

    //   console.log(rgb);

      let result = new Float32Array(img.width*img.height*2);
      let j = 0;

      rgb.sort( function( a, b ) {
        return a.c.getHSL().s - b.c.getHSL().s;
      });
   

      rgb.forEach(e => {
        result[j] = e.id % img.width;
        result[j+1] = Math.floor(e.id / img.height);
        j= j +2;
      });


    //   console.log(result,'result');

      obj[index].image = img;
      obj[index].texture = new THREE.Texture(img);
      obj[index].buffer = result;
      obj[index].texture.needsUpdate = true;
      obj[index].texture.flipY = false;
    });
    

    // console.log(obj);


    var w = loadedImages[0].width;
    var h = loadedImages[0].height;

    let positions = new Float32Array(w*h*3);
    let index = 0;
    for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        positions[index*3] = j;
        positions[index*3+1] = i;
        positions[index*3+2] = 0;
        index++;
      }
    }

    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));

    geometry.setAttribute('source',new THREE.BufferAttribute(obj[0].buffer,2));
    geometry.setAttribute('target',new THREE.BufferAttribute(obj[1].buffer,2));

    material = new THREE.RawShaderMaterial( {
      uniforms: {
        sourceTex: { type: 't', value: obj[0].texture },
        targetTex: { type: 't', value: obj[1].texture },
        blend: { type: 'f', value: 0.0 },
        size: { type: 'f', value: 2.1 },//window.devicePixelRatio },
        dimensions: { type: 'v2', value: new THREE.Vector2(w,h) }
      },
      vertexShader: testVertexShader,
      fragmentShader: testFragmentShader
    });

    let points = new THREE.Points(geometry,material);
    scene.add(points);
  })

  const Sound = new Audio('/1.mp3')

  function effect(){
    if (material.uniforms.blend.value == 0.0){
      gsap.
      to(material.uniforms.blend, 2,{value:1},0) 
    }
    else{
      gsap.
      to(material.uniforms.blend, 2,{value:0},1) 
    }
    Sound.currentTime =0
   Sound.play()
  }
  renderer.domElement.addEventListener('click', () => {
    effect()
  })

debugObject.Next = () => {
  effect()
}  
gui.add(debugObject, 'Next')
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true



/**
 * Animate
 */
let time = 0
const tick = () =>
{
    time ++
   
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()