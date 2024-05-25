
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const floorMaterial = new THREE.MeshStandardMaterial({ color: 'graylight' })

interface SceneProps {
    position: [number, number, number]
    scale: [number, number, number]
    receiveShadow: boolean
    castShadow: boolean
}

export default function Scene({ position, scale, receiveShadow,castShadow }: SceneProps){
    return(
        <RigidBody type="fixed" position={position} scale={scale}>
            <mesh
                geometry={ boxGeometry } 
                material={ floorMaterial }
                position={ position } 
                scale={ scale } 
                receiveShadow={ receiveShadow }
                castShadow={ castShadow }
            />
        </RigidBody>
    )
}