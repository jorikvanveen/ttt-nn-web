<script lang="ts">
import { onMount } from "svelte";

    import Predictor from "../utils/predict_ml"
    import isArrayRepetetive from "../utils/is_array_repetetive"
    let gridContent = "---------".split("")
    
    let predictor: Predictor 
    let currentPlayer: string | null = null
    let cellClicked: (idx: number) => void
    let ai: string = "O"
    let moveHistory: number[] = []
    let winner: string | null = null

    $: human = ai == "X" ? "O" : "X"

    const submitData = () => {
        console.log("Sending data")
        fetch("./submit_data", {
            method: "POST",
            body: JSON.stringify({
                timestamp: new Date(),
                first_move_was_human: human === "X",
                winner,
                moves: moveHistory
            })
        })
    }
    const onBoardChange = (board) => {
        // Check if this board is ended
        for (let i = 0; i < 3; i++) {
            const states = [[0,1,2],
                            [3,4,5],
                            [6,7,8],
                            [0,3,6],
                            [1,4,7],
                            [2,5,8],
                            [0,4,8],
                            [2,4,6]]

            for(const state of states) {
                let x = 0
                let o = 0
                for (const ind of state) {
                    if(gridContent[ind] === 'X') {
                        x+=1
                    } else if (gridContent[ind] === 'O') {
                        o+=1
                    }
                }
                if (x === 3 && !winner) {
                    winner = 'X'
                    submitData()
                } else if (o === 3 && !winner) {
                    winner = 'O'
                    submitData()
                }
            }
            if (!winner && gridContent.reduce((a, b) => b == "-" ? a + 1 : a, 0) == 0) {
                winner = "No one"
                submitData()
            }
        }
    }

    $: onBoardChange(gridContent)

    onMount(() => {
        predictor = new Predictor()

        cellClicked = async (idx: number) => {            
            if(currentPlayer === human && gridContent[idx] == '-' && !winner) {
                gridContent[idx] = human
                currentPlayer = ai
                botMove()
                moveHistory.push(idx)
                gridContent = gridContent
            }
        }
    })

    async function botMove() {
        if (!predictor.isReady) await predictor.modelPromise
        let prediction = await predictor.predict(gridContent)
        
        if(gridContent[prediction] == '-') {    
            gridContent[prediction] = ai
            currentPlayer = human
            moveHistory.push(prediction)
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


<div class="container">
    {#if currentPlayer}
    <div class="grid">
        {#each {length: 3} as _,i}
            <div class="row">
                {#each {length: 3} as _,j}
                    <div id="{(i*3+j).toString()}" class="cell" on:click={cellClicked.bind(this, i*3+j)}>
                        <div class="cellText">
                            {gridContent[i*3 + j] != "-" ? gridContent[i*3 + j] : ""}
                        </div>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
    {#if currentPlayer === ai && !winner}
    <span>Computer's turn</span>
    {:else if currentPlayer === human && !winner}
    <span>Your turn</span>
    {:else if winner}
    <span>
    {#if winner === ai}
    Computer wins!
    {:else if winner === human}
    You win!
    {:else}
    No one wins
    {/if}
    </span>
    <button class="btn" on:click={() => window.location.reload()}>Play again</button>
    {/if}

    {:else if !currentPlayer}
    <div class="buttons">
        <span style="display: block;">Choose starting player</span>
        <button class="btn" on:click={choosePlayer.bind(this, 'ai')}>Computer first</button>
        <button class="btn" on:click={choosePlayer.bind(this, 'human')}>You first</button>
    </div>
    {/if}
</div>
