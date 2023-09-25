<template>
  <v-container class="bg-transparent">
    <v-row no-gutters>
      <v-col cols="6">
        <v-sheet width="300" class="mx-auto float-right pr-5 mr-5">
          <h2>First Player</h2>
          <v-form ref="form1">
            <v-text-field
              v-model="namePlayer1"
              :counter="25"
              :rules="nameRules"
              label="Name"
              required
            ></v-text-field>

            <v-select
              v-model="selectPlayer1"
              :items="items"
              :rules="[(v) => !!v || 'Side is required']"
              label="Side"
              required
              @input="handlePlayer1SymbolChange"
            ></v-select>
          </v-form>
        </v-sheet>
      </v-col>
      <v-col cols="6">
        <v-sheet width="300" class="mx-auto float-left pl-5 ml-5">
          <h2>Second Player</h2>
          <v-form ref="form2">
            <v-text-field
              v-model="namePlayer2"
              :counter="25"
              :rules="nameRules"
              label="Name"
              required
            ></v-text-field>

            <v-select
              v-model="selectPlayer2"
              :items="items"
              :rules="[(v) => !!v || 'Side is required']"
              label="Side"
              required
              @input="handlePlayer2SymbolChange"
            ></v-select>
          </v-form>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row class="justify-center mt-5">
      <v-btn :disabled="!isFormValid" @click="startGame">Start</v-btn>
    </v-row>
  </v-container>
</template>


<script>
import router from "@/router";
import axios from "axios";

export default {
  data: () => ({
    namePlayer1: "",
    namePlayer2: "",
    selectPlayer1: null,
    selectPlayer2: null,
    items: ["X", "O"],
    game: {
      firstPlayerName: "",
      secondPlayerName: "",
      firstPlayerType: false,
    },
    transferData: {
      gameId: "",
      firstPlayerName: "",
      secondPlayerName: "",
      firstPlayerType: "",
      secondPlayerType: "",
      token: "",
    },
  }),
  computed: {
    nameRules() {
      return [
        (v) => !!v || "Name is required",
        (v) => (v && v.length <= 25) || "Name must be less than 25 characters",
        (v) => this.namePlayer1 !== this.namePlayer2 || "Names must be unique",
      ];
    },
    isFormValid() {
      return (
        this.namePlayer1 &&
        this.namePlayer2 &&
        this.selectPlayer1 &&
        this.selectPlayer2 &&
        this.namePlayer1 !== this.namePlayer2
      );
    },
  },
  watch: {
    namePlayer1() {
      this.$refs.form2.validate();
    },
    namePlayer2() {
      this.$refs.form1.validate();
    },
    selectPlayer1(newValue) {
      this.selectPlayer2 = newValue === "X" ? "O" : "X";
    },
    selectPlayer2(newValue) {
      this.selectPlayer1 = newValue === "X" ? "O" : "X";
    },
  },
  methods: {
    async startGame() {
      const key = "X4d3g7P1k9zZwE6sO8yA2nG5hL0mQ3jF";
      this.game.firstPlayerName = this.namePlayer1;
      this.game.secondPlayerName = this.namePlayer2;
      if (this.game.firstPlayerType === "X") {
        this.game.firstPlayerType = true;
      }

      axios
        .post("https://localhost:44352/api/game", this.game, {
          headers: {
            keycode: key,
            "Content-Type": "application/json", // JSON veri gönderiyorsanız bu başlığı eklemeniz iyi olacaktır.
          },
        })
        .then((response) => {
          console.log("Success : ", response.data);

          this.transferData = {
            gameId: response.data.data.id,
            firstPlayerName: response.data.data.firstPlayerName,
            secondPlayerName: response.data.data.secondPlayerName,
            firstPlayerType:
              response.data.data.firstPlayerType == true ? "X" : "O",
            secondPlayerType:
              response.data.data.firstPlayerType == true ? "O" : "X",
            token: response.data.token,
          };
          console.log(this.transferData);
          localStorage.setItem(
            "transferData",
            JSON.stringify(this.transferData)
          );
          router.push("/game");
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
  },
};
</script>
