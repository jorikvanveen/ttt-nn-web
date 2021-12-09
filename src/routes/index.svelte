<script lang="ts">
import { log } from "@tensorflow/tfjs";

import { onMount } from "svelte";

    import Predictor from "../utils/predict_ml"
    let gridContent = "---------".split("")
    
    let predictor: Predictor
    let cellClicked
    let ai
    let human
    let currentPlayer

    onMount(() => {
        predictor = new Predictor()

        cellClicked = async (idx: number) => {
            console.log(ai, human, currentPlayer);
            
            if(currentPlayer === human && gridContent[idx] == '-') {
                gridContent[idx] = human
                currentPlayer = ai
                botMove()
            }
            // Make prediction
            gridContent = gridContent
        }
    })

    async function botMove() {
        if (!predictor.isReady) await predictor.modelPromise
            let prediction = await predictor.predict(gridContent)
            console.log(prediction);
            
            if(gridContent[prediction] == '-') {    
                gridContent[prediction] = ai
                currentPlayer = human
            }
    }

    function choosePlayer(player) {
        if(player === 'ai') {
            ai='X';
            human='O';
            currentPlayer=ai
            botMove()
        } else if (player === 'human') {
            ai='O';
            human='X';
            currentPlayer=human
        }
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

<div>
    <button on:click={choosePlayer.bind(this, 'ai')}>Computer first</button>
    <button on:click={choosePlayer.bind(this, 'human')}>Human first</button>
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