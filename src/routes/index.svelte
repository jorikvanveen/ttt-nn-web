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
            const col = [gridContent[i], gridContent[3+i], gridContent[6+i]]
            const row = [gridContent[i*3], gridContent[i*3+1], gridContent[i*3+2]]

            if (col[0] == "-" || row[0] == "-") continue

            if (isArrayRepetetive(col) && col[0] != "-") {
                console.log(col);
                winner = col[0]
                submitData()
            }

            if (isArrayRepetetive(row) && row[0] != "-") {
                console.log(row);
                winner = row[0]
                submitData()
            }
        }
        
        const diag_1 = [gridContent[0], gridContent[4], gridContent[8]]
        const diag_2 = [gridContent[2], gridContent[4], gridContent[6]]

        if (isArrayRepetetive(diag_1) && diag_1[0] != "-") winner = diag_1[0]
        if (isArrayRepetetive(diag_2) && diag_2[0] != "-") winner = diag_2[0]

        if (!winner && gridContent.reduce((a, b) => b == "-" ? a + 1 : a, 0) == 0) {
            winner = "No one"
            submitData()
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
