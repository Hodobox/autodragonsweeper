# autoDragonsweeper

**All credit for the original game Dragonsweeper goes to Daniel Benmergui.**

Please visit <a href="https://danielben.itch.io/dragonsweeper">https://danielben.itch.io/dragonsweeper</a> for its official release.


<table width="100%">
  <tr>
    <td width="50%"> <a href="game.html"> <img src="writeup/autodragonsweeper_example.png " alt="Autodragonsweeper example" /> </a> </td>
    <td width="50%"> <a href="game.html"> <img src="writeup/autodragonsweeper_showcase.gif" alt="Autodragonsweeper showcase"/> </a> </td>
  </tr>
</table>

<h1><a href = "game.html"> Click here to play!</a> </h1>

After enjoying Dragonsweeper a lot, I decided to try and have a crack at solving it programmatically.

The main additions compared to the original game (v1.1.18):
- Tile monster hints (can turn off in settings)
    - Blue for known power
    - Red for upper limit on power (or optionally, a range between low:high)
- Clicking on the board performs 'free' actions when available (can turn off in settings)
    - Reveal tiles with 0 power
    - Taking xp
    - Level up when at 0hp
    - Casting spells
    - Opening chests (when known not to be a mimic)
- Clicking on XP bar performs an action picked by an automated solver
- Dragon lair is now generated with some integer seed
    - See what your seed is, share it, and others can play the same dungeon!
    - You can find it in the monsternomicon

Looking for a challenge? Take a crack at some seed my solver doesn't solve:

`982076172, 103855545, 2600539032, 1236143507, 2117130815, 3968560058, 2730886631, 1663344264, 600097793, 1096928327, 198228856, 1865341857, 861855837, 450948120, 2118337003, 2747216787, 3474109513, 3675091304, 2403529648, 2795602454, 50962058, 181675942, 4106662133, 2267233549, 38037183, 3495307853, 3553396303`

Good luck!

Some quick statistics about the latest iteration of the solver:

```none
1000 games: 984 won, 922 cleared (62 won but failed to clear)
Had to risk it in 0.4% of won games; 3.2% when no clear, 0.2% when clear
Average early wall hits: 0.32 when cleared, 1.60 when won without clear, 1.12 when lost
Average mine king delay: 0.23 when cleared, 1.05 when won without clear
When lost, on average had 45.19 score
When won without clear, on average had 362.16 score
When won without clear, on average had 4.71 damage to go
When cleared, on average had 5.97 hp left over
Most hp left when cleared: 13 (happened 6 times)
Lost without risk: 0
```

