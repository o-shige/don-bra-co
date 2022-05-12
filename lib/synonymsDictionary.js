const fs = require("fs");
const path = require("path");
const db = require("../models");

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

    if (instance[0].hasSynonym(instance2[0])) {
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
//loadSynonyms();

function loadSynonymsForCSV() {
  const data = fs.readFileSync(path.join(__dirname, "./test_myfile.csv")); //　ファイル読み込み
  const records = data
    .toString()
    .split("\n") // 行ごと（単語と類義語のセット）に分割
    .map(function (line) {
      return line.split(",");
    }); // 各行を単語区切りして、多重配列化
  //.map((line) => (line.split('\t'))) // 短縮表記

  //records.forEach((record) => console.log(record[1]));

  // console.log("start");
  records.forEach((record) => {
    addDictionary(record[1], record[2]); // 検索単語→類義語の関連付けを実施
    addDictionary(record[2], record[1]); // 類義語が検索された場合にも対応できるように類義語→検索単語の関連付けを実施
  });
  // console.log("fin");
}
loadSynonymsForCSV();

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
module.exports = getSynonyms;
