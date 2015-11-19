enchant();

window.onload = function(){
    
    SCREEN_WIDTH = 1280;
    SCREEN_HEIGHT = 720;
    
	// 初期化（画面サイズ）
	game = new Game( SCREEN_WIDTH, SCREEN_HEIGHT );

    // フレームレートの設定
	game.fps = 30;
    // 今回のSpriteStudio側のデータが60fpsで制作されているので
    // キャラクタ生成時に速度設定を倍速近くにしています。
    
    // デバッグ表示
    game._debug = false;
    
    // 最大表示数
    maxCharas = 12;
    
    // 画像のリスト（SsToHtml5で変換したjsファイルの１番めに定義された変数）
    ssp_imgs = [
        attack_attack_images,
        dash_dash_images,
        jump_jump_images,
        run_run_images,
        stand_stand_images,
        walk_walk_images
    ];
    
    // アニメのリスト（SsToHtml5で変換したjsファイルの２番めに定義された変数）
    ssp_anim = [
        attack_attack_animation,
        dash_dash_animation,
        jump_jump_animation,
        run_run_animation,
        stand_stand_animation,
        walk_walk_animation
    ];

    // 画像ファイルのパス調整用
    ssp_path = "export/";

    // キャラクター画像の読み込み（ssp_pathを追加する）
    for( var i in ssp_imgs ){
        for( var j in ssp_imgs[i] ){
            ssp_imgs[i][j] = ssp_path + ssp_imgs[i][j];
        }
        game.preload( ssp_imgs[i] );
    }

    // 再生中のキャラクターのリスト（最大数管理用）
    ssp_list = [];

    game.onload = function(){
        // とりあえず１体生成
        var ssp = makeChar( ssp_imgs[0], ssp_anim[0], [[0,-1]], SCREEN_WIDTH/2, SCREEN_HEIGHT/2 );
        ssp_list.push( ssp );
        // クリックでキャラ生成
		game.rootScene.addEventListener( 'touchstart', function( e ){
            // 生成
            var r = Math.floor( Math.random() * ssp_anim.length );
            var ssp = makeChar( ssp_imgs[r], ssp_anim[r], [[0,-1]], e.x, e.y );
            // リストに追加
            ssp_list.push( ssp );
            // 適当に動く(1:dash,3:run,5:walk)
            if( r == 1 || r == 3 || r == 5 ){
                ssp.spd = r - 6;
            }else{
                ssp.spd = 0;
            }
            ssp.addEventListener( 'enterframe', function( e ){
                ssp.x += ssp.spd;
                if( ssp.x < 0 || ssp.x > SCREEN_WIDTH ){
                    ssp.scaleX *= -1;
                    ssp.spd *= -1;
                }
            });
            // 最大数制限
            if( ssp_list.length > maxCharas ){
                game.rootScene.removeChild( ssp_list[0] );
                ssp_list[0].remove;
                ssp_list.splice( 0, 1 );
            }
		});
	};
    

	// キャラクターを生成する    
    makeChar = function( imgs, anim, lps, px, py ) {
		// 再生速度倍率
		var spd = 1.8 + Math.random() * 0.8; // x1.6〜x2.4
		// SpriteStudioPlayerクラスのインスタンス生成
		// 必須の引数は最初の2項目のみです
        // 同一レイヤでセルの入れ替えがある場合は5番目をtrueにします
        var ssp = new SSPlayer( imgs, anim, spd, lps, false );
		// 座標指定（SpriteStudioで設定した基準点（このサンプルではキャラの画像よりさらに下）で座標指定）
        ssp.setPosition( px, py );
		// 拡縮指定（Groupクラスのプロパティを継承しているだけ）
        ssp.scaleX = ssp.scaleY = 0.8 + Math.random() * 0.4;
		// 画面に登録
        game.rootScene.addChild( ssp );
        //
        return ssp;
    };
    
	game.start();
};