You can find all the code in my [github repository](https://github.com/Hodobox/autodragonsweeper).

<h2> Figuring out the lair </h2>

So before I can try to come up with a strategy on what action to take, my solver will need some information first.
As much of it as possible. I will call the sum of everything the solver knows about the lair the *known game state*.
Yes, it's a singleton.

I would categorize the types of things we can know about the lair into four categories:

1. If a tile is unrevealed (or looks like a chest), what could be on this tile
2. What a set of tiles must contain (e.g. 4 corner tiles = one of them must be the Mine King)
3. If a tile is revealed, what *used* to be on this tile (e.g. it's empty, but it was a Big Slime, or a chest, ...)
4. What game-changing actions we have performed (e.g. found the Dragon Egg, killed the Wizard, killed the Rat King, ...)

Knowledge of types 3 and 4 is relatively straightforward to obtain and store.
For type 3, for each tile I just record what the entity is the first time it's figured out.
For type 4, just detect when a game-changing action is being performed (clicking a spell, ...) and individually note it down in the known game state.

Knowledge of type 1 and 2 is the real problem, and we must utilize monster patterns and relationships between the knowledge we already have to deduce more of it.
Type 1 knowledge boils down to keeping track, for each tile, what set of objects could be there. Knowledge of type 2 is more complex, because it involves
relationships between sets of squares. In my implementation, this knowledge is not persisted; at several points it is computed,
used either to deduce knowledge of type 1 or to make a decision in the solver, and then it is discarded.

So 90% of all the information gathering are deduction rules, using the available knowledge of all types to obtain more knowledge of type 1. In particular, since
the set of possible objects for a given tile can never grow when we obtain more information about it, it essentially boils down to ruling out the possibilities
for each tile and removing that object from its set.

Oh, and at the beginning, we of course must know what possible objects could be on each square.

<details markdown=1>
<summary> Click here if you want the list </summary>

- Empty, Wall, Gnome, Medikit, Chest, Rat, Bat, Skeleton, Gargoyle, Slime, Rat King, Gazer, Minotaur, Mimic in every tile
- Romeo & Juliet on any tile not in the middle column
- Guard on any tile not in the middle column or Dragon's row
- Mine King in the corners
- Wizard on the edge but not in the corner
- Big Slime on the edge or near the edge
- Dragon Egg neighboring the Dragon
- Dragon in the middle

</details>

<br>
We'll get down to all the rules in a jiffy, but in case you stumble on some term I'm using, here's your

<details markdown=1>
<summary> <b>Glossary</b> </summary>

- the number displayed on a revealed empty tile is its *attack number*
- the set of possible objects in a tile are its *possible actors*
- if we know the power of a tile, that's its *known power*
- if we additionally know exactly what is on the tile, that's its *known actor*
- a tile for which we don't know its power is an *unknown* tile
- the tiles directly next to a tile in the 4 basic directions are its *cross neighbors*
- the (up to) 8 tiles surrounding a tile are its *neighbors*

</details>

<h3> The very basics </h3>

- If we have a tile with an attack number, and the known powers of its neighbors sum up to this number, then all the unknown neighbors are 0s

And so we will rule out all monsters from these unknown neighbors.

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/0_rule_before.png " alt="0 rule before" />  </td>
    <td width="50%"> <img src="writeup/0_rule_after.png" alt="0 rule after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> 1+3+3+2+13 = 21 </td>
  </tr>
</table>


- If we have a tile with an attack number, and we known the power of every neighbor except of one, we can work out this unknown tile's power

And so we will rule out all monsters from this tile which don't have exactly this power.

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/1_rule_before.png " alt="1 rule before" />  </td>
    <td width="50%"> <img src="writeup/1_rule_after.png" alt="1 rule after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> 17-3-4-6 = 4 </td>
  </tr>
</table>

- If we have a tile with an attack number A, and the sum of the known powers of its neighbors is K, then its unknown neighbors must have power at most A-K

(this is technically a generalized version of the first rule, but I added this one later)

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/at_most_x_before.png " alt="at most X before" />  </td>
    <td width="50%"> <img src="writeup/at_most_x_after.png" alt="at most X after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> 113-(100+4+4+4) = 1 </td>
  </tr>
</table>

<h3> Too big and too small </h3>

- If we have a tile with attack number A, and the sum of the lowest possible powers of all neighbors except one is L, then the unaccounted-for 
neighbor's power is at most A-L

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/too_big_before.png " alt="too big before" />  </td>
    <td width="50%"> <img src="writeup/too_big_after.png" alt="too big after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> For the unknown 5 and 6, 6-(2+0s) = 4; so they must be <= 4 </td>
  </tr>
</table>

- Analogously we can do the same thing from below: if a tile has attack number A, and the
sum of the maximum possible powers of all neighbors except one is M, then the last unaccounted-for neighbor;s power is at least A-M

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/too_small_before.png " alt="too small before" />  </td>
    <td width="50%"> <img src="writeup/too_small_after.png" alt="too small after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> 111-(100+2+1+2+0s)-6 = 2, so top-left square is at least 2 </td>
  </tr>
</table>

We do this separately for mines and creatures (even if a tile shows 105, and its neighbor could be a mine with power 100, in terms of creatures
it could be at most a 5, so this puts limits on the creatures that can be in the other neighbors). So in the example above, we are really doing
11 - (... + strongest creature which could be on the mine's square).

<h3> Utilizing type 4 knowledge </h3>

Knowledge gained from game-changing actions is pretty straightforward

- If we disarmed the mines, no tile can contain a mine, and those which we knew were mines becomes treasures instead (...kind of. Works well enough
for our purposes)

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/disarm_mines_before.png " alt="disarm mines before" />  </td>
    <td width="50%"> <img src="writeup/disarm_mines_after.png" alt="disarm mines after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> We would've known 100->0 even if other rules couldn't deduce it </td>
  </tr>
</table>

- If we revealed slimes, every tile that isn't a revealed slime cannot contain a slime

This helps us because if we find a 5 after revealing slimes (and we know it's not a gazer because of the lack of ?), we know it's the Rat King himself!

- If we revealed rats, every tile that isn't a revealed rat cannot contain a rat

This helps because if we know a tile isn't power 0, it must be at least a 2. Boosts the power of the rules described in the previous section!

<h3> Simple category 2 rules </h3>

Some enemies in the game exist only once. Once you've found them, they can't be anywhere else:

- Mimic
- Rat King
- Wizard
- Mine King

So once we spot them, we rule them out from all other tiles.

Additionally, we know that exactly one corner square contains the Mine King. So, if we know he isn't in three of the corners, we can
tell he's in the fourth.

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/mineking_before.png " alt="mineking before" />  </td>
    <td width="50%"> <img src="writeup/mineking_after.png" alt="mineking after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> No other place for the Mine King other than top-right </td>
  </tr>
</table>

- If there is a tile with X mines not found around it, and there are X tiles among its neighbors that could be mines, well, they have to be there

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/mines_before.png " alt="mines before" />  </td>
    <td width="50%"> <img src="writeup/mines_after.png" alt="mines after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> Boom and Boom </td>
  </tr>
</table>


<h3> Fancy type 2 rules </h3>

You're about to learn some Dragonsweeper.

- Romeo & Juliet (a.k.a. the lovers (but technically `ActorId.Giant`)) 
    - ...are in the same row, looking at one another, at equal distance from the center.

So, if you find one, the other one's in the same row and with the opposite column index.

<table width="50%">
  <tr>
    <td width="100%"> <img src="writeup/found_lovers.png " alt="found the lover" />  </td>
  </tr>
  <tr>
    <td width="100%" style="text-align:center"> She's all the way over there! </td>
  </tr>
</table>

The inverse is also true - if a tile
cannot contain a lover, its column-mirrored tile also does not.

<table width="50%">
  <tr>
    <td width="100%"> <img src="writeup/no_lovers.png " alt="no lover check" />  </td>
  </tr>
  <tr>
    <td width="100%" style="text-align:center"> No lover right to the left of the 26? No lover to right to the right of the 26, either! </td>
  </tr>
</table>

And also, once we found them, we know they don't appear anywhere else.

- Walls
    - ...come in pairs!

A wall is always a cross neighbor of another wall. So, if you found a wall, and there's no wall in 3 directions... it's in the fourth one!

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/wall_before.png " alt="wall before" />  </td>
    <td width="50%"> <img src="writeup/wall_after.png" alt="wall after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> No other place to build the wall. Oh, hi Mine King! </td>
  </tr>
</table>

- Gargoyles
    - Gargoyle**s**, plural. They come in pairs, same as walls! So the same argument works as before for walls. 
    
Even better, if you reveal one, it is looking straight at the other one!

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/gargoyles_before.png " alt="gargoyles before" />  </td>
    <td width="50%"> <img src="writeup/gargoyles_after.png" alt="gargoyles after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> The top gargoyle is looking straight at its twin <br> The bottom gargoyle, even if it was unrevealed, only has 1 space for its twin </td>
  </tr>
</table>

- Minotaurs
    - Yell at you when you open their chest for a reason. It's *their chest*. 5 chests and 5 minotaurs. Coincidence? I think not!

If you find a minotaur, and you didn't find a chest near him, and there is only 1 possible space left for it to be... there it is!

If you find a chest, and you didn't find a minotaur near it, and there is only 1 possible space left for him to be... there he is!

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/minotaur_before.png " alt="minotaur before" />  </td>
    <td width="50%"> <img src="writeup/minotaur_after.png" alt="minotaur after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> The 3 in the middle used to be a minotaur <br> Only neighbor that could be a chest is bottom left </td>
  </tr>
</table>

This never happens. In the couple thousand games I've tested, this rule was not triggered even once. I can force it if I purposefuly try to set it up though!

What does happen is a fun corollary - a chest without any minotaur around it is definitely a mimic.

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/mimic_before.png " alt="mimic before" />  </td>
    <td width="50%"> <img src="writeup/mimic_after.png" alt="mimic after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> The 123 used to be a bat. No minotaur next to that chest? Exposed! </td>
  </tr>
</table>

- Guards
    - ...practice social distancing. Have you noticed each guard has a red pixel on his shield, in one of its quarters? 
    That's because the guard is in that quarter of the lair! And he guards it alone.

If you spot a guard, he's the only one in that quadrant (isolated by the central column and Dragon's row).

<table width="100%">
  <tr>
    <td width="50%"> <img src="writeup/guard_before.png " alt="guard before" />  </td>
    <td width="50%"> <img src="writeup/guard_after.png" alt="guard after"/> </td>
  </tr>
  <tr>
    <td colspan="2" width="100%" style="text-align:center"> Top-right guard with top-right pixel <br> Note how at-most-7s became 6s </td>
  </tr>
</table>


<h3> Hunt for the wizard </h3>

Slimes too far

no neighbor slime

adj slime

edge slimes

intersection

<h3> Gaze into your soul </h3>

Numbers invalidate gazers

? with only 1 option

<h3> Even fancier type 2 rules </h3>

v0, v1, v2, v3

<h3> ...and with mines separately <h3>


... and clear some out!


<h3> What's left </h3>

gnomes and empty tiles near heals!

elimination of impossible slime pairs/triplets from nearby attack number, or proper placing everywhere

counting enemies

trying subsets

dual-gazer hunting

<h3> How to not know everything and not have 10 FPS </h3>

Of course, if you take the current known game state and apply all the rules one after the other, you may gain more knowledge, and this knowledge might make it
possible to obtain more knowledge if you applied them again. So, we want to apply the rules over and over. Initially I was simply running through all the rules
at every frame of the game, however this soon made the game perform very poorly (since many checks go through many pairs of tiles), so I had to figure out
a way to detect when the rules weren't making any new deductions, and resume only once an action has been taken. So, each time, after we're done, we sum up the
sizes of the possible actors sets for all the tiles, and compare it to the same value from before we started. If these numbers are different, we note in our state
that the last update was *meaningful*, otherwise that it wasn't. In each frame, we go try and update our knowledge only if an action was taken, or if the last
update was meaningful. This works great, because if after an action we can only deduce things once, we stop quickly, if we get to make deductions further
and further down the grid, it will keep going as long as needed. Yay, optimized!

<h4> Coming soon </h4>

- A section on all the tricks used to glean information about the dungeon
- A section on how the solver picks its next move
- A more detailed section about the solver's performance and how we got there
- Advanced section (how to add more code? how to test?)