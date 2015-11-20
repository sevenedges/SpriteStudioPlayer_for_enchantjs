# SpriteStudioPlayer_for_enchantjs
Play animation characters made by SpriteStudio on enchant.js

<h2>はじめに</h2>
<p>SpriteStudioで作成されたアニメーションをenchant.jsで扱うためのライブラリ（とサンプル）です。<br/>
"SpriteStudio Player For HTML5"を利用しているため、そちらの仕様変更などで利用できなくなる可能性があります。<br/>
（公式のアップデート予定がないらしいので仕様変更も何もなさそうですが）</p>

<h2>利用手順</h2>
<ul>
<li>SpriteStudioのエクスポート機能で、*.ssaxを書き出します</li>
<li>SsToHtml5を使って、*.ssaxから*.jsを生成します。必要なら複数生成します</li>
<li>sample.htmlの記述に倣って、上記の*.jsおよびSSPlayer.jsを読み込みます</li>
<li>SSPlayerクラスとしてアニメーションを表示できます</li>
</ul>

<h2>サンプルについて</h2>
<p>ファイル構成を維持した状態でsample.htmlをブラウザで開いてください。<br/>
画面をクリックすると新しいキャラクタが生成されます。モーション、サイズ、再生速度はランダムです。<br/>
最大数（初期設定は12）を超えると古いものは消えます。</p>
<p>※こちらで動作確認できます。http://www.7edges.net/SSPlayer/sample.html</p>

<h2>SSPlayerクラスについて</h2>
<p>SSPlayer.js内にコメントを書いていますので、そちらを参照してくださいｗ<br/>
私も２年前に書いたのでかなり忘れてる…ではなんなので、幾つか補足します。</p>
<ul>
<li>SsToHtml5でサポートされない機能はサポートされません（頂点変形など）</li>
<li>Groupクラスを継承しています。Spriteクラスではありません</li>
<li>当たり判定などSpriteクラスの機能を利用したい場合、mixing.enchant.jsを利用すると幸せになれるかもしれません</li>
<li>setClipは矩形にクリップする機能ですが、mixing.enchant.jsの利用を前提にしているため現状はコメントアウトしています</li>
<li>再生速度を変更できます（_stepsオプションを参照）</li>
<li>アニメーションを途中で切り替える前提では設計されていません（やれば出来そうですけど）</li>
<li>その代わり、特定フレーム区間のみをループ再生する機能があります（_loopsオプションを参照）</li>
<li>再生フレームコントロールに関する幾つかのメソッドがあります</li>
<li>セルの設定について手抜きしていますｗ（_isRedrawオプションを参照）</li>
<li>上下左右反転に関してバグがあります（いまさら反転は使わないのが吉）</li>
</ul>

