<?php

/**
 * This sample app is provided to kickstart your experience using Facebook's
 * resources for developers.  This sample app provides examples of several
 * key concepts, including authentication, the Graph API, and FQL (Facebook
 * Query Language). Please visit the docs at 'developers.facebook.com/docs'
 * to learn more about the resources available to you
 */

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


/*****************************************************************************
 *
 * The content below provides examples of how to fetch Facebook data using the
 * Graph API and FQL.  It uses the helper functions defined in 'utils.php' to
 * do so.  You should change this section so that it prepares all of the
 * information that you want to display to the user.
 *
 ****************************************************************************/

require_once('sdk/src/facebook.php');

$facebook = new Facebook(array(
  'appId'  => AppInfo::appID(),
  'secret' => AppInfo::appSecret(),
  'sharedSession' => true,
  'trustForwarded' => true,
));

$user_id = $facebook->getUser();
if ($user_id) {
  try {
    // Fetch the viewer's basic information
    $basic = $facebook->api('/me');
  } catch (FacebookApiException $e) {
    // If the call fails we check if we still have a user. The user will be
    // cleared if the error is because of an invalid accesstoken
    if (!$facebook->getUser()) {
      header('Location: '. AppInfo::getUrl($_SERVER['REQUEST_URI']));
      exit();
    }
  }

  // This fetches some things that you like . 'limit=*" only returns * values.
  // To see the format of the data you are retrieving, use the "Graph API
  // Explorer" which is at https://developers.facebook.com/tools/explorer/
  $likes = idx($facebook->api('/me/likes?limit=4'), 'data', array());

  // This fetches 4 of your friends.
  $friends = idx($facebook->api('/me/friends?limit=4'), 'data', array());

  // And this returns 16 of your photos.
  $photos = idx($facebook->api('/me/photos?limit=16'), 'data', array());

  // Here is an example of a FQL call that fetches all of your friends that are
  // using this app
  $app_using_friends = $facebook->api(array(
    'method' => 'fql.query',
    'query' => 'SELECT uid, name FROM user WHERE uid IN(SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1'
  ));
}

// Fetch the basic info of the app that they are using
$app_info = $facebook->api('/'. AppInfo::appID());

$app_name = idx($app_info, 'name', '');

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