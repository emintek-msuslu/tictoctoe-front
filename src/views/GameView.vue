<template>
  <v-container class="bg-transparent">
    <div
      class="container container-fluid mb-20"
      style="
        position: inherit;
        display: flex;
        padding-bottom: 20px;
        margin-bottom: 20px;
      "
    >
      <div style="margin: auto; width: 85%">
        <div style="float: left" class="player-card">
          <label class="player-name"> {{ transferData.firstPlayerName }}</label>
          <br />
          <label class="player-type">{{ transferData.firstPlayerType }}</label>
        </div>
        <div style="float: right" class="player-card">
          <label class="player-name">
            {{ transferData.secondPlayerName }}</label
          >
          <br />
          <label class="player-type">{{ transferData.secondPlayerType }}</label>
        </div>
      </div>
    </div>

    <div class="container">
      <div v-for="(row, rowIndex) in 3" :key="`row-${rowIndex}`">
        <v-row class="justify-center">
          <v-col
            cols="auto"
            v-for="(cell, cellIndex) in getRow(rowIndex)"
            :key="cellIndex"
          >
            <v-btn
              outlined
              tile
              large
              :class="getCellClasses(rowIndex, cellIndex)"
              :disabled="gameOver"
              @click="placeMove(rowIndex, cellIndex)"
            >
              {{ cell }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
    <v-dialog v-model="dialogVisible" max-width="300">
      <v-card>
        <v-card-title class="headline">{{ resultMessage }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialogVisible = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import router from "@/router";
import axios from "axios";
export default {
  data: () => ({
    wins: [
      [0, 1, 2],
      [0, 3, 6],
      [0, 4, 8],
      [1, 4, 7],
      [2, 4, 6],
      [2, 5, 8],
      [3, 4, 5],
      [6, 7, 8],
    ],
    board: Array(9).fill(null),
    count: 1,
    gameOver: false,
    winningCells: [],
    transferData: {
      gameId: "",
      firstPlayerName: "",
      secondPlayerName: "",
      firstPlayerType: "",
      secondPlayerType: "",
      token: "",
    },
    updateDatabase: {
      moves: "",
      id: "",
      result: "",
    },
    dialogVisible: false,
    resultMessage: "",
  }),
  mounted() {
    this.getTransferedData();
  },
  methods: {
    getCellClasses(rowIndex, cellIndex) {
      const boardIndex = rowIndex * 3 + cellIndex;
      return {
        "tic-tac-toe-button": true,
        "win-cell": this.winningCells.includes(boardIndex),
      };
    },
    placeMove(rowIndex, cellIndex) {
      const boardIndex = rowIndex * 3 + cellIndex;
      if (!this.board[boardIndex] && !this.gameOver) {
        const currentPlayer = this.count % 2 !== 0 ? "X" : "O";
        this.board[boardIndex] = currentPlayer;
        this.updateDatabase.moves += boardIndex + "-" + currentPlayer + ",";
        this.checkResult(currentPlayer);

        if (this.gameOver) {
          this.postToDatabase();
        }
        this.count++;
      }
    },
    postToDatabase() {
      console.log(this.updateDatabase);

      axios
        .post(
          "https://localhost:44352/api/game/updategame",
          this.updateDatabase,
          {
            headers: {
              Authorization: `Bearer ${this.transferData.token}`,
            },
          }
        )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === "401") {
            console.error("Unauthorized!");
          } else {
            console.error("Error:", error);
          }
        });
    },
    getTransferedData() {
      if (!localStorage.transferData) {
        router.push("/");
      } else {
        this.transferData = JSON.parse(localStorage.transferData);
        this.updateDatabase.id = this.transferData.gameId;
      }
    },
    checkResult(player) {
      for (let win of this.wins) {
        if (win.every((cell) => this.board[cell] === player)) {
          this.gameOver = true;
          this.winningCells = win;
          const winnerName =
            player === this.transferData.firstPlayerType
              ? this.transferData.firstPlayerName
              : this.transferData.secondPlayerName;
          this.resultMessage = `${winnerName} won!`;
          if (winnerName === this.transferData.firstPlayerName) {
            this.updateDatabase.result = 1;
          }
          if (winnerName === this.transferData.secondPlayerName) {
            this.updateDatabase.result = 3;
          }
          this.dialogVisible = true;
          return;
        }
      }

      if (this.count === 9) {
        this.resultMessage = "It's a draw!";
        this.dialogVisible = true;
        this.updateDatabase.result = 2;
        this.gameOver = true;
      }
    },
    getRow(rowIndex) {
      return this.board.slice(rowIndex * 3, rowIndex * 3 + 3);
    },
  },
  computed: {
    cellClasses() {
      return this.board.map((_, index) => ({
        "tic-tac-toe-button": true,
        "win-cell": this.winningCells.includes(index),
      }));
    },
  },
};
</script>

<style scoped>
/* Kazanan X hücreleri için yeşil arkaplan */

.container {
  width: 100%;
  max-width: 320px; /* mobil ve tablet ekranlar için başlangıç genişliği */
  margin: auto;
}
.tic-tac-toe-button {
  width: calc(33% - 2px); /* -2px to account for the border */
  height: calc(33% - 2px); /* Adjusting for mobile viewport units */
  border: 1px solid black;
}
.player-card {
  padding: 10px 20px;
  margin: 10px 0;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.05);
  text-align: center;
}

.player-name {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.player-type {
  font-size: 1.2em;
  color: #555;
  border: 1px solid #555;
  padding: 5px 10px;
  border-radius: 5px;
}

/* Ekran genişliği 600px'in altında olduğunda (mobil için) */
@media only screen and (max-width: 600px) {
  .tic-tac-toe-button {
    font-size: 5vw;
  }
}

/* Büyük ekranlar için - Örneğin 1024px ve üstü */
@media only screen and (min-width: 1024px) {
  .container {
    max-width: 900px; /* büyük ekranlar için maksimum genişlik */
  }
  .tic-tac-toe-button {
    min-height: 100px; /* Büyük ekranlar için düğme boyutunu ayarlıyoruz. */
    min-width: 100px;
    font-size: 2em; /* Font boyutunu büyütüyoruz. */
  }
}
.win-cell {
  background-color: green !important;
  color: white !important;
}
</style>



