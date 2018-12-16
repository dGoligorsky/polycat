const renderer = new THREE.WebGLRenderer({
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0xffffff)
renderer.shadowMap.enabled = true

const sectionTag = document.querySelector("section")
sectionTag.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.z = -900

const ambientLight = new THREE.AmbientLight(0xcccccc)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xcccccc, 0.5)
directionalLight.position.set(100, 200, -200)
directionalLight.castShadow = true

// all the crap you also need to specify so the light casts a shadow
directionalLight.shadow.mapSize.width = 3000
directionalLight.shadow.mapSize.height = 3000
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 10000
directionalLight.shadow.camera.top = 1000
directionalLight.shadow.camera.bottom = -1000
directionalLight.shadow.camera.left = -1000
directionalLight.shadow.camera.right = 1000

scene.add(directionalLight)



// using JS promises. Creating a new promise function that is passed the mtl and obj asset. On resolve (when the files are successfully loaded) the function returns the object. Now you can use the loadFiles() function and add on a .then() method that easily adds new obj/mtls to the scene.
const loadFiles = function(mtlUrl, objUrl) {
    return new Promise((resolve, reject) => {
        const objLoader = new THREE.OBJLoader()
        const mtlLoader = new THREE.MTLLoader()
        
        mtlLoader.load(mtlUrl, function(materials) {
            objLoader.setMaterials(materials)
            objLoader.load(objUrl, function(obj) {
                resolve(obj)
            })
        })

    })
}


const objLoader = new THREE.OBJLoader()
const mtlLoader = new THREE.MTLLoader()


// here, loadFiles() runs and returns the obj/mtl and adds it to the scene 
// let earth = null
// loadFiles("assets/earth.mtl", "assets/earth.obj").then(function(obj) {
//     earth = obj
//     scene.add(earth)
// })

const addEye = function() {
    const loader = new THREE.TextureLoader()
    const texture = loader.load("assets/catseye.png")

    const geometry = new THREE.SphereGeometry(12, 128, 128)
    const material = new THREE.MeshLambertMaterial({
        map: texture
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotateY(Math.PI)
    
    return mesh
}


let cat = null 
let catColor = "#333333"
let catGroup = new THREE.Group()
scene.add(catGroup)
loadFiles("assets/cat.mtl", "assets/cat.obj").then(function(obj) {
    // reorient this cat
    obj.rotateX(Math.PI / 2)
    obj.rotateY(Math.PI)
    obj.position.y = -200

    // go through the model to update material b/c the cat mtl is messed up
    const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(catColor)
    })
    obj.traverse(child => {
        child.material = material
        child.castShadow = true
    })

    cat = obj
    catGroup.add(cat)
})

const addFloor = function() {
    const geometry = new THREE.CylinderGeometry(450, 500, 20, 64) // top radius, bottom radius, height, segments
    const material = new THREE.MeshLambertMaterial({
        color: 0xcccccc
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true

    return mesh
}

const floor = addFloor()
floor.position.y = -200
scene.add(floor)

const eye1 = addEye()
eye1.position.set(-32, 140, -209)
catGroup.add(eye1)

const eye2= addEye()
eye2.position.set(25, 140, -209)
catGroup.add(eye2)

let cameraAimX = 0
let cameraAimY = 0
let cameraAimZ = -900

let fly = new THREE.Vector3(0,0,-900) // fly will be what the cat looks at


const animate = function() {
// if (earth) {
//     earth.rotateY(0.01)
// }

    if (cat) {
    //     catGroup.rotateY(0.01)
    }

    const cameraDiffX = cameraAimX - camera.position.x
    const cameraDiffY = cameraAimY - camera.position.y
    const cameraDiffZ = cameraAimZ - camera.position.z

    camera.position.x = camera.position.x + cameraDiffX * 0.05
    camera.position.y = camera.position.y + cameraDiffY * 0.05
    camera.position.z = camera.position.z + cameraDiffZ * 0.05

    // eye1.lookAt(camera.position)
    // eye2.lookAt(camera.position)

    eye1.lookAt(fly)
    eye2.lookAt(fly)

    camera.lookAt(scene.position)
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

document.addEventListener("mousemove", function(event) {
    cameraAimX = (window.innerWidth / 2) - event.pageX
    cameraAimY = (window.innerHeight / 2) - event.pageY

    fly.set(cameraAimX * 1, cameraAimY * 2, -900)
})

document.addEventListener("wheel", function(event) {
    cameraAimZ = cameraAimZ + event.deltaY
    cameraAimZ = Math.max(-5000, cameraAimZ)
    cameraAimZ = Math.min(700, cameraAimZ)
    event.preventDefault()
})

document.addEventListener("touchstart", touch2Mouse, true);
document.addEventListener("touchmove", touch2Mouse, true);
document.addEventListener("touchend", touch2Mouse, true);

function touch2Mouse(e) {
  var theTouch = e.changedTouches[0];
  var mouseEv;

  switch(e.type)
  {
    case "touchstart": mouseEv="mousedown"; break;  
    case "touchend":   mouseEv="mouseup"; break;
    case "touchmove":  mouseEv="mousemove"; break;
    default: return;
  }

  var mouseEvent = document.createEvent("MouseEvent");
  mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
  theTouch.target.dispatchEvent(mouseEvent);

//   e.preventDefault();
}

window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
})


// to change the color of the cat with the color links in the html
// find the color links
const colorLinks = document.querySelectorAll("nav a")
// loop over each color link, add a click event
colorLinks.forEach(link => {
    link.addEventListener("click", function(event) {
        let transition = {color: catColor}
        const hex = this.style.backgroundColor

        TweenMax.to(transition, 0.5, {
            color: hex,
            onUpdate: function() {
                catColor = hex // this keeps setting the latest color to be the new color
                const material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(transition.color)
                })
        
                cat.traverse(child => {
                    child.material = material
                })
            }
        })




        event.preventDefault()
    })
})

document.addEventListener("click", function(event) {
    const mouse = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()

    mouse.set(
        (event.pageX / window.innerWidth) * 2 - 1,
        (event.pageY / window.innerHeight) * -2 + 1
    )

    raycaster.setFromCamera(mouse, camera)

    const intersections = raycaster.intersectObjects([eye1, eye2])

    intersections.forEach(intersection => {
        intersection.object.material = new THREE.MeshLambertMaterial({
            color: 0xff00ff
        })
    })
})