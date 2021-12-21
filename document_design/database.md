# Database

## 類義語を検索

```sql
SELECT w2.content FROM synonyms
JOIN words as w1 ON synonyms.word1_id = w1.id
JOIN words as w2 ON synonyms.word2_id = w2.id
WHERE
  w1.content = 'お金'
```

前提として、`synonyms`テーブルには、類義語の対が重複して入っている。
つまり、語A（id=1）の類義語が語B（id=2）とした場合、DB中には`(word1_id = 1, word2_id = 2)`と`(word1_id = 2, word2_id = 1)`のレコードがsynonymsにある。
