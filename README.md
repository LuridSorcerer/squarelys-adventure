# Squarely's Adventure
*A Graphics-free Top-down Adventure Game*

## How To Run

The game can be played in any modern web browser, but must be hosted by a web server. It is not sufficient to open the index.html file using the file:// protocol. 

The game can be played directly on Github using [Github Pages](https://luridsorcerer.github.io/squarelys-adventure/).

For local testing, I use the simple HTTP server provided by Python.

~~~
cd squarelys-adventure
python3 -m http.server 8080
~~~

## How To Play

Move using WASD or the arrow keys.

Blocks interact with Squarely based on their color:
- Black blocks are walls that cannot be moved or passed through.

- Yellow blocks are keys, which open the doors represented by blue blocks.

- Green blocks change Squarely's size and shape as he pushes against them.

- Magenta blocks can be pushed, provided that Squarely is bigger than they are. 

- White blocks are teleporters that will move Squarely to a new area. 

## Goals
- Mouse controls
- Touch controls
- Bug fixes
	- Can get stuck on corners
	- Can sometimes clip through pushblocks
- Pushblock collision against walls
- Finish pushblock demo area
- framerate independent color change
- level editor