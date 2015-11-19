enchant();

// まだまだ未完成です！仕様検討中です！バグあります！それでもいい人は使うといいよ！
// とりあえず水平垂直反転時の座標計算不具合が確認されています

// SpriteStudioPlayer Class
/* ----------------------------------------------------------------
 * SSPlayer( _image, _animation [, _steps, _loops, _isRedraw, _clipOptions ] )
 * _images : 画像リスト配列。コンバートされたjsファイルにあります
 * _animation : アニメーションデータjson。コンバートされたjsファイルにあります
 * _steps : アニメーション再生速度倍率値。小数指定可（default:1.0）
 * _loops : ループ設定の二次元配列（default:[[0,-1]]）
 * _isRedraw : 毎フレーム全スプライト再設定の有無（default:true）
 * _clipOptions : 現在は基準点設定のみ使用
 * ---------------------------------------------------------------- */

/* ----------------------------------------------------------------

 * もう少し詳しい説明
 
 * _images / _animation
 画像リスト配列とアニメデータjsonです。html5コンバータでコンバートされたjsに記述されています。
 アニメデータjsonの中身ですが、fpsは現状無視します（再生速度の算出根拠にしてもよさそうですが…）
 partsはgetSpriteStateメソッドのために使いますが、現状注意が必要です。
 NULLパーツを利用していると、partsとssaの配列対応とにズレが生じます。
 現状、getSpriteStateメソッドを使う場合は、root以外のNULLパーツをpartsから削除してください。
 （むしろNULLパーツのステータスも書き出してもらえるとうれしいなぁ…＞WebTechnologyさん）

 * _steps :
 アニメーションの再生速度倍率を実数で指定します。
 負数設定すると逆再生するはずですが、ループ判定に支障が出るので正常動作しない可能性が高いです。
 気が向いたら逆再生にも対応するかもしれません（なので負数も除外しないでおきます）
 
 * _loops :
 [ループ開始フレーム番号,ループ終了フレーム番号]のペアを要素に持つ配列で指定します。
 つまりループペアは複数設定することができるということで、必ず二次元配列で渡してください。
 アニメーション全体の最初のフレーム番号は0、最終フレーム番号は-1です。
 負数を最終フレームからの逆向きの番号として設定することができます。
 
 * _isRedraw
 trueの場合、内部的にパーツ単位で管理しているSpriteを毎フレーム消去して再設定します。
 falseの場合、最初に設定したSpriteをそのまま使い続けます。
 開始フレームから全てのパーツが存在し、かつ表示の優先順位（前後関係）に変化がない場合に限り、
 falseにすることで処理の高速化を図ることができます。

 * _clipOptions
 SSPlayerクラスのその他いくつかのプロパティを設定します。現状はoriginX,originYのみ。
 現在のSSPlayerクラスはGroupクラスを継承していますが、mixing.enchant.jsプラグインを利用して
 SpriteクラスとGroupクラスの両方の機能を持つクラスとしてSSPlayerクラスを再設計するパターンを
 想定して準備していたりしたもので、今後どうなるかわかりません。

 * ---------------------------------------------------------------- */

