<script lang="ts">
import { log } from "@tensorflow/tfjs";

import { onMount } from "svelte";

    import Predictor from "../utils/predict_ml"
    let gridContent = "---------".split("")
    
    let predictor: Predictor
    let cellClicked
    let ai
    let human
    let currentPlayer = null

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
<div class="container">
    {#if currentPlayer}
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
    {/if}

    <div class="buttons">
        {#if !currentPlayer}
        <button on:click={choosePlayer.bind(this, 'ai')}>Computer first</button>
        {/if}
        <div>
            {#if currentPlayer === ai}
            <span>Computer's turn</span>
            {:else if currentPlayer === human}
            <span>Your turn</span>
            {:else}
            <span>Choose first player</span>
            {/if}
        </div>
        {#if !currentPlayer}
        <button on:click={choosePlayer.bind(this, 'human')}>You first</button>
        {/if}
    </div>
</div>