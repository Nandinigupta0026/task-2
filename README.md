Cyberscape
 
Cyberscape is a survival game set in the collapsing cyber-city of Cyberia. The central AI system AUREX is failing, and it's your job to collect keys, unlock data shards, avoid hostile towers, and save the city before it's too late.

 How to Play
Collect Keys scattered across the city.

Unlock Shards  using keys at the Central Hub (purple tile).

Deliver Shards  to the Base Station (cyan tile) to restore system health.

Avoid Towers  with red vision zones that damage you.

Shoot Bullets  that bounce off walls and can destroy towers.

Use Power-Ups:

 Health Boost

 Invisibility

 Speed Boost

You lose if:

System health drops to 0.

Your player health drops to 0.

You win if:

System health reaches 100%.

How I Made the Map and the Game
Map Creation
The game uses an HTML5 <canvas> to draw everything.

I divided the canvas into a grid of square tiles, each tile representing a part of the city.

Each tile is drawn with:

Green area for grass or walkable space.

Thick black borders to show roads.

Buildings (black boxes) are randomly placed inside the green areas and block the player’s movement.

A Central Hub (purple) and a Base Station (cyan) are randomly placed on different tiles each time the game starts.


Keys (🔑) are randomly spawned across the map. The player needs to collect them.

When enough keys are collected, the player can go to the Central Hub to unlock a data shard.

After unlocking, the player delivers the shard to the Base Station, which increases the system's health.
