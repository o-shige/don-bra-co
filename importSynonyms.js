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
loadSynonyms()