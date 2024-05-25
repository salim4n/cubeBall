import { RapierRigidBody, RigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useRef, useState } from 'react';

const plateGeometry = new THREE.BoxGeometry(3, 0.1, 3);
const plateMaterial = new THREE.MeshStandardMaterial({ color: 'blue' });
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'red' });

interface CartProps {
    position?: [number, number, number];
}

export default function Cart({ position }: CartProps) {
    const plateRef = useRef<RapierRigidBody>(null);
    const ballRef = useRef<RapierRigidBody>(null);
    const { rapier, world } = useRapier();
    const [model, setModel] = useState(null);

    return (
        <>
            <RigidBody ref={plateRef} type="fixed" colliders="cuboid" position={[0, 0, 0]}>
                <mesh geometry={plateGeometry} material={plateMaterial} />
            </RigidBody>
            <RigidBody ref={ballRef} colliders="ball" type="dynamic" position={[0, 1, 0]}>
                <mesh geometry={sphereGeometry} material={sphereMaterial} />
            </RigidBody>
    </>

    );
}
