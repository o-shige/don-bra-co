const fs = require('fs')
const path = require('path')

/**
 *  類義語辞書
 *  @type { string: string[] } - {検索単語：類義語[]}
 */
const synonymDics = {}


/**
 * 辞書を作成するためのコマンド
 *
 * @param {string} word - 検索単語
 * @param {string} synonym - 類義語
 */
function addDictionary(word, synonym) {
    let dic = synonymDics[word] // 検索単語（キーワード）を検索

    // キーワードが存在しない場合には空白のキーワードを仮置（★キーワードと類義語はセットになっているはずなので、想定ケースが想像できない確認したい★）
    if (!dic) {
        dic = []
    }

    dic.push(synonym) // キーワードと類義語を紐付けていく
    synonymDics[word] = dic // 類義語辞書を更新
}


/**
 * ファイルを読み込んで類義語辞書を作るための一連の処理
 */
function loadSynonyms() {
    const data = fs.readFileSync(path.join(__dirname, './jwn_synonyms.ver.1.0')) //　ファイル読み込み
    const records = data.toString().split('\n') // 行ごと（単語と類義語のセット）に分割
        .map(function(line) { return line.split('\t') }) // 各行を単語区切りして、多重配列化
        //.map((line) => (line.split('\t'))) // 短縮表記

    records.forEach((record) => {
        addDictionary(record[1], record[3]) // 検索単語→類義語の関連付けを実施
        addDictionary(record[3], record[1]) // 類義語が検索された場合にも対応できるように類義語→検索単語の関連付けを実施
    })
}
loadSynonyms()


/**
 * 類義語検索用
 *
 * @param {string} keyword - 入力単語
 * @return {string[]} - 類義語一覧
 */
function findSynonyms(keyword) {
    return synonymDics[keyword] // 類義語辞典からヒットした単語群を返す
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
function getSynonyms(keyword) {
    const synonyms = findSynonyms(keyword) // 類義語検索

    if (synonyms) {
        return synonyms.map((synonym, i) => ([synonym, getRandomArbitrary(1, 100)]))
    } else { // 類義語がヒットしない場合には検索キーワードをランダムなサイズで表示して何らかを想起させる
        let list = []
        for (let i = 0; i < 10; i++) {
            list.push([keyword, getRandomArbitrary(1, 100)])
        }
        return list
    }
}

// （外部からの呼び出し名称が定義される）
// ★この名称については確認したい。routesが同じ名前でexportsされていることもあり、命名規約が気になる★
module.exports = getSynonyms