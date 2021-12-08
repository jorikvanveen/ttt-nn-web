<script lang="ts">
    import Predictor from "../utils/predict_ml"
    let gridContent = "---------".split("")

    const predictor = new Predictor()

    const cellClicked = async (idx: number) => {
        console.log(idx)
        gridContent[idx] = "X"

        // Make prediction
        if (!predictor.isReady) await predictor.modelPromise
        let prediction = await predictor.predict(gridContent)
        gridContent[prediction] = "O"
        gridContent = gridContent
    }
</script>

<div class="grid">
    {#each {length: 3} as _,i}
        <div class="row">
            {#each {length: 3} as _,j}
                <div id="{(i*3+j).toString()}" class="cell" on:click={cellClicked.bind(this, i*3+j)}>
                    <div class="cellText">
                        {gridContent[i*3 + j]}
                    </div>
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    .grid {
        border: solid 3px black;
        width: 500px;
        height: 500px;
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
    }

    .cell {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        border-right: 1px solid black;
        border-top: 1px solid black;
    }
    
    .cellText {
        width: 0;
        height: 0;
        margin-bottom: 20px;
        font-size: 1.5rem;
        font-family: sans-serif;
        text-align: center;
    }
</style>