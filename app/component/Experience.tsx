import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Light from "./Light";
import Scene from "./Scene";
import { Physics } from "@react-three/rapier";
import Cart from "./Cart";

export default function Experience(){
    return (
        <Canvas 
            style={{ width: '100vw', height: '100vh'}}
            camera={{ position: [5, 5, 20] }}
        >
                <OrbitControls makeDefault />
                <Light />
                <Physics debug>
                <Cart position={[0, 2, 0]} />
                </Physics>
        </Canvas>
    );
}