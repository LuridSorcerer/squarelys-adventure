<?php

// Provides access to app specific values such as your app id and app secret.
// Defined in 'AppInfo.php'
require_once('AppInfo.php');

// Enforce https on production
if (substr(AppInfo::getUrl(), 0, 8) != 'https://' && $_SERVER['REMOTE_ADDR'] != '127.0.0.1') {
  header('Location: https://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
  exit();
}

// This provides access to helper functions defined in 'utils.php'
require_once('utils.php');

?>
<html>

<head>
<meta charset="UTF-8" />
<title>Squarely's Adventure</title>
<style>
head, body { margin: 0px;}
</style>
</head>

<body>

    <script>

      window.fbAsyncInit = function() {
        FB.init({
          appId      : '320216424781470',
          xfbml      : true,
          version    : 'v2.4'
        });
      };

      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    </script>

<!--
<h3 align="center">Squarely's Adventure</H3>
-->

<canvas style="padding-left:0; padding-right:0; margin-left:auto; margin-right:auto; display:block; position:relative"
 id="canvas"  width="640" height="480">
Crap, looks like your browser doesn't do canvas. Sorry about all this, but it's going to be quite impossible to play the game without that capability.
</canvas>

<!--
<section id="instructions">
	<p>Squarely is a mild-mannered square, with a red pulse of life. He needs help doing... some currently-undefined objective. Please, help guide him in his quest (or whatever)!</p>
	<p>Controlling Squarely is a simple matter of pressing the arrow keys in the direction you would like him to go. Alternatively, you could press the W,A,S, and D keys.</p>
	<p>In addition to being able to move around, Squarely can also change size. When he presses up against a green block, he grows or shrinks in size to match that block. The larger he is, the faster he can move. Being smaller allows our brave hero to navigate smaller hallways.</p>
	<p>Our brave adventurer can also rotate, in order to navigate dungeons more effectively. Press ENTER to make him pivot at his top left corner.</p>
	<p>Squarely is not the only citizen of the world. When Squarely steps on one of these people, they'll give him a message.</p>
</section>
-->

<!--
<form>
Blocks rendered:<input type="text" id="info"/>
</form>
-->

<script type="text/javascript" src="sqadv.js"></script>

</body>

</html>