# Research

| Contents |
|----------|
|[Feature List](#feature-list)|
|[Other Programs](#other-programs)|
|[Frameworks](#frameworks)|

## Feature List

### Core Features

- Stat blocks
    - Must pop up on page
    - Full stat block not just summary
- Easily editable creatures
    - HP
        - "+" and "-" buttons
    - Temp HP
    - Max HP
    - AC
    - Conditions
    - Spells
    - Initiative order (drag and drop is nice)
    - Concentration
- Player view
    - Specific stats and entire creatures hideable from player view
- Nice home page
- Saveable/loadable encounters.
- Condensed menu for options for each creature

### Bonus Features

- AI Encounter Generation
- Transformation (wildshape)
- Stat block editor
- Lock creatures to keep them in encounter space on reset/clean
- Character sheet sync
- Avatars for PCs

## Other Programs

Some brief (incomplete) notes on some other encounter managers that already exist.

Overall, the D&D Battle Tracker does a great job - it just lacks some finishing touches.

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

## Frameworks

Some ideas for frameworks to use to build:
- React (probably NextJS with TS)
- You can create websites in Go
- Hugo
- EmberJS
