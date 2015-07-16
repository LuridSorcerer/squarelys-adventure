<?php

?>
<html>

<head>
<meta charset="UTF-8" />
<title>Squarely's Adventure</title>
<style>
html, body { margin: 0px;}
</style>
</head>

<body>

<!-- Facebook code -->
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '320216424781470',
      xfbml      : true,
      version    : 'v2.4'
    });


	function onLogin(response) {
	  if (response.status == 'connected') {
		FB.api('/me?fields=first_name', function(data) {
		  var welcomeBlock = document.getElementById('fb-welcome');
		  welcomeBlock.innerHTML = 'Hello, ' + data.first_name + '!';
		});
	  }
	}

	FB.getLoginStatus(function(response) {
	  // Check login status on load, and if the user is
	  // already logged in, go directly to the welcome message.
	  if (response.status == 'connected') {
		onLogin(response);
	  } else {
		// Otherwise, show Login dialog first.
		FB.login(function(response) {
		  onLogin(response);
		}, {scope: 'user_friends, email'});
	  }
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

<h1 id="fb-welcome"></h1>

<!-- End Facebook code -->

<canvas style="padding-left:0; padding-right:0; margin-left:auto; margin-right:auto; display:block; position:relative"
 id="canvas"  width="640" height="480">
Crap, looks like your browser doesn't do canvas. Sorry about all this, but it's going to be quite impossible to play the game without that capability.
</canvas>

<script type="text/javascript" src="sqadv.js"></script>

</body>

</html>