<script lang="ts">
import { onMount } from "svelte";

    import Predictor from "../utils/predict_ml"
    import isArrayRepetetive from "../utils/is_array_repetetive"
import { diag } from "@tensorflow/tfjs";
    let gridContent = "---------".split("")
    
    let predictor: Predictor
    let cellClicked: (idx: number) => void
    let ai: string = "O"
    let currentPlayer: string

    let winner: string | null = null


    $: human = ai == "X" ? "O" : "X"

    const possibleMoves = () => {
        let moveCount = 0

        for (const cell in gridContent) {
            if (cell == "-") moveCount++
        }

        return moveCount
    }
    const onBoardChange = (board) => {
        // Check if this board is ended
        console.log("checking", board)

        for (let i = 0; i < 3; i++) {
            const col = [gridContent[i], gridContent[3+i], gridContent[6+i]]
            const row = [gridContent[i], gridContent[i*3+1], gridContent[i*3+2]]

            if (col[0] == "-" || row[0] == "-") continue

            if (isArrayRepetetive(col) && col[0] != "-") { 
                winner = col[0]
            }

            if (isArrayRepetetive(row) && row[0] != "-") {
                winner = row[0]
            }
        }
        
        const diag_1 = [gridContent[0], gridContent[4], gridContent[8]]
        const diag_2 = [gridContent[2], gridContent[4], gridContent[6]]

        if (isArrayRepetetive(diag_1) && diag_1[0] != "-") winner = diag_1[0]
        if (isArrayRepetetive(diag_2) && diag_2[0] != "-") winner = diag_2[0]

        if (!winner && gridContent.reduce((a, b) => b == "-" ? a + 1 : a, 0) == 0) {
            winner = "No one"
        }
    }

    $: onBoardChange(gridContent)

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

    function choosePlayer(player: string) {
        if(player === 'ai') {
            ai='X';
            currentPlayer=ai
            botMove()
        } else if (player === 'human') {
            ai='O';
            currentPlayer=human
        }
    }
</script>


{#if currentPlayer && !winner}
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
{:else if !currentPlayer}
<div>
    <button on:click={choosePlayer.bind(this, 'ai')}>Computer first</button>
    <button on:click={choosePlayer.bind(this, 'human')}>Human first</button>
</div>
{/if}

{#if winner}
    <p>{winner} wins!</p>
    <button on:click={() => window.location.reload()}>Restart</button>
{/if}


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