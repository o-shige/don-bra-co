const testObj = require("../lib/synonymsDictionary");
const db = require("../models");
const path = require("path");

// 動くか確認
console.log(testObj);

// DB設定、config

// 毎回テストのたびにDBの状態を更新する
beforeEach(async () => {
  await db.sequelize.sync({ force: true });
});

// どういうテストを書いていくか
test("正常CSV読み込み", async () => {
  //
  const filepath = path.join(__dirname, "./testMyfile.csv");
  await testObj.loadSynonymsForCSV(filepath);

  // DB内を検索して挙げる
  // fileに記載されているデータとDBに登録されているカウント数(想定は５つ)
  const expects = 5;
  const actuals = await db.word.count();

  expect(actuals).toBe(expects);
});

// DBのたびにコンテキストがかわるので、テストケースの独立性がなくなってしまう
//
test("正常CSV読み込み", async () => {
  //
  const filepath = path.join(__dirname, "./testMyfile2.csv");
  await testObj.loadSynonymsForCSV(filepath);

  // DB内を検索して挙げる
  // fileに記載されているデータとDBに登録されているカウント数(想定は５つ)
  const expects = 6;
  const actuals = await db.word.count();

  expect(actuals).toBe(expects);
});

// 登録件数、同じ行が複数入っている場合にカウントされない、ファイルフォーマット、０件、拡張子違う、内容がNG（カンマ区切りではない、とうとう）
// 起こっていることは全て正しい、できていないことを確認しながらやる。
// コード理解の解像度が上がるなぁ。
