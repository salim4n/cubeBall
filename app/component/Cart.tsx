import { RapierRigidBody, RigidBody, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import RLAgent from '../utils/utils'
import * as tfvis from '@tensorflow/tfjs-vis'

const plateGeometry = new THREE.BoxGeometry(3, 0.1, 3)
const plateMaterial = new THREE.MeshStandardMaterial({ color: 'blue' })
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'red' })
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 'green' })
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)

interface CartProps {
    position?: [number, number, number]
}

const MAX_STEPS = 1000

export default function Cart({ position }: CartProps) {
    const plateRef = useRef<RapierRigidBody>(null)
    const [ballPosition, setBallPosition] = useState([0, 2, 0])
    const ballRef = useRef<RapierRigidBody>(null)
    const { rapier } = useRapier()
    const [reward, setReward] = useState(0)
    const [episode, setEpisode] = useState(0)
    const [steps, setSteps] = useState(0)
    const [totalReward, setTotalReward] = useState(0)
    const [done, setDone] = useState(false)
    const agent = useRef(new RLAgent())
    const rewardsHistory = useRef<{ reward: number, episode: number }[]>([])
    const [clicked, setClicked] = useState(false)

    function makeRandomXImpulse() {
        if (ballRef.current) {
            const impulse = { x: Math.random() * 2 - 1, y: 0, z: 0 }
            console.log('Applying impulse to ball:', impulse)
            ballRef.current.applyImpulse(impulse, true)
            setBallPosition([ballRef.current.translation().x, ballRef.current.translation().y, ballRef.current.translation().z])
            agent.current.predict([ballPosition[0], ballPosition[1], ballPosition[2]]).then((action) => {
                if (plateRef.current) {
                    console.log('Applying rotation action to plate:', action)
                    const currentRotation = plateRef.current.rotation()
                    const newRotationZ = action[0] === 0 ? currentRotation.z + 0.1 : currentRotation.z - 0.1
                    plateRef.current.setRotation({ ...currentRotation, z: newRotationZ }, true)
                }
            })
        }
    }

    function calculateReward(ballPos: number[]): number {
        return ballPos[1] > 0 ? 1 : -1
    }

    function reset() {
        if (ballRef.current) {
            console.log('Resetting ball position')
            ballRef.current.setTranslation({ x: 0, y: 2, z: 0 }, true)
            ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
            ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
        }
        if (plateRef.current) {
            console.log('Resetting plate position and rotation')
            plateRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
            plateRef.current.setTranslation({ x: 0, y: 0, z: 0 }, true)
        }
    }

    async function step() {
        const currentState = [ballPosition[0], ballPosition[1], ballPosition[2]]
        console.log('Current state:', currentState)
        const action = await agent.current.act(currentState)
        console.log('Agent action:', action)

        if (plateRef.current) {
            const currentRotation = plateRef.current.rotation()
            const newRotationZ = action === 0 ? currentRotation.z + 0.1 : currentRotation.z - 0.1
            console.log('Applying new rotation to plate:', newRotationZ)
            plateRef.current.setRotation({ ...currentRotation, z: newRotationZ }, true)
        }

        if (ballRef.current) {
            const nextState = [ballRef.current.translation().x, ballRef.current.translation().y, ballRef.current.translation().z]
            console.log('Next state:', nextState)
            setBallPosition(nextState)

            const newReward = calculateReward(nextState)
            console.log('New reward:', newReward)
            await agent.current.train(currentState, action, newReward, nextState, nextState[1] <= 0)

            setReward(prev => prev + newReward)
            setSteps(prev => prev + 1)
            if (steps >= MAX_STEPS || nextState[1] <= 0) {
                setDone(true)
            }
        }
    }

    useFrame(() => {
        if (steps <= MAX_STEPS && !done) {
            step()
        }
    })

    useEffect(() => {
        if (ballPosition[1] < -1 || done) {
            reset()
            setEpisode(prev => prev + 1)
            setSteps(0)
            setTotalReward(prev => prev + reward)
            setReward(0)
            setDone(false)
            agent.current.decayEpsilon()

            rewardsHistory.current.push({ reward, episode })
            tfvis.show.history(tfvis.visor().surface({ name: 'Rewards', tab: 'Training' }), rewardsHistory.current, ['reward'])
        }
    }, [ballPosition, done])

    return (
        <>
            <mesh geometry={cubeGeometry} material={cubeMaterial} position={[-10, 0, 0]} onClick={makeRandomXImpulse} />
            <RigidBody ref={plateRef} type="fixed" colliders="cuboid" scale={[1, 0.8, 0.6]}>
                <mesh geometry={plateGeometry} material={plateMaterial} scale={[1, 0.8, 0.6]} />
            </RigidBody>
            <RigidBody ref={ballRef} colliders="ball" type="dynamic" position={position}>
                <mesh geometry={sphereGeometry} material={sphereMaterial} />
            </RigidBody>
        </>
    )
}
