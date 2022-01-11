const db = require('./models');

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
    const word = obj_word_id[0]

    let synonym_list = await word.getSynonyms()
    synonym_list.forEach(item => {
        console.log(item.content)
    })
}
getItems();