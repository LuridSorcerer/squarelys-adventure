# Squarely's Adventure
*A Graphics-free Top-down Adventure Game*

## How To Run

The game can be played directly in a browser using [Github Pages](https://luridsorcerer.github.io/squarelys-adventure/).

For locally hosting the game, opening index.html in your browser using
the file:// protocol will not work. For local testing, I use the HTTP
server module provided by Python.

~~~
cd squarelys-adventure
python3 -m http.server 8080
~~~

Any basic HTTP server that can serve static pages should be sufficient. 

## How To Play

Move using WASD or the arrow keys. Mouse and touch control are also 
supported.

Blocks interact with Squarely based on their color:
- Black blocks are walls that cannot be moved or passed through.

- Yellow blocks are keys, which open the doors represented by blue blocks.

- Green blocks change Squarely's size and shape as he pushes against them.

- Magenta blocks can be pushed, provided that Squarely is bigger than they are. 

- White blocks are teleporters that will move Squarely to a new area. 

## Goals
- Pushblock collision against walls
- Finish pushblock demo area
- level editor
