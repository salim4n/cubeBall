import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'

export const createModel = () => {
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 24, inputShape: [2], activation: 'relu' }))
    model.add(tf.layers.dense({ units: 24, activation: 'relu' }))
    model.add(tf.layers.dense({ units: 1, activation: 'tanh' }))
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })
    return model
}


export const trainModel = async(model : tf.Sequential, state: tf.Tensor2D, action: tf.Tensor2D) => {
    const xs = state
    const ys = action
    await model.fit(xs, ys, { epochs: 1, callbacks : {
        onEpochEnd: async (epoch, logs) => {
            tfvis.show.fitCallbacks({ name: 'Training Performance' }, ['loss'], { height: 200, callbacks: ['onEpochEnd'], zoomToFit: true, xLabel: 'epoch', yLabel: 'loss'})
        }
    } })
}