var SSPlayer = enchant.Class.create( enchant.Group,{
	initialize: function( _images, _animation, _steps, _loops, _isRedraw, _clipOptions  ){
        enchant.Group.call( this );
        // args
        this.parts = _animation.parts;
        this.ssa = _animation.ssa;
		this.img = _images;
		// Frame
		this.currentFrame = 0;
		this.totalFrames = this.ssa.length;
        // optional args
        this.steps = ( _steps === undefined ) ? 1.0 : _steps;
        this.isRedraw = ( _isRedraw === undefined ) ? true : _isRedraw;
        if( _loops !== undefined ){
            this.loops = new Array( _loops.length );
            for( var i=0; i<_loops.length; i++ ){
                this.loops[i] = new Array( 2 );
                this.loops[i][0] = ( _loops[i][0] !== undefined ) ? (_loops[i][0]+this.ssa.length) % this.ssa.length : 0;
                this.loops[i][1] = ( _loops[i][1] !== undefined ) ? (_loops[i][1]+this.ssa.length) % this.ssa.length : this.ssa.length-1;
            }
        }else{
            // default loop
            this.loops = [[0,this.ssa.length-1]];
        }
        // clipping option
        if( _clipOptions != undefined ){
            //this.width = ( _clipOptions.width === undefined ) ? 0 : _clipOptions.width;
            //this.height = ( _clipOptions.height === undefined ) ? 0 : _clipOptions.height;
            this.originX = ( _clipOptions.originX === undefined ) ? 0 : _clipOptions.originX;
            this.originY = ( _clipOptions.originY === undefined ) ? 0 : _clipOptions.originY;
        }else{
            //this.width = 0;
            //this.height = 0;
            this.originX = 0;
            this.originY = 0;
        }
		// Sprite
		this.sp = [];
		this.spList = [];
		// Now Playing?
		this.isPlaying = true;
		// visible
		this.isVisible = true;
		//
		this.addEventListener( 'enterframe', function( e ){
			var l = 0;
			var w = 8;
			var h = 8;
			var r = 0;
			var px = 0;
			var py = 0;
			var sx = 1.0;
			var sy = 1.0;
			var ox = 0;
			var oy = 0;
			var fh = 1;
			var fv = 1;
			var al = 1.0;
			var ssa = this.ssa[Math.floor(this.currentFrame)];
			var id = 0;
            if( this.isRedraw ){
                this.clearSp();
            }
			this.spList = [];
			for( var i=0; i<ssa.length; i++ ){
				l = ssa[i].length;
				id = ssa[i][0];
				w = ssa[i][4];
				h = ssa[i][5];
				// Set Sprite only once.
				if( this.sp[id] === null || this.sp[id] === undefined ){
					this.sp[id] = new Sprite( w, h );
					this.sp[id].surface = new Surface( w, h );
					this.sp[id].surface.draw( game.assets[ this.img[ssa[i][1]] ], ssa[i][2], ssa[i][3], w, h, 0, 0, w, h );
					this.sp[id].image = this.sp[id].surface;
				}
				px = ssa[i][6];
				py = ssa[i][7];
				r = -ssa[i][8];
				sx = ssa[i][9];
				sy = ssa[i][10];
				// Optional
				ox = ( l >= 12 ) ? ssa[i][11] : 0; //w / 2;
				oy = ( l >= 13 ) ? ssa[i][12] : 0; //h / 2;
				fh = ( l >= 14 ) ? (ssa[i][13]>0 ? -1 : 1) : 1;
				fv = ( l >= 15 ) ? (ssa[i][14]>0 ? -1 : 1) : 1;
				al = ( l >= 16 ) ? ssa[i][15] : 1.0;
				// Set Sprite parameters
				this.sp[id].x = px - ox + this.originX;
				this.sp[id].y = py - oy + this.originY;
                this.sp[id].x += - (w-ox)*Math.cos(r)*(fh-1)/2 + (h-oy)*Math.sin(r)*(fv-1)/2; // Bug?
                this.sp[id].y += - (w-ox)*Math.sin(r)*(fh-1)/2 - (h-oy)*Math.cos(r)*(fv-1)/2; // Bug?
				this.sp[id].originX = ox;
				this.sp[id].originY = oy;
				this.sp[id].rotation = r * 180 / Math.PI;
				this.sp[id].scaleX = sx * fh;
				this.sp[id].scaleY = sy * fv;
				this.sp[id].opacity = al;
				// Draw and add List
				this.addChild( this.sp[id] );
				this.spList.push( this.sp[id] );	// add sp list
				//
				this.sp[id].visible = this.isVisible;
			}
			// Loop?
            this.currentFrame += this.steps;
            for( i=0; i<this.loops.length; i++ ){
                if( this.currentFrame >= this.loops[i][1]+1 && this.currentFrame-this.steps < this.loops[i][1]+1 ){
                    this.currentFrame = this.loops[i][0] + ( this.currentFrame - this.loops[i][1]+1 );
                    // Stop
                    if( this.currentFrame >= this.loops[i][1]+1 ){
                        this.currentFrame = this.loops[i][1];
                        this.isPlaying = false;
                    }
                    break;
                }
            }
            // Stop and Clear
			if( this.currentFrame >= this.ssa.length ){
                this.clearSp();
                this.clearEventListener();
                this.isPlaying = false;
			}
		});
	},
    /* ----------------------------------------------------------------
     * clearSp():void
     * 子要素のSpriteを全て削除する
     * ---------------------------------------------------------------- */
	clearSp: function(){
		for( var i=0; i<this.spList.length; i++ ){
			this.removeChild( this.spList[i] );
		}
	},
    /* ----------------------------------------------------------------
     * setPosition( _x, _y ):void
     * ( originX, otiginY )を基準点として座標指定する
     * ---------------------------------------------------------------- */
	setPosition: function( _x, _y ){
		this.x = _x - this.originX;
		this.y = _y - this.originY;
	},
    /* ----------------------------------------------------------------
     * getSpriteState( _layerName, _globalSwitch ):Object
     * 指定された子要素の座標と角度を取得する
     * ---------------------------------------------------------------- */
    getSpriteState: function( _layerName, _globalSwitch ){
        var ret = {};
        var id = -1;
        var r = 0;
        var dx = 0;
        var dy = 0;
        for( var i=0; i<this.parts.length; i++ ){
            if( this.parts[i] == _layerName ){
                id = i-1;
            }
        }
        //
        if( id >= 0 ){
            if( _globalSwitch ){
                r = this.rotation * Math.PI / 180;
                dx = ( this.sp[id].x + this.sp[id].originX - this.originX ) * this.scaleX;
                dy = ( this.sp[id].y + this.sp[id].originY - this.originY ) * this.scaleY;
                ret = {
                    x: this.x + this.originX + ( Math.cos(r) * dx - Math.sin(r) * dy ),
                    y: this.y + this.originY + ( Math.sin(r) * dx + Math.cos(r) * dy ),
                    rotation: this.rotation + this.sp[id].rotation,
                    scaleX: this.sp[id].scaleX,
                    scaleY: this.sp[id].scaleY
                };
            }else{
                ret = {
                    x: this.sp[id].x,
                    y: this.sp[id].y,
                    rotation: this.sp[id].rotation,
                    scaleX: this.sp[id].scaleX / this.scaleX,
                    scaleY: this.sp[id].scaleY / this.scaleY
                };
            }
        }else{
            ret = {};
        }
        return ret;
    },
    /* ----------------------------------------------------------------
     * gotoAndPlay( _frame ):void
     * アニメーションを指定したフレームから再生する
     * ---------------------------------------------------------------- */
	gotoAndPlay: function( _frame ){
		if( _frame >= 0 && _frame < this.totalFrames ){
			this.currentFrame = _frame;
		}
	},
    /* ----------------------------------------------------------------
     * getCurrentFrame():uint
     * アニメーションの現在再生されているフレーム数(小数値)を取得する
     * ---------------------------------------------------------------- */
	getCurrentFrame: function(){
		return this.currentFrame;
	},
    /* ----------------------------------------------------------------
     * getMaxFrame():uint
     * アニメーションのトータルフレーム数を取得する
     * ---------------------------------------------------------------- */
	getTotalFrames: function(){
		return this.totalFrames;
	},
    /* ----------------------------------------------------------------
     * setVisible( _bool ):void
     * アニメーション全体の表示/非表示を設定する
     * ---------------------------------------------------------------- */
	setVisible: function( _bool ){
		this.isVisible = _bool;
	},
    /* ----------------------------------------------------------------
     * isPlaying():Boolean
     * アニメーションが再生中かどうか（ループで特定フレームに固着されていないか）
     * ---------------------------------------------------------------- */
	isPlaying: function(){
		return this.isPlaying;
	},
    /* ----------------------------------------------------------------
     * (※)setClip( _b ):void
     * 既定サイズでクリッピング処理を行う
     * (※SpriteGroupクラスを継承した場合のみ機能)
     * ---------------------------------------------------------------- */
    /*
	setClip: function( _b ){
		this._clipping = ( _b === undefined ) ? true : _b;
	},
    */
    /* ----------------------------------------------------------------
     * remove():void
     * 自分自身を削除する
     * ---------------------------------------------------------------- */
    remove: function(){
        this.clearSp();
        this.clearEventListener();
        delete this;
    }
});

