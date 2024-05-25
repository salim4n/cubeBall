import { RapierRigidBody, RigidBody, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as tf from '@tensorflow/tfjs'
import { createModel, trainModel } from '../utils/utils'

const plateGeometry = new THREE.BoxGeometry(3, 0.1, 3)
const plateMaterial = new THREE.MeshStandardMaterial({ color: 'blue' })
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'red' })

interface CartProps {
    position?: [number, number, number];
}

export default function Cart({ position }: CartProps) {

    const plateRef = useRef<RapierRigidBody>(null)
    const [ballPosition, setBallPosition] = useState([0, 2, 0]);
    const ballRef = useRef<RapierRigidBody>(null)
    const { rapier, world } = useRapier()
    const [model, _setModel ] = useState(createModel())

    function reset(){
        if(ballRef.current){
            ballRef.current.setTranslation({ x: 0, y: 1, z: 0 },true)
            ballRef.current.setLinvel({ x: 0, y: 0, z: 0 },true)
            ballRef.current.setAngvel({ x: 0, y: 0, z: 0 },true)
        }
    }

    function step(){
        const xs = tf.tensor2d([[ballPosition[0], ballPosition[1], ballPosition[2]]]) // Inclure les positions x, y et z
        const ys = tf.tensor2d([[1]])
        trainModel(model, xs, ys)
    }

    useFrame((state, delta) => {
        const ball = ballRef.current
        const plate = plateRef.current
        if (ball) {
            setBallPosition([ball.translation().x, ball.translation().y, ball.translation().z])
        }
        if (state.clock.elapsedTime % 2 < delta) {
            if (ball && plate) {
                const xs = tf.tensor2d([[ballPosition[0], ballPosition[2]]])
                const prediction = tf.tidy(() => model.predict(xs) as tf.Tensor1D).arraySync()[0]
                const impulse = new rapier.Vector3(prediction, 0, 0)
                plate.applyImpulse(impulse, true)
            }
        }

    });

    useEffect(() => {
        if (ballPosition[1] < -1){
            reset()
        }
        return () => {
            tf.dispose()
        }
    }, [ballPosition])

    return (
        <>
            <RigidBody ref={plateRef} type="fixed" colliders="cuboid" scale={[0.8,0.8,0.4]} >
                <mesh geometry={plateGeometry} material={plateMaterial} scale={[0.8,0.8,0.4]} />
            </RigidBody>
            <RigidBody ref={ballRef} colliders="ball" type="dynamic" position={position}>
                <mesh geometry={sphereGeometry} material={sphereMaterial} />
            </RigidBody>
        </>
    )
}
