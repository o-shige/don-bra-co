const fs = require("fs");
const path = require("path");
const db = require("../models");
const readline = require("readline");

/**
 *  類義語辞書
 *  @type { string: string[] } - {検索単語：類義語[]}
 */
const synonymDics = {};

/**
 * 辞書を作成するためのコマンド
 *
 * @param {string} word - 検索単語
 * @param {string} synonym - 類義語
 */
async function addDictionary(word1, word2) {
  // let dic = synonymDics[word]; // 検索単語（キーワード）を検索

  // // キーワードが存在しない場合には空白のキーワードを仮置（★キーワードと類義語はセットになっているはずなので、想定ケースが想像できない確認したい★）
  // if (!dic) {
  //   dic = [];
  // }

  // dic.push(synonym); // キーワードと類義語を紐付けていく
  // synonymDics[word] = dic; // 類義語辞書を更新

  // 2つテーブルが有る単語情報、類義語情報、
  // そもそも存在するか？なければ作る、
  // 2つの単語を登録した後にsynonymsに登録する
  try {
    const instance = await db.word.findOrCreate({
      where: {
        content: word1,
      },
    });

    const instance2 = await db.word.findOrCreate({
      where: {
        content: word2,
      },
    });

    // これで紐付けしてくれるかもしれない
    // https://sequelize.org/docs/v6/core-concepts/assocs/#foobelongstomanybar--through-baz-

    //console.log(instance[0].hasSynonym(instance2[0]));

    // Promiseとは非同期処理を扱うためのオブジェクト。これをもっとシンプルに扱うためににawaitが生まれた。
    // Promiseで返されたなにかあるから、trueになっていたので、本当に必要な非同期で必要な処理をawaitで待ちます、という処理にした。
    // Promiseはもっと複雑な処理を管理するようにするためのObject
    if (await instance[0].hasSynonym(instance2[0])) {
      console.log(`${word1},  ${word2} "alreadt exist!!!"`);
      return;
    }

    await instance[0].addSynonym(instance2[0]);
  } catch (error) {
    console.log(error);
    console.log(`${word1}, ${word2}`);
  }
}
/**
 * ファイルを読み込んで類義語辞書を作るための一連の処理
 */
function loadSynonyms() {
  const data = fs.readFileSync(path.join(__dirname, "./jwn_synonyms.ver.1.0")); //　ファイル読み込み
  const records = data
    .toString()
    .split("\n") // 行ごと（単語と類義語のセット）に分割
    .map(function (line) {
      return line.split("\t");
    }); // 各行を単語区切りして、多重配列化
  //.map((line) => (line.split('\t'))) // 短縮表記

  records.forEach((record) => {
    addDictionary(record[1], record[3]); // 検索単語→類義語の関連付けを実施
    addDictionary(record[3], record[1]); // 類義語が検索された場合にも対応できるように類義語→検索単語の関連付けを実施
  });
}
// //loadSynonyms();

// function dirread() {}
//   // let items = [];
//   fs.readdir(".", (err, files) => {
//     files.forEach((file) => {
//       if (file.toUpperCase().match(/\.(CSV)$/i)) {
//         console.log(file);
//         //items.push(file);
//       }
//     });
//   });
//   // items.forEach((item) => {
//   //   console.log(item);
//   // });

// dirread();

async function loadSynonymsForCSV(filepath) {
  // 関数の作りの課題
  // fileが固定なので、例外の想定を検討しにくい
  // fileがでかい →　分割
  //
  //const fileStream = fs.createReadStream(path.join(__dirname, "./myfile.csv"));
  const fileStream = fs.createReadStream(filepath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`);

    // splitして、addDictionalyする
    const record = line.split(",");
    await addDictionary(record[1], record[2]);
    await addDictionary(record[2], record[1]);
  }
}

// function loadSynonymsForCSV() {
//   fs.readdir(".", (err, files) => {
//     files.forEach((file) => {
//       console.log(file);
//     });
//   });

//   const data = fs.readFileSync(path.join(__dirname, "./myfile.csv")); //　現状一気に読み込んでメモリ領域が不足してエラーになっているので、ストリームにする
//   const records = data
//     .toString()
//     .split("\n") // 行ごと（単語と類義語のセット）に分割
//     .map(function (line) {
//       return line.split(",");
//     }); // 各行を単語区切りして、多重配列化
//   //.map((line) => (line.split('\t'))) // 短縮表記

//   //records.forEach((record) => console.log(record[1]));

//   // console.log("start");
//   records.forEach((record) => {
//     addDictionary(record[1], record[2]); // 検索単語→類義語の関連付けを実施
//     addDictionary(record[2], record[1]); // 類義語が検索された場合にも対応できるように類義語→検索単語の関連付けを実施
//   });
//   // console.log("fin");
// }
//loadSynonymsForCSV();

/**
 * 類義語検索用
 *
 */
async function findSynonyms(keyword) {
  const word = await db.word.findOne({
    where: {
      content: keyword, //入力情報から、DBのIDを取得
    },
  });
  if (word) {
    return await word.getSynonyms();
  } else {
    // 辞書に登録されていなかった場合の処理によって対応する
    // この場合には類義語がない場合の処理を同じにしたい（空の配列を返します）
    return [];
  }
}

/**
 * 境界（最小値と最大値）の間で生成された乱数を返す
 *
 * @param {int} min - 乱数の境界（最小値）
 * @param {int} max - 乱数の境界（最大値）
 * @return {int} - 生成された乱数
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 外部呼び出し用（検索用語をもらって、wordcloudを表示する）
 *
 * @param {string} keyword - 入力単語
 * @returns - wordcloudに表示する単語（多重配列形式の単語と表示サイズ）
 */
async function getSynonyms(keyword) {
  const synonyms = await findSynonyms(keyword); // 類義語検索

  if (synonyms.length > 0) {
    return synonyms.map((synonym, i) => [
      synonym.content,
      getRandomArbitrary(1, 100),
    ]);
  } else {
    // 類義語がヒットしない場合には検索キーワードをランダムなサイズで表示して何らかを想起させる
    let list = [];
    for (let i = 0; i < 10; i++) {
      list.push([keyword, getRandomArbitrary(1, 100)]);
    }
    return list;
  }
}

// （外部からの呼び出し名称が定義される）
// ★この名称については確認したい。routesが同じ名前でexportsされていることもあり、命名規約が気になる★
module.exports = {
  getSynonyms,
  loadSynonymsForCSV,
};
