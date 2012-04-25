function BlogView() {  
    // コンテンツ分析用の現行のコンテンツ・セッション ID
    var contentSessionId = null;

    // このビューを初期化します
    this.init = function () {
        // イベント・ハンドラーを設定します
        registerEventListeners();

        // "Loading" メッセージを表示させます
        showLoadingMessage();

        // 最初に古いデータを生成します。
        renderArticleList(getSavedArticles());

        // 次に、新しいデータをロードします
        // "blog"という名のデータは、manifest.jsonで定義されています
        bc.core.getData("blog", handleData, handleError);

        // 動的にスタイルを適用します
        bc.core.applyStyles();
    };

    // イベント・ハンドラーを設定します
    var registerEventListeners = function () {
        // article (記事)を tap するイベントを Listen します
        $(".articles li").live("tap", function (evt) {
            var guid = evt.currentTarget.getAttribute("data-guid");
            var article = getArticle(guid);

            renderArticleDetail(article);

            startContentSession(article);
        });

        // 「戻る」ボタンを tap するイベントを Listen します
        $(".back-button").live("tap", function (evt) {
            bc.ui.backPage();

            endContentSession();
        });

        // 匿名関数を viewfocus イベントに バインドします
        $(bc).bind("viewfocus", function (evt) {
            endContentSession();
        });

        // 画像がロードされる度にスクロールの深さを再計算します
        $(".page img").load(function (evt) {
            bc.ui.refreshScrollers();
        });
    };

    // bc.core.getData()から成功コールバック関数を処理します
    var handleData = function (data) {
        // レスポンスをログにします
        console.log(data);

        // キャッシュに記事を保存します
        saveArticles(data);

        // 記事をレンダリング（生成）します
        renderArticleList();

        // "Loading" メッセージを隠します
        hideLoadingMessage();
    };

    // bc.core.getData()からの失敗コールバック関数を処理します
    var handleError = function (error) {
        console.error(error);
    };

    // 記事リストをレンダリング（生成）します
    var renderArticleList = function () {
    	// "date-format"は、manifest.jsonで定義されています
        Mark.globals.dateFormat = bc.core.getSetting("date-format");

		// "index-template"は blog.txt で定義されています
        var template = bc.templates["index-template"];
        var context = { "articles": getSavedArticles() };
        var markup = Mark.up(template, context);

		// "article-index"は blog.html に記載されています
		// "article-index"の div タグ内に情報を生成します
        // document.getElementById("article-index").innerHTML = markup; を下記にように変更
        $("#article-index").html(markup);
        
        bc.ui.refreshScrollers();
    };

    // 個々の記事をレンダリング（生成）します
    var renderArticleDetail = function (article) {
    	// "detail-template"は blog.txt で定義されています
        var template = bc.templates["detail-template"];
        var context = { "article": article };
        var markup = Mark.up(template, context);

		// "article-detail"は blog.html に記載されています
		// "article-detail"の div タグ内に情報を生成します
        // document.getElementById("article-detail").innerHTML = markup; を下記のように変更
		$("#article-detail").html(markup);
		
        // ページ遷移のコード部分
        // "detail-page"という名のページへ遷移します。(blog.htmlに定義されています)
        var page = document.getElementById("detail-page");
        bc.ui.forwardPage(page);
        bc.ui.refreshScrollers();
    };

    // キャッシュからブログの記事を取得し、空の配列を返り値として返します
    var getSavedArticles = function () {
        return bc.core.cache("articles") || [];
    };

    // キャッシュ内にブログの記事を保存します
    var saveArticles = function (data) {
        bc.core.cache("articles", data);
    };

    // 指定された ID によって記事を取得し、存在しなければ null を返す
    var getArticle = function (guid) {
        var articles = getSavedArticles();

        for (var i in articles) {
            if (articles[i].guid === guid) {
                return articles[i];
            }
        }

        return null;
    };

    // コンテンツ・セッションを開始します
    var startContentSession = function (article) {
        contentSessionId = article.guid;

        bc.metrics.startContentSession(contentSessionId, article.title);

        console.log("Start content session: " + contentSessionId);
    };

    // コンテンツ・セッションを終了します
    var endContentSession = function () {
        if (contentSessionId) {
            bc.metrics.endContentSession(contentSessionId);

            console.log("End content session: " + contentSessionId);
        }

        contentSessionId = null;
    };

    // "loading" メッセージを表示します
    var showLoadingMessage = function () {
        document.getElementById("loading").style.opacity = 1;
    };

    // "loading" メッセージを非表示します
    var hideLoadingMessage = function () {
        document.getElementById("loading").style.opacity = 0;
    };

}

// bc が準備出来次第、ビューを初期化します
$(bc).bind("init", function () {
    var view = new BlogView();
    view.init();
});

// auto-rotation をオンにします
bc.device.setAutoRotateDirections(["all"]);

// スクロールをロックします
// lock scrolling (TODO move into bc.js)
$(document).bind("touchstart", function(e) {
    e.preventDefault();
});
