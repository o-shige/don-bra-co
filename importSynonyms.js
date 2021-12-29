const db = require('./models');
const fs = require('fs')
const path = require('path')

//（初期の処理）
//類義語のファイルを読み込む
async function loadSynonyms() {
    const data = fs.readFileSync(path.join(__dirname, './lib/jwn_synonyms.ver.1.0')) //　ファイル読み込み
    const records = data.toString().split('\n') // 行ごと（単語と類義語のセット）に分割
        .map(function(line) { return line.split('\t') }) // 各行を単語区切りして、多重配列化

    // DBに情報格納
    for (let i = 0; i < records.length; i++) {
        // 処理したい情報が入っているかどうかを確認（情報が４つ使える状態で入っているか）
        if (!records[i][0] || !records[i][1] || !records[i][2] || !records[i][3]) {
            continue;
        }

        try {
            const word1 = (await db.word.findOrCreate({
                    where: {
                        content: records[i][1]
                    }
                }))[0] // DBのレコードがPromiseの型（要素が1つしかない配列）っぽいので、抜き出し

            const word2 = (await db.word.findOrCreate({
                where: {
                    content: records[i][3]
                }
            }))[0]

            // fooInstance.addBar() ※sequelizeの使い方から
            await word1.addSynonym(word2);
            await word2.addSynonym(word1);

        } catch (error) {
            console.error(error);
        }
    }
}
//loadSynonyms()

// テスト用のコード
async function test_getItem() {
    // DBアクセス（全取得）
    const wordItems = await db.word.findAll();
    wordItems.map((word) => {
        console.log(word.content);
    })

    // ID1,2,3を取得
    await db.word.findAll({
            where: {
                id: [1, 2, 3]
            }
        })
        .then(words => {
            words.map((wordItem) => {
                console.log("id: " + wordItem.id);
                console.log("content: " + wordItem.content);
            })
        })

    // 数を取得
    await db.word.count({
            where: {
                id: [2]
            }
        })
        .then(dataCount => {
            console.log(dataCount);
        })

    // 類義語DBから、類義語のIDを取得します

    await db.wordSynonym.findAll()
        .then(items => {
            items.map((item) => {
                console.log("word_id: " + item.word_id);
                console.log("synonym_id: " + item.synonym_id);
            })
        })

}
//test_getItem();


async function getItems() {
    const key_word = '人'
    const obj_word_id = await db.word.findAll({
        where: {
            content: key_word //入力情報から、DBのIDを取得
        }
    })
    const word_id = obj_word_id[0].id;
    console.log(word_id); // うまくいくことを確認

    const synonym_ids = await db.wordSynonym.findAll({
        where: {
            word_id: word_id // 入力情報から割り出したidから、類義語を取得
        }
    })

    let synonym_list = []
    for (let i = 0; i < synonym_ids.length; i++) {
        //console.log('類義語: ' + synonym_ids[i].synonym_id); // 類義語出します
        const item = await db.word.findAll({
                where: {
                    id: synonym_ids[i].synonym_id
                }
            })
            //console.log('取得したよ: ' + item[0].content);  // 引き出した類義語
        synonym_list.push(item[0].content);
    }

    synonym_list.forEach(item => {
        console.log(item)
    })
}
getItems();