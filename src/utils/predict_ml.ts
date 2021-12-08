import * as tfjs from "@tensorflow/tfjs"

export default class Predictor {
    model: tfjs.LayersModel
    isReady: boolean
    modelPromise: Promise<void>
    constructor() {
        this.isReady = false

        let resolvePromise

        this.modelPromise = new Promise((resolve, _) => {
            resolvePromise = resolve
        })

        tfjs.loadLayersModel("./model.json").then((model) => {
            this.model = model
            this.isReady = true
            resolvePromise()
        }).catch(err => {
            console.error(err)
            alert("Model failed to load")
        })
    }

    async predict(inputGrid: string[]): Promise<number> {
        let processedInput: number[] = []

        for (const cell of inputGrid) {
            processedInput.push(
                cell == "-" ? 0 : cell == "X" ? 1 : 2
            )
        }

        const prediction: tfjs.Tensor2D = this.model.predict(tfjs.tensor2d(processedInput, [1,9])) as tfjs.Tensor2D
        const prediction_chances = (await prediction.array())[0]

        const index_chose = prediction_chances.indexOf(prediction_chances.reduce((prev, curr) => curr > prev ? curr : prev))
        return index_chose
    }
}