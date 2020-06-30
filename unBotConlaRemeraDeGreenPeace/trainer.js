import letras from "./letras.json";
import MyLSTM from "./MyLSTM";

const train = (vueltas = 10000) => {
  let Net = new MyLSTM();
  for (let i = 0; i < vueltas; i++) {
    letras.forEach(letra => {
      Net.readText(letra.letra);
      console.log(`Error: ${Net.error}`);
    });
    Net.save();
    console.log(`vuelta nro: ${i}/${vueltas}`);
    const predicted = Net.predict();
    console.log(predicted);
  }
};

const predict = () => {
  let Net = new MyLSTM();
  const predicted = Net.predict();
  console.log(predicted);
};

switch (process.argv[2]) {
  case "train":
    train(process.argv[3]);
    break;
  case "predict":
    predict();
    break;
}
