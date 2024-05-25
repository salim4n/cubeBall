import * as tf from '@tensorflow/tfjs'

export const createModel = () => {
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 24, inputShape: [2], activation: 'relu' }))
    model.add(tf.layers.dense({ units: 24, activation: 'relu' }))
    model.add(tf.layers.dense({ units: 1, activation: 'tanh' }))
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })
    return model
};

export const trainModel = async (model: { fit: (arg0: any, arg1: any, arg2: { batchSize: number; epochs: number; shuffle: boolean; callbacks: { onEpochEnd: (epoch: any, logs: any) => Promise<void>; }; }) => any; }, xs: any, ys: any) => {
    await model.fit(xs, ys, {
        batchSize: 32,
        epochs: 10,
        shuffle: true,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log(`Epoch: ${epoch} Loss: ${logs.loss}`)
            }
        }
    });
};