let GithubOrganizationInfo = {};
// main
function RepositorysCheck() {
  getSetting();
  // Orgnization情報を見て件数をチェックする
  if(GithubOrganizationInfo.public_repos > 0){
    // 対象リポジトリの配列を受け取る
    let repos = getPublicRepository();
    // とりあえず名前のみ抽出する
    let data = [];
    for(repo of repos){
      data.push(repo.name);
    }
    // Slackに投げるメッセージの生成
    let message ="公開範囲がPublicのリポジトリが" + GithubOrganizationInfo.public_repos + "件ありました。（変更済み）\n" +
      "対象リポジトリ名:" + data.join(",") + "\n";
    // 投稿
    posttoSlack(message);
  }
}

// スクリプトプロパティからTokenを取り出してRepos_URLなどを取得する
function getSetting(){
  let Props = PropertiesService.getScriptProperties();

  let Options = { 'headers': { 'Accept': "application/vnd.github.v3+json",'Authorization': "token " + Props.getProperty('GITHUB_ACCESS_TOKEN')}};
  let Url = "https://api.github.com/orgs/" + Props.getProperty('GITHUB_OWNER');
  let Response = UrlFetchApp.fetch(Url,Options);

  GithubOrganizationInfo = JSON.parse(Response.getContentText());
  GithubOrganizationInfo.AccessToken = Props.getProperty('GITHUB_ACCESS_TOKEN')
  GithubOrganizationInfo.Owner = Props.getProperty('GITHUB_OWNER');
}

// Publicになっているリポジトリ名のリストを生成する
function getPublicRepository(){
  const Url = GithubOrganizationInfo.repos_url + "?type=public";
  // GETオプション
  const Options = {
    'headers': { 'Authorization': "token " + GithubOrganizationInfo.AccessToken},
    'method' : 'GET',
  };
  const Response = UrlFetchApp.fetch(Url,Options);
  const repos = JSON.parse(Response.getContentText());
  for(repo of repos){
    // Privateに変更する
    // true:Private / false:Public
    visibilityChange(repo.name,true);
  }
  return repos;
}

// リポジトリ名を指定して強制的にPrivateに変更する
function visibilityChange(RepositoryName,value){
  const Url = "https://api.github.com/repos/OWNER/".replace("OWNER",GithubOrganizationInfo.Owner) + RepositoryName;
  const payload ={
    'private': value,
  }
  const Options = {
    'headers': { 'Authorization': "token " + GithubOrganizationInfo.AccessToken},
    'method' : 'patch',
    'payload' : JSON.stringify(payload)
  };
  let Response = UrlFetchApp.fetch(Url,Options);
  return Response.getResponseCode();
}

function posttoSlack(text){
  const SLACK_WEBHOOK = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK');
  const payload = {
    "text" : text
  }
  // POSTオプション
  const options = {
    "method" : "POST",
    "payload" : JSON.stringify(payload)
  }

  // POSTリクエスト
  UrlFetchApp.fetch(SLACK_WEBHOOK, options);
}

// テスト用の関数
// APITestというリポジトリをPublicにする
function test(){
  getSetting();
  visibilityChange("APITest",true);
}
