import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'

class RLAgent {
    private model: tf.Sequential
    private targetModel: tf.Sequential
    private lossValues: { batch: number, loss: number }[] = []
    private isTraining: boolean = false
    private epsilon: number = 1.0
    private epsilonDecay: number = 0.99
    private epsilonMin: number = 0.01
    private gamma: number = 0.99
    private learningRate: number = 0.001

    constructor() {
        this.model = tf.sequential()
        this.model.add(tf.layers.dense({ units: 24, inputShape: [3], activation: 'relu' }))
        this.model.add(tf.layers.dense({ units: 24, activation: 'relu' }))
        this.model.add(tf.layers.dense({ units: 2, activation: 'linear' }))
        this.model.compile({ optimizer: tf.train.adam(this.learningRate), loss: 'meanSquaredError' })

        this.targetModel = tf.sequential()
        this.targetModel.add(tf.layers.dense({ units: 24, inputShape: [3], activation: 'relu' }))
        this.targetModel.add(tf.layers.dense({ units: 24, activation: 'relu' }))
        this.targetModel.add(tf.layers.dense({ units: 2, activation: 'linear' }))
        this.targetModel.compile({ optimizer: tf.train.adam(this.learningRate), loss: 'meanSquaredError' })
      }

  async train(state: number[], action: number, reward: number, nextState: number[], done: boolean) {
    if (this.isTraining) return
    this.isTraining = true

    const target = reward + (1 - +done) * this.gamma * (await this.targetModel.predict(tf.tensor2d([nextState])) as tf.Tensor).max().dataSync()[0]
    const targetF = (await this.model.predict(tf.tensor2d([state])) as tf.Tensor).dataSync()
    targetF[action] = target

    const history = await this.model.fit(tf.tensor2d([state]), tf.tensor2d([targetF as unknown as number[]]))
    this.lossValues.push({ batch: this.lossValues.length, loss: history.history.loss[0] as number})
    tfvis.show.history(tfvis.visor().surface({ name: 'Training Loss', tab: 'Training' }), this.lossValues, ['loss'])

    this.updateTargetModel()
    this.isTraining = false
  }

   updateTargetModel() {
    this.targetModel.setWeights(this.model.getWeights())
  }
  
  async act(state: number[]): Promise<number> {
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * 2)
    } else {
      return (this.model.predict(tf.tensor2d([state])) as tf.Tensor).argMax(1).dataSync()[0]
    }
  }

  async predict(state: number[]): Promise<number[]> {
    return (this.model.predict(tf.tensor2d([state])) as tf.Tensor).dataSync() as unknown as number[]
  
  }

  decayEpsilon() {
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay
    }
  }
}

export default RLAgent