---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
permalink: /index
---


# autodragonsweeper

**All credit for the original game Dragonsweeper goes to Daniel Benmergui.**

Please visit <a href="https://danielben.itch.io/dragonsweeper">https://danielben.itch.io/dragonsweeper</a> for its official release.

<a href="game.html"><img width="50%" src="writeup/autodragonsweeper_example.png " alt="Autodragonsweeper showcase" /></a>

<h1><a href = "docs/game.html"> Click here to play!</a> </h1>

After enjoying Dragonsweeper a lot, I decided to try and have a crack at solving it programmatically.

The main additions compared to the original game (v1.1.18):
- Tile monster hints (can turn off in settings)
    - Blue for known power
    - Red for upper limit on power (or optionally, a range between low:high)
- Clicking on the board performs 'free' actions when available (can turn off in settings)
    - Reveal tiles with 0 power
    - Taking xp
    - Level up when at 0hp
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

<h4> Coming soon </h4>
- A section on all the tricks used to glean information about the dungeon
- A section on how the solver picks its next move
- A more detailed section about the solver's performance and how we got there
- Advanced section (how to add more code? how to test?)