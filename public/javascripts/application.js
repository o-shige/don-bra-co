$(function() {
  const $form = $('form#wordcloud-form');
  const $inputWord = $('input[name="wordcloud"]', $form);
  let list = [];

  /**
   * TODO: 動作確認のための仮の実装のため、類義語APIを実装後に、そのAPI呼び出すように変更
   *
   * 今は擬似的に、入力された言葉を10個表示するようにしている
   */
  function getSynonyms(keyword) {
    const query = { keyword }

    return fetch(`/api/synonyms?${new URLSearchParams(query)}`)
            .then((response) => { return response.json() })
            .then((json) => { return json.synonyms })
  }

  $form.submit(async function(event) {
      // おまじない
      event.preventDefault();

      // divはスペースが動的に確保されるとのことだったので、これによって、divの領域が確保されて、
      // wordcloudの領域が表示できるようになったとおもうので、
      // この仮説を検証するには、CSSファイルを弄る
      //$wordcloud.text($inputWord.val());
      // コンテナとdivのheight 100%では対処できなかったので、divのheigh600pxにて対応

      //【修正】検索文字列から類語検索したい
      const synonyms = await getSynonyms($inputWord.val())
      synonyms.forEach((synonym) => { list.push(synonym) })

      // サンプルコード
      // const list = [
      //     ['foo', 12],
      //     ['bar', 6]
      // ];
      //console.log(list);

      // サンプルコードをもとにelementのID名のみ更新
      // 【修正】この関数を実装してあるファイルは外出してimportして関数を呼び出したい
      WordCloud(document.getElementById('wordcloud'), { list: list });
      console.log('submit');
  })
})