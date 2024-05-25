

export default function Light(){
    return (
        <>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
        </>
    );
}