# Research

| Contents |
|----------|
|[Other Programs](#other-programs)|
|[Frameworks](#frameworks)|

> The [Feature list](https://docs.google.com/document/d/1gcp4wCQ_KJGpyJuejGjFVm9OYXVAI7gMLL2YEeMQ00k/edit?usp=sharing) Doc

---

## Other Programs

Some brief (incomplete) notes on some other encounter managers that already exist.

Overall, D&D Beyond and the D&D Battle Tracker do well - they just lack some features that are nice quality of life features for a DM.

| Encounter Managers |
|----------|
|[Kobold Fight Club](#kobold-fight-club--improved-initiative)|
|[DnDEM](#dndem)|
|[D&D Battle Tracker](#dd-battle-tracker)|
|[Shieldmaiden](#shieldmaiden)|
|[D&D Beyond](#dd-beyond)|

### Kobold Fight Club / Improved Initiative

> [Kobold Fight Club](https://koboldplus.club/) and [Improved Initiative](https://improvedinitiative.app/e/)

Like:
- AI generation.
- Drag and drop editable interface.
- Stat block popup when you click on a creature.
- Library management and stat block editing.
- Damage/Heal creatures
- Player View

Dislike:
- Clicking the health bar multiple times opens a bunch of edit boxes, rather than open/close 1.
- You also have to enter a negative number to heal.
- Encounter library is not well implemented.
- No home screen - line between encounters is blurry
- Not many options to edit creatures.

### DnDEM

> [DnDEM](https://brianwendt.github.io/dndem/#/)

Like:
- Downloadable encounters.
- Easily editable HP and Initiative, although you have to do the math and put in the actual value rather than a change.
- Easy to add custom or existing creature.

Dislike:
- No drag and drop editing for initiative.
- No stat blocks.
- Super lightweight - missing a lot of the features on the list.

### D&D Battle Tracker

> [D&D Battle Tracker](https://dndbattletracker.com/)

Like:
- Easy to add custom or existing creatures.
- Per creature in intiative (custom or standard)
    - Healing has options to easily heal or damage, as well as temp hp and max hp modifiers.
    - AC can be modified
    - Condition tracker
    - Notes
    - Spell slot tracking
- Downloadable
- Player view (share battle)
    - health can be unshared (otherwise it is a description not a value)
    - entire creature can be unshared (bug where it cannot be unshared if it is that creature's turn)
- Menu for each creature collapses to keep the page less cluttered
- Creatures whose turn it is not are condensed
- Lock creatures to keep them around when you clean the manager

Dislike:
- Stat block just links to D&D Beyond stat block instead of displaying on page.
    - Not even creature actions are displayed on page.
- No concentration (minor point).
- No character sheet sync.

### Shieldmaiden

> [Shieldmaiden](https://shieldmaiden.app/)

Like:
- Stat blocks
- Per creature in intiative (custom or standard)
    - Healing has options to easily heal or damage, as well as temp hp and max hp modifiers.
    - AC can be modified
    - Condition tracker
    - Notes
    - Spell slot tracking
    - Concentrating reminder
- Actions tab
- Transform to kep track of wildshape type stuff
- Character sheet sync to D&D Beyond and Dicecloud

Dislike:
- User interface is not all that great.
    - Appearance
    - Appearing/disappearing side menu is annoying

### D&D Beyond

> [D&D Beyond](https://www.dndbeyond.com/my-encounters)

Like:
- Character sheet integration (shows PC hit points, AC, speed, etc)
    - IF they are using DDB character sheets
- All monsters are available
- Homebrew monsters (if you have already built the stat block in DDB) are easily used
- Autoroll initiative for non-PCs
- Saves state
- Displays stat block on screen

Dislike:
- Manual entries are a pain
- Cannot add a creature mid-combat
- No condition tracker
- No way to keep track of spell slots
- Slow

---

## Frameworks

Frontend - React with tanstack
Backend - Go
Database - Firebase

Frontend responsible for animations, styling
Backend responsible for stat block generation
