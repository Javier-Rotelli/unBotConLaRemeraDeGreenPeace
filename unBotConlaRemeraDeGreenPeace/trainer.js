import letras from "./letras.json";
import MyLSTM from "./MyLSTM";

const train = () => {
  let Net = new MyLSTM();
  letras.forEach(letra => {
    Net.readText(letra.letra);
    console.log(`Error: ${Net.error}`);
    Net.save();
  });
};

const predict = () => {
  let Net = new MyLSTM();
  const predicted = Net.predict();
  console.log(predicted);
};

switch (process.argv[2]) {
  case "train":
    train();
    break;
  case "predict":
    predict();
    break;
}
