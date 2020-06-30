import fs from "fs";
import { Architect, Network } from "synaptic";

const sanitizeString = str =>
  str
    .trim()
    .toLowerCase()
    .replace(/à|á|â|ä|æ|ã|å|ā/g, "a")
    .replace(/è|é|ê|ë|ē|ė|ę/g, "e")
    .replace(/î|ï|í|ī|į|ì/g, "i")
    .replace(/ô|ö|ò|ó|œ|ø|ō|õ/g, "o")
    .replace(/û|ü|ù|ú|ū/g, "u")
    .replace(/\[|\{/g, "(")
    .replace(/\]|\}/g, ")")
    .replace(/_/g, "-")
    .replace(/"/g, "'");

export default class MyLSTM {
  constructor() {
    this.dictionary = "0123456789qwertyuiopasdfghjklzxcvbnm,.()'-!? \0".split(
      ""
    );
    this.keys = this.dictionary.reduce((acc, letter, i) => {
      acc[letter] = +i;
      return acc;
    }, {});
    this.network = this.getNetwork();
    this.learningRate = 0.001;
    this.error = 0;
  }

  getNetwork = () => {
    try {
      const rawJson = JSON.parse(fs.readFileSync("./network.json"));
      return Network.fromJSON(rawJson);
    } catch {
      return new Architect.LSTM(
        this.dictionary.length,
        60,
        this.dictionary.length
      );
    }
  };

  readText = input => {
    const words = (sanitizeString(input) + "\0").split(" ");
    words.forEach(this.proccessWord);
  };

  proccessWord = word => {
    const chars = [" ", ...word, " "];
    const charArrays = chars.map(this.getNormalizedVectorFromChar);
    for (let i = 0; i < chars.length - 1; i++) {
      this.proccesChar(
        chars[i],
        charArrays[i],
        chars[i + 1],
        charArrays[i + 1]
      );
    }
  };

  proccesChar = (input, inputArray, target, targetArray) => {
    const predictedArray = this.network.activate(inputArray);
    const predicted = this.getChar(predictedArray);

    this.error =
      targetArray.reduce(
        (delta, val, ind) => delta + Math.pow(val - predictedArray[ind], 2)
      ) / this.dictionary.length;

    if (target !== predicted) {
      this.network.propagate(this.learningRate, targetArray);
    }
  };

  getNormalizedVectorFromChar = char => {
    const arr = [];
    arr.length = this.dictionary.length;
    for (let i = 0; i < this.dictionary.length; i++) arr[i] = 0;
    arr[this.keys[char]] = 1;
    return arr;
  };

  getChar = charArray => {
    const ind = charArray.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0
    );
    return this.dictionary[ind];
  };

  save = () => {
    fs.writeFileSync("./network.json", JSON.stringify(this.network.toJSON()));
    console.log("Grabada");
  };

  predict = () => {
    let i = 0;
    let predictedVect = this.network.activate(
      this.getNormalizedVectorFromChar(" ")
    );
    let predictedChar = this.getChar(predictedVect);
    let predictedText = predictedChar;
    while (predictedChar !== "\0" && i < 200) {
      predictedVect = this.network.activate(predictedVect);
      predictedChar = this.getChar(predictedVect);
      predictedText = predictedText + predictedChar;
      i++;
    }
    return predictedText;
  };
}
