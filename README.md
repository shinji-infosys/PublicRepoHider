# gas-GitHub

## 使い方
スクリプトプロパティに下記を設定します。
| 名前 | 値 |
| - | - |
| GITHUB_ACCESS_TOKEN | GitHubのPAT |
| GITHUB_OWNER | org名 |
| SLACK_WEBHOOK | Webhook URL |

RepositorysCheckを実行してください。

テストしたい場合は下記のAPITestを任意のリポジトリ名に編集してください。

`  visibilityChange("APITest",false);`
