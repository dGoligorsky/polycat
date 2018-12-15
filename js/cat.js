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

let cat = null 
let catGroup = new THREE.Group()
scene.add(catGroup)
loadFiles("assets/cat.mtl", "assets/cat.obj").then(function(obj) {
    // reorient this cat
    obj.rotateX(Math.PI / 2)
    obj.rotateY(Math.PI)
    obj.position.y = -200

    // go through the model to update material b/c the cat mtl is messed up
    const material = new THREE.MeshLambertMaterial({
        color: 0xff0000
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

    scene.add(mesh)
    return mesh
}

const floor = addFloor()
floor.position.y = -200

let cameraAimX = 0
let cameraAimY = 0
let cameraAimZ = -900


const animate = function() {
// if (earth) {
//     earth.rotateY(0.01)
// }

    if (cat) {
        catGroup.rotateY(0.01)
    }

    const cameraDiffX = cameraAimX - camera.position.x
    const cameraDiffY = cameraAimY - camera.position.y
    const cameraDiffZ = cameraAimZ - camera.position.z

    camera.position.x = camera.position.x + cameraDiffX * 0.05
    camera.position.y = camera.position.y + cameraDiffY * 0.05
    camera.position.z = camera.position.z + cameraDiffZ * 0.05

    camera.lookAt(scene.position)
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

document.addEventListener("mousemove", function(event) {
    cameraAimX = event.pageX - (window.innerWidth / 2)
    cameraAimY = event.pageY - (window.innerHeight / 2)
})

document.addEventListener("wheel", function(event) {
    cameraAimZ = cameraAimZ + event.deltaY
    cameraAimZ = Math.max(-5000, cameraAimZ)
    cameraAimZ = Math.min(700, cameraAimZ)
    event.preventDefault()
})

window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
})